import React, { useEffect, useMemo, useState } from "react";
import api from "~/api/client";
import styles from "./UserStateEdit.module.css";

export default function UserStateEdit({
  open,
  onClose,
  userId,
  catalog: catalogProp,           // optional; if empty we fetch
  selections: selectionsProp,     // [{ key, assignedAt }]
  onSaved,                        // (selections, catalog) after save
  canEditCatalog = true,
}) {
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const [localCatalog, setLocalCatalog]   = useState(catalogProp || []);
  const [localSelKeys, setLocalSelKeys]   = useState(new Set((selectionsProp||[]).map(s => s.key)));
  const [editingKey,   setEditingKey]     = useState(null);
  const [editLabel,    setEditLabel]      = useState("");
  const [newLabel,     setNewLabel]       = useState("");

  // reset when opened
  useEffect(() => {
    if (!open) return;
    setLocalCatalog(catalogProp || []);
    setLocalSelKeys(new Set((selectionsProp||[]).map(s => s.key)));
    setEditingKey(null);
    setEditLabel("");
    setNewLabel("");
    setError("");
  }, [open, catalogProp, selectionsProp]);

  // fetch catalog if parent didn't supply
  useEffect(() => {
    let cancelled = false;
    if (!open) return;
    if (Array.isArray(catalogProp) && catalogProp.length) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/catalog`);
        if (!cancelled) setLocalCatalog(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!cancelled) setError("Could not load catalog");
        console.error("GET /catalog failed", e?.response?.status, e?.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, catalogProp]);

  const byKey = useMemo(() => {
    const m = new Map();
    (localCatalog||[]).forEach(o => m.set(o.key, o));
    return m;
  }, [localCatalog]);

  if (!open) return null;

  const toggle = (key) => {
    const next = new Set(localSelKeys);
    next.has(key) ? next.delete(key) : next.add(key);
    setLocalSelKeys(next);
  };

  const move = (index, dir) => {
    const to = index + dir;
    if (to < 0 || to >= localCatalog.length) return;
    const next = [...localCatalog];
    const [item] = next.splice(index,1);
    next.splice(to,0,item);
    setLocalCatalog(next);
  };

  const startRename = (key) => {
    setEditingKey(key);
    setEditLabel(byKey.get(key)?.label ?? "");
  };

  const saveRename = () => {
    const label = editLabel.trim();
    if (!label || label.length > 30) return;
    if (localCatalog.some(o => o.key !== editingKey && o.label.toLowerCase() === label.toLowerCase())) return;
    setLocalCatalog(localCatalog.map(o => o.key === editingKey ? { ...o, label } : o));
    setEditingKey(null);
    setEditLabel("");
  };

  const addNew = async () => {
    const label = newLabel.trim();
    if (!label || label.length > 30) return;

    try {
      setSaving(true);
      // create in backend to keep key/order consistent
      const { data } = await api.post(`/catalog`, { label });
      const item = data?.item;
      if (item) {
        setLocalCatalog(prev => [...prev, item]);
        setNewLabel("");
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Add failed");
      console.error("POST /catalog failed", e?.response?.status, e?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    // keep selections that exist in the current catalog
    const keysAvailable = new Set(localCatalog.map(c => c.key));
    const selectedKeys = Array.from(localSelKeys).filter(k => keysAvailable.has(k));

    try {
      setSaving(true);
      const { data } = await api.patch(`/users/${userId}/state-indicators`, { selectedKeys });
      // backend returns selections [{key, assignedAt}] with preserved or new dates
      onSaved && onSaved(data?.selections || [], localCatalog);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.error || "Save failed");
      console.error("PATCH /users/:id/state-indicators failed", e?.response?.status, e?.message);
    } finally {
      setSaving(false);
    }
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
              Select states
              {loading && <span style={{marginLeft:8, opacity:.7}}>(loading…)</span>}
              {error && <span style={{marginLeft:8, color:"red"}}>— {error}</span>}
            </div>

            <ul className={styles.list}>
              {localCatalog.map((opt, idx) => (
                <li key={opt.key} className={styles.item}>
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={localSelKeys.has(opt.key)}
                      onChange={() => toggle(opt.key)}
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
                          <button className={styles.smallBtn} onClick={saveRename} disabled={saving}>Save</button>
                          <button className={styles.smallBtn} onClick={() => {setEditingKey(null); setEditLabel("");}} disabled={saving}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className={styles.smallBtn} onClick={() => move(idx,-1)} aria-label="Move up" disabled={saving}>↑</button>
                          <button className={styles.smallBtn} onClick={() => move(idx,+1)} aria-label="Move down" disabled={saving}>↓</button>
                          <button className={styles.smallBtn} onClick={() => startRename(opt.key)} aria-label="Rename" disabled={saving}>Rename</button>
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
                <button className={styles.addBtn} onClick={addNew} disabled={saving || !newLabel.trim()}>
                  {saving ? "Adding…" : "Add"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.actions}>
            <button className={styles.secondaryBtn} onClick={onClose} disabled={saving}>Cancel</button>
            <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
