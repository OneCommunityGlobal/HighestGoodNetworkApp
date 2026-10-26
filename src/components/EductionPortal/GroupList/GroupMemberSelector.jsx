import React from 'react';
import PropTypes from 'prop-types';
import styles from './GroupList.module.css';

// Extracted from GroupEditorModal into GroupList/GroupMemberSelector.jsx.
// This component renders the checklist using the existing GroupList.module.css styles.
// The modal owns selected member IDs and updates them through onToggleMember.
export default function GroupMemberSelector({ learners, members, pending, onToggleMember }) {
  return (
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
                disabled={pending}
                checked={members.includes(l.id)}
                onChange={() => onToggleMember(l.id)}
              />
              <span className={styles.checkLabel}>{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

GroupMemberSelector.propTypes = {
  learners: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayName: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
    }),
  ).isRequired,
  members: PropTypes.arrayOf(PropTypes.string).isRequired,
  pending: PropTypes.bool.isRequired,
  onToggleMember: PropTypes.func.isRequired,
};
