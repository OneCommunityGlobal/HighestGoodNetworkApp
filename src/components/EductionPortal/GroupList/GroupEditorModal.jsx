import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    setName(group?.name || '');
    setMembers(Array.isArray(group?.members) ? group.members.slice() : []);
  }, [group]);

  // focus management + close on ESC + prevent background scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previousActive = document.activeElement;

    const onKey = e => {
      if (e.key === 'Escape') onClose();
      // basic tab trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    // focus the input
    setTimeout(() => firstInputRef.current && firstInputRef.current.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      previousActive && previousActive.focus();
    };
  }, [onClose]);

  const toggleMember = useCallback(id => {
    setMembers(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);

  const save = useCallback(() => {
    const payload = { ...(group || {}), name: (name || 'Untitled Group').trim(), members };
    onSave(payload);
  }, [group, name, members, onSave]);

  const remove = useCallback(() => {
    if (group?.id) onDelete(group.id);
    else onClose();
  }, [group, onDelete, onClose]);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-modal-title"
    >
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.head}>
          <h3 id="group-modal-title" className={styles.modalTitle}>
            {group ? 'Edit Group' : 'New Group'}
          </h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <label className={styles.field}>
            <div className={styles.fieldLabel}>Name</div>
            <input
              ref={firstInputRef}
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Group name"
              aria-label="Group name"
            />
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
