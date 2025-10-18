import { useEffect, useState } from 'react';
import styles from './GroupList.module.css';

const data = [];
const groupsSeed = data;
const learnersSeed = data;

const storageKey = 'hgn.groups';

function loadGroups() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return Array.isArray(groupsSeed) ? groupsSeed : [];
}

function saveGroups(list) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(list));
  } catch (e) {}
}

export default function GroupList() {
  const [groups, setGroups] = useState(() => loadGroups());
  const [learners] = useState(() => (Array.isArray(learnersSeed) ? learnersSeed : []));
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setGroups(loadGroups());
  }, []);

  const openNew = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = g => {
    setEditing(g);
    setShowModal(true);
  };

  const handleSave = group => {
    let next;
    if (group.id) {
      next = groups.map(g => (g.id === group.id ? group : g));
    } else {
      const id = 'g' + Date.now();
      next = [...groups, { ...group, id }];
    }
    setGroups(next);
    saveGroups(next);
    setShowModal(false);
  };

  const handleDelete = id => {
    const next = groups.filter(g => g.id !== id);
    setGroups(next);
    saveGroups(next);
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Student Groups</h2>
        <button className={styles.newButton} onClick={openNew}>
          New Group
        </button>
      </div>

      <ul className={styles.list}>
        {groups.length === 0 && <li className={styles.empty}>No groups yet</li>}
        {groups.map(g => (
          <li key={g.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{g.name}</div>
              <div className={styles.count}>{(g.members || []).length} students</div>
            </div>
            <div className={styles.actions}>
              <button className={styles.editButton} onClick={() => openEdit(g)}>
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showModal && (
        <GroupEditorModal
          group={editing}
          learners={learners}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function GroupEditorModal({ group = null, learners = [], onClose, onSave, onDelete }) {
  const [name, setName] = useState(group?.name || '');
  const [members, setMembers] = useState(
    Array.isArray(group?.members) ? group.members.slice() : [],
  );

  useEffect(() => {
    setName(group?.name || '');
    setMembers(Array.isArray(group?.members) ? group.members.slice() : []);
  }, [group]);

  const toggleMember = id => {
    setMembers(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const save = () => {
    const payload = { ...(group || {}), name: (name || 'Untitled Group').trim(), members };
    onSave(payload);
  };

  const remove = () => {
    if (group?.id) onDelete(group.id);
    else onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          width: 720,
          maxWidth: '95%',
          borderRadius: 6,
          boxShadow: '0 10px 30px rgba(0,0,0,.2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            borderBottom: '1px solid #eee',
          }}
        >
          <h3 style={{ margin: 0 }}>{group ? 'Edit Group' : 'New Group'}</h3>
          <button
            onClick={onClose}
            style={{
              fontSize: 18,
              lineHeight: 1,
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ marginBottom: 6, fontSize: 13 }}>Name</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </label>

          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8, fontSize: 14 }}>Members</div>
            <div
              style={{
                maxHeight: 220,
                overflow: 'auto',
                border: '1px solid #f0f0f0',
                padding: 8,
                borderRadius: 4,
              }}
            >
              {learners.length === 0 && (
                <div style={{ color: '#888', padding: 8 }}>No learners available</div>
              )}
              {learners.map(l => (
                <label
                  key={l.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}
                >
                  <input
                    type="checkbox"
                    checked={members.includes(l.id)}
                    onChange={() => toggleMember(l.id)}
                  />
                  <span>{l.displayName || l.name || l.email}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #eee',
          }}
        >
          <div>
            {group && (
              <button
                onClick={remove}
                style={{
                  background: '#d14343',
                  color: '#fff',
                  padding: '6px 10px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div>
            <button
              onClick={onClose}
              style={{ marginRight: 8, padding: '6px 10px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              style={{
                background: '#0078d4',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
