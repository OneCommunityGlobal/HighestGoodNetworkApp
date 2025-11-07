import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import styles from './GroupList.module.css';
import GroupEditorModal from './GroupEditorModal.jsx';
import { useSelector } from 'react-redux';

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  return [state, setState];
}

const groupsSeed = [];
const learnersSeed = [];

const storageKey = 'hgn.groups';

const GroupItem = memo(function GroupItem({ group, onEdit }) {
  return (
    <li className={styles.item}>
      <div className={styles.itemInfo}>
        <div className={styles.itemName}>{group.name || 'Untitled'}</div>
        <div className={styles.count}>{(group.members || []).length} students</div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.editButton}
          onClick={() => onEdit(group)}
          aria-label={`Edit ${group.name || 'group'}`}
        >
          Edit
        </button>
      </div>
    </li>
  );
});

export default function GroupList() {
  const [groups, setGroups] = useLocalStorage(storageKey, groupsSeed);
  const [learners] = useState(() => (Array.isArray(learnersSeed) ? learnersSeed : []));
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const darkMode = useSelector(state => state.theme.darkMode);

  const totalGroups = useMemo(() => groups.length, [groups]);

  const openNew = useCallback(() => {
    setEditing(null);
    setShowModal(true);
  }, []);

  const openEdit = useCallback(group => {
    setEditing(group);
    setShowModal(true);
  }, []);

  const makeId = useCallback(() => {
    try {
      return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'g' +
            Date.now().toString(36) +
            Math.random()
              .toString(36)
              .slice(2, 8);
    } catch {
      return 'g' + Date.now().toString(36);
    }
  }, []);

  const handleSave = useCallback(
    group => {
      setGroups(prev => {
        const normalized = { ...group, name: (group.name || 'Untitled Group').trim() };
        let next;
        if (normalized.id) {
          next = prev.map(g => (g.id === normalized.id ? normalized : g));
        } else {
          next = [...prev, { ...normalized, id: makeId() }];
        }
        return next;
      });
      setShowModal(false);
    },
    [setGroups, makeId],
  );

  const handleDelete = useCallback(
    id => {
      setGroups(prev => prev.filter(g => g.id !== id));
      setShowModal(false);
    },
    [setGroups],
  );

  return (
    <section
      className={`${styles.container} ${darkMode ? styles.dark : ''}`}
      aria-labelledby="groups-heading"
    >
      <header className={styles.header}>
        <div>
          <h2 id="groups-heading" className={styles.title}>
            Student Groups
          </h2>
          <div className={styles.subtitle}>{totalGroups} groups</div>
        </div>

        <div>
          <button className={styles.newButton} onClick={openNew} aria-haspopup="dialog">
            + New Group
          </button>
        </div>
      </header>

      <ul className={styles.list} aria-live="polite">
        {groups.length === 0 ? (
          <li className={styles.empty}>No groups yet. Create your first group.</li>
        ) : (
          groups.map(g => <GroupItem key={g.id} group={g} onEdit={openEdit} />)
        )}
      </ul>

      {showModal && (
        <GroupEditorModal
          key={editing?.id || 'new'}
          group={editing}
          learners={learners}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          existingGroups={groups}
        />
      )}
    </section>
  );
}
