import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styles from './GroupList.module.css';
import GroupEditorModal from './GroupEditorModal.jsx';

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

const GroupItem = React.memo(function GroupItem({ group, onEdit }) {
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
  const [groups, setGroups] = useState(() => loadGroups());
  const [learners] = useState(() => (Array.isArray(learnersSeed) ? learnersSeed : []));
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setGroups(loadGroups());
  }, []);

  const openNew = useCallback(() => {
    setEditing(null);
    setShowModal(true);
  }, []);

  const openEdit = useCallback(g => {
    setEditing(g);
    setShowModal(true);
  }, []);

  const handleSave = useCallback(group => {
    setGroups(prev => {
      let next;
      if (group.id) {
        next = prev.map(g => (g.id === group.id ? group : g));
      } else {
        const id = 'g' + Date.now();
        next = [...prev, { ...group, id }];
      }
      saveGroups(next);
      return next;
    });
    setShowModal(false);
  }, []);

  const handleDelete = useCallback(id => {
    setGroups(prev => {
      const next = prev.filter(g => g.id !== id);
      saveGroups(next);
      return next;
    });
    setShowModal(false);
  }, []);

  const totalGroups = useMemo(() => groups.length, [groups]);

  return (
    <section className={styles.container} aria-labelledby="groups-heading">
      <header className={styles.header}>
        <div>
          <h2 id="groups-heading" className={styles.title}>
            Student Groups
          </h2>
          <div className={styles.subtitle}>{totalGroups} groups</div>
        </div>

        <div>
          <button className={styles.newButton} onClick={openNew}>
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
          group={editing}
          learners={learners}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
