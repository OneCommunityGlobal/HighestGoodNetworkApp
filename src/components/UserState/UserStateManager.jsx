// components/UserState/UserStateManager.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './UserState.module.css';
import { selectUserStateForUser, selectUserStateCatalog } from './reducer';
import { updateUserStateIndicators } from './actions';

export default function UserStateManager({ userId, canEdit, user, initialSelections }) {
  const dispatch = useDispatch();
  const catalog = useSelector(selectUserStateCatalog);
  const fromStore = useSelector((s) => selectUserStateForUser(s, userId));
  const effectiveSelections =
    (Array.isArray(fromStore) && fromStore.length ? fromStore : initialSelections) || [];

  const onToggle = (key) => {
    if (!canEdit) return;
    const next = effectiveSelections.includes(key)
      ? effectiveSelections.filter((k) => k !== key)
      : [...effectiveSelections, key];
    dispatch(updateUserStateIndicators(userId, next, user)); // persists + updates store
  };

  return (
    <div className={styles.wrapper} data-testid="user-state-manager">
      <div className={styles.badges}>
        {catalog.map((item) => {
          const selected = effectiveSelections.includes(item.key);
          return (
            <button
              key={item.key}
              type="button"
              className={`${styles.badge} ${selected ? styles.selected : ''}`}
              title={item.label}
              onClick={() => onToggle(item.key)}
              aria-pressed={selected}
              disabled={!canEdit}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {!catalog?.length && (
        <div className={styles.empty}>User states not available.</div>
      )}
    </div>
  );
}
