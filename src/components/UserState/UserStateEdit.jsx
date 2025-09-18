import React, { useMemo, useState } from "react";
import styles from "./UserStateEdit.module.css";

export default function UserStateEdit({
  open,
  onClose,
  catalog,
  selectedKeys,
  onSave,
  canEditCatalog = true,
}) {
  const [localCatalog, setLocalCatalog] = useState(catalog);
  const [localSelected, setLocalSelected] = useState(new Set(selectedKeys));
  const [newLabel, setNewLabel] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  React.useEffect(() => {
    if (open) {
      setLocalCatalog(catalog);
      setLocalSelected(new Set(selectedKeys));
      setNewLabel("");
      setEditingKey(null);
      setEditLabel("");
    }
  }, [open, catalog, selectedKeys]);

  const byKey = useMemo(() => {
    const map = new Map();
    localCatalog.forEach(o => map.set(o.key, o));
    return map;
  }, [localCatalog]);

  if (!open) return null;

  const toggleKey = (key) => {
    const next = new Set(localSelected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
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

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    if (label.length > 30) return;
    const exists = localCatalog.some(o => o.label.toLowerCase() === label.toLowerCase());
    if (exists) return;
    const key = label
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const colorPool = ["red", "blue", "purple", "green", "orange"];
    const color = colorPool[(localCatalog.length) % colorPool.length];

    setLocalCatalog([...localCatalog, { key, label, color }]);
    setNewLabel("");
  };

  const startEdit = (key) => {
    setEditingKey(key);
    setEditLabel(byKey.get(key)?.label ?? "");
  };

  const saveEdit = () => {
    const next = localCatalog.map(o =>
      o.key === editingKey ? { ...o, label: editLabel } : o
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
    onSave(Array.from(localSelected), localCatalog);
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
            <div className={styles.sectionTitle}>Select states</div>
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
