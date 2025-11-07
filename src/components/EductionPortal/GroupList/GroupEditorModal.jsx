import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import styles from './GroupList.module.css';

export default function GroupEditorModal({
  group = null,
  learners = [],
  onClose,
  onSave,
  onDelete,
  existingGroups = [],
}) {
  const [name, setName] = useState(group?.name || '');
  const [members, setMembers] = useState(() =>
    Array.isArray(group?.members) ? Array.from(new Set(group.members)) : [],
  );
  const [error, setError] = useState('');
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    setName(group?.name || '');
    setMembers(Array.isArray(group?.members) ? Array.from(new Set(group.members)) : []);
    setError('');
  }, [group]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement;

    requestAnimationFrame(() => firstInputRef.current && firstInputRef.current.focus());

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        // focus trap
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])',
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
    }

    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      previouslyFocused && previouslyFocused.focus();
    };
  }, [onClose]);

  const handleOverlayClick = useCallback(
    e => {
      if (modalRef.current && modalRef.current.contains(e.target)) return;
      onClose();
    },
    [onClose],
  );

  const handleOverlayKey = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (modalRef.current && modalRef.current.contains(document.activeElement)) return;
        onClose();
      }
    },
    [onClose],
  );

  const toggleMember = useCallback(id => {
    setMembers(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return Array.from(s);
    });
  }, []);

  const validate = useCallback(() => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      setError('Please provide a group name.');
      return false;
    }
    const duplicate = existingGroups.find(
      g => g.name && g.name.trim() === trimmed && g.id !== group?.id,
    );
    if (duplicate) {
      setError('A group with this name already exists.');
      return false;
    }
    setError('');
    return true;
  }, [name, existingGroups, group]);

  const save = useCallback(() => {
    if (!validate()) return;
    const payload = { ...(group || {}), name: name.trim(), members };
    onSave(payload);
  }, [group, name, members, onSave, validate]);

  const remove = useCallback(() => {
    if (group?.id) onDelete(group.id);
    else onClose();
  }, [group, onDelete, onClose]);

  return (
    <div
      className={`${styles.overlay} ${darkMode ? styles.dark : ''}`}
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKey}
      role="button"
      tabIndex={0}
      aria-label="Close dialog"
    >
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-modal-title"
      >
        <div className={styles.head}>
          <h3 id="group-modal-title" className={styles.modalTitle}>
            {group ? 'Edit Group' : 'New Group'}
          </h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div>
            <label className={styles.field}>
              <div className={styles.fieldLabel}>Name</div>
              <input
                ref={firstInputRef}
                className={styles.input}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Group name"
                aria-label="Group name"
                aria-invalid={!!error}
                aria-describedby={error ? 'group-name-error' : undefined}
              />
            </label>
            {error && (
              <div
                id="group-name-error"
                className={styles.fieldError}
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}
          </div>

          <div className={styles.membersSection}>
            <div className={styles.membersTitle}>Members</div>
            <div className={styles.checklist}>
              {learners.length === 0 && <div className={styles.empty}>No learners available</div>}
              {learners.map(l => {
                const label = l.displayName || l.name || l.email || 'Learner';
                return (
                  <label key={l.id} className={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={members.includes(l.id)}
                      onChange={() => toggleMember(l.id)}
                    />
                    <span className={styles.checkLabel}>{label}</span>
                  </label>
                );
              })}
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
            <button className={styles.primary} onClick={save} disabled={!name.trim()}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
