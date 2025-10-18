import { useState, useEffect } from 'react';
import styles from './GroupList.module.css';

export default function GroupEditorModal({
  group = null,
  learners = [],
  onClose,
  onSave,
  onDelete,
}) {
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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.head}>
          <h3 className={styles.title}>{group ? 'Edit Group' : 'New Group'}</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <label className={styles.field}>
            <div className={styles.fieldLabel}>Name</div>
            <input className={styles.input} value={name} onChange={e => setName(e.target.value)} />
          </label>

          <div className={styles.membersSection}>
            <div className={styles.membersTitle}>Members</div>
            <div className={styles.checklist}>
              {learners.length === 0 && <div className={styles.empty}>No learners available</div>}
              {learners.map(l => (
                <label key={l.id} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={members.includes(l.id)}
                    onChange={() => toggleMember(l.id)}
                  />
                  <span className={styles.checkLabel}>{l.displayName || l.name || l.email}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div>
            {group && (
              <button className={styles.danger} onClick={remove}>
                Delete
              </button>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.primary} onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
