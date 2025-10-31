import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import styles from './UserStateEdit.module.css';

export default function UserStateEdit({
  open,
  onClose,
  userId,
  catalog: catalogProp,
  selections: selectionsProp,
  onSaved,
  canEditCatalog = true,
  apiBase,
}) {
  const base = (apiBase || '/api') + '/user-states';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [localCatalog, setLocalCatalog] = useState(catalogProp || []);
  const [localSelKeys, setLocalSelKeys] = useState(
    new Set((selectionsProp || []).map(s => (typeof s === 'string' ? s : s.key)))
  );

  const [editingKey, setEditingKey] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const api = useMemo(() => {
    const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
    return axios.create({
      baseURL: base,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {}),
      },
      // enable if your backend issues auth cookies (CORS must allow credentials)
      withCredentials: true,
    });
  }, [base]);

  useEffect(() => {
    if (!open) return;
    setLocalCatalog(catalogProp || []);
    setLocalSelKeys(new Set((selectionsProp || []).map(s => (typeof s === 'string' ? s : s.key))));
    setEditingKey(null);
    setEditLabel('');
    setNewLabel('');
    setError('');
  }, [open, catalogProp, selectionsProp]);

  useEffect(() => {
    let cancelled = false;
    if (!open) return;

    const needCatalog = !(Array.isArray(catalogProp) && catalogProp.length);
    const needSelection = !(Array.isArray(selectionsProp) && selectionsProp.length);
    if (!needCatalog && !needSelection) return;

    (async () => {
      try {
        setLoading(true);
        setError('');
        if (needCatalog) {
          const r = await api.get('/catalog');
          if (!cancelled) {
            const items = Array.isArray(r?.data?.items) ? r.data.items : [];
            setLocalCatalog(items);
          }
        }
        if (needSelection) {
          const r = await api.get(`/users/${userId}/state-indicators`);
          if (!cancelled) {
            const arr = Array.isArray(r?.data?.selections) ? r.data.selections : [];
            setLocalSelKeys(new Set(arr.map(s => (typeof s === 'string' ? s : s.key))));
          }
        }
      } catch {
        if (!cancelled) setError('Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, api, userId, catalogProp, selectionsProp]);

  const byKey = useMemo(() => {
    const m = new Map();
    (localCatalog || []).forEach(o => m.set(o.key, o));
    return m;
  }, [localCatalog]);

  if (!open) return null;

  const toggleKey = key => {
    const next = new Set(localSelKeys);
    next.has(key) ? next.delete(key) : next.add(key);
    setLocalSelKeys(next);
  };

  const moveItem = (index, dir) => {
    const to = index + dir;
    if (to < 0 || to >= localCatalog.length) return;
    const next = [...localCatalog];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    setLocalCatalog(next);
  };

  const startRename = key => {
    setEditingKey(key);
    setEditLabel(byKey.get(key)?.label ?? '');
  };

  const saveRename = async () => {
    const label = editLabel.trim();
    if (!label || label.length > 30) return;
    try {
      setSaving(true);
      setError('');
      await api.patch(`/catalog/${encodeURIComponent(editingKey)}`, { label });
      setLocalCatalog(prev => prev.map(o => (o.key === editingKey ? { ...o, label } : o)));
      setEditingKey(null);
      setEditLabel('');
    } catch {
      setError('Rename failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label || label.length > 30) return;
    try {
      setSaving(true);
      setError('');
      const { data } = await api.post('/catalog', { label });
      const item = data?.item;
      if (item) {
        setLocalCatalog(prev => [...prev, item]);
        setNewLabel('');
      }
    } catch {
      setError('Add failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    const keys = new Set(localCatalog.map(c => c.key));
    const selectedKeys = Array.from(localSelKeys).filter(k => keys.has(k));
    try {
      setSaving(true);
      setError('');
      const { data } = await api.patch(`/users/${userId}/state-indicators`, { selectedKeys });
      const savedSelections = Array.isArray(data?.selections) ? data.selections : [];
      onSaved && onSaved(savedSelections, localCatalog);
      onClose();
    } catch {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>User State</h3>
          <button className={styles.iconBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.left}>
            <div className={styles.sectionTitle}>
              Select states {loading && <span style={{ marginLeft: 8, opacity: 0.7 }}>(loading…)</span>}
              {error && <span style={{ marginLeft: 8, color: 'red' }}>— {error}</span>}
            </div>

            <ul className={styles.list}>
              {localCatalog.map((opt, idx) => (
                <li key={opt.key} className={styles.item}>
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={localSelKeys.has(opt.key)}
                      onChange={() => toggleKey(opt.key)}
                    />
                    {editingKey === opt.key ? (
                      <input
                        className={styles.editInput}
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
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
                          <button className={styles.smallBtn} onClick={() => setEditingKey(null)} disabled={saving}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className={styles.smallBtn} onClick={() => moveItem(idx, -1)} disabled={saving}>↑</button>
                          <button className={styles.smallBtn} onClick={() => moveItem(idx, +1)} disabled={saving}>↓</button>
                          <button className={styles.smallBtn} onClick={() => startRename(opt.key)} disabled={saving}>Rename</button>
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
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="Enter Text"
                  maxLength={30}
                />
                <button
                  className={styles.addBtn}
                  onClick={handleAdd}
                  disabled={saving || !newLabel.trim()}
                >
                  {saving ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.actions}>
            <button className={styles.secondaryBtn} onClick={onClose} disabled={saving}>Cancel</button>
            <button className={styles.primaryBtn} onClick={handleSaveAll} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
