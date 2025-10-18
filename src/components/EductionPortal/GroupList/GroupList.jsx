import { useEffect, useState } from 'react';
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
