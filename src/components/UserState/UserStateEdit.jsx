import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./UserStateEdit.module.css";

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s]+/g, "").trim().replace(/\s+/g, "-");

export default function UserStateEdit({
  open,
  onClose,
  catalog,            // parent may pass initial list; we fetch only if this is empty
  selectedKeys,
  onSave,
  canEditCatalog = true,
  apiBase = process.env.REACT_APP_APIENDPOINT,
  useToken = true,     // set false if your endpoint is public
}) {
  const [localCatalog, setLocalCatalog] = useState(catalog || []);
  const [localSelected, setLocalSelected] = useState(new Set(selectedKeys || []));
  const [newLabel, setNewLabel] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset state whenever the dialog opens
  useEffect(() => {
    if (open) {
      setLocalCatalog(catalog || []);
      setLocalSelected(new Set(selectedKeys || []));
      setNewLabel("");
      setEditingKey(null);
      setEditLabel("");
      setError("");
    }
  }, [open, catalog, selectedKeys]);

useEffect(() => {
  let cancelled = false;
  if (!open) return;
  setLocalCatalog(catalog || []);
  setLocalSelected(new Set(selectedKeys || []));
  setError("");
  (async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${apiBase}/user-states/catalog`, {
        headers: {
          Accept: "application/json",
        },
      });

      const items = Array.isArray(data?.items) ? data.items : [];
      if (cancelled) return;

      // overwrite local catalog with API data
      setLocalCatalog(items);

      // reconcile selection against the new catalog
      const validKeys = new Set(items.map(i => i.key));
      setLocalSelected(prev => {
        const next = new Set();
        for (const k of prev) if (validKeys.has(k)) next.add(k);
        return next;
      });
    } catch (e) {
      if (!cancelled) setError("Could not load options");
      console.error("user-states/catalog failed", e?.response?.status, e?.message);
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();

  return () => { cancelled = true; };
}, [open, apiBase, useToken, catalog, selectedKeys]);


  const byKey = useMemo(() => {
    const map = new Map();
    (localCatalog || []).forEach(o => map.set(o.key, o));
    return map;
  }, [localCatalog]);

  if (!open) return null;

  const toggleKey = (key) => {
    const next = new Set(localSelected);
    next.has(key) ? next.delete(key) : next.add(key);
    setLocalSelected(next);
  };

  const moveItem = (index, dir) => {
    const to = index + dir;
    if (to < 0 || to >= localCatalog.length) return;
    const next = [...localCatalog];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    setLocalCatalog(next);
  };

  const labelExists = (label, exceptKey = null) =>
    localCatalog.some(o =>
      o.label.trim().toLowerCase() === label.trim().toLowerCase() &&
      (exceptKey ? o.key !== exceptKey : true)
    );

 const handleAdd = async () => {
  const label = newLabel.trim();
  if (!label) return;
  if (label.length > 30) return;
  if (labelExists(label)) return;

  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    const { data } = await axios.post(
      `${apiBase}/user-states/catalog`,
      { label }, 
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (data?.item) {
      setLocalCatalog([...localCatalog, data.item]);
      setNewLabel("");
    }
  } catch (err) {
    console.error("Add catalog item failed:", err);
    setError(err?.response?.data?.error || "Could not add item");
  } finally {
    setLoading(false);
  }
};


  const startEdit = (key) => {
    setEditingKey(key);
    setEditLabel(byKey.get(key)?.label ?? "");
  };

  const saveEdit = () => {
    const label = editLabel.trim();
    if (!label) return;
    if (label.length > 30) return;
    if (labelExists(label, editingKey)) return;

    const next = localCatalog.map(o =>
      o.key === editingKey ? { ...o, label } : o
    );
    setLocalCatalog(next);
    setEditingKey(null);
    setEditLabel("");
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditLabel("");
  };

  const handleSaveAll = () => {
    // Only keep selections that still exist
    const keys = new Set(localCatalog.map(c => c.key));
    const normalizedSelected = Array.from(localSelected).filter(k => keys.has(k));
    onSave(normalizedSelected, localCatalog);
    onClose();
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>User State</h3>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.left}>
            <div className={styles.sectionTitle}>
              Select states {loading && <span style={{ marginLeft: 8, opacity: 0.7 }}>(loading…)</span>}
              {error && <span style={{ marginLeft: 8, color: "red" }}>— {error}</span>}
            </div>

            <ul className={styles.list}>
              {localCatalog.map((opt, idx) => (
                <li key={opt.key} className={styles.item}>
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={localSelected.has(opt.key)}
                      onChange={() => toggleKey(opt.key)}
                    />
                    {editingKey === opt.key ? (
                      <input
                        className={styles.editInput}
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        maxLength={30}
                      />
                    ) : (
                      <span className={styles.optionLabel}>{opt.label}</span>
                    )}
                  </label>

                  {canEditCatalog && (
                    <div className={styles.controls}>
                      {editingKey === opt.key ? (
                        <>
                          <button className={styles.smallBtn} onClick={saveEdit}>Save</button>
                          <button className={styles.smallBtn} onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            className={styles.smallBtn}
                            onClick={() => moveItem(idx, -1)}
                            aria-label="Move up"
                          >↑</button>
                          <button
                            className={styles.smallBtn}
                            onClick={() => moveItem(idx, +1)}
                            aria-label="Move down"
                          >↓</button>
                          <button
                            className={styles.smallBtn}
                            onClick={() => startEdit(opt.key)}
                            aria-label="Rename"
                          >Rename</button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {canEditCatalog && (
            <div className={styles.right}>
              <div className={styles.sectionTitle}>Add new</div>
              <div className={styles.addRow}>
                <input
                  className={styles.addInput}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Enter Text"
                  maxLength={30}
                />
                <button className={styles.addBtn} onClick={handleAdd}>Add</button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.actions}>
            <button className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
            <button className={styles.primaryBtn} onClick={handleSaveAll}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
