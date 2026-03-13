import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './TeamCard.module.css';
import { TeamMemberRow } from './TeamMemberRow';

function ConfirmModal({ action, count, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Confirm Action</h3>
        <p className={styles.modalText}>
          Are you sure you want to <strong>{action}</strong> to <strong>{count}</strong> member
          {count > 1 ? 's' : ''}?
        </p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
            Yes, Proceed
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  action: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default function TeamCard() {
  const teamMembers = [
    { id: 1, name: 'Shreya Laheri', score: '9/10' },
    { id: 2, name: 'Shreya Vithala', score: '7/10' },
    { id: 3, name: 'Jae Sabol', score: '5/10' },
    { id: 4, name: 'Sara Sabol', score: '2/10' },
  ];

  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);

  const toggleSelect = id => {
    setSelectedMembers(prev => (prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]));
  };

  const handleBulkAction = action => {
    setConfirmAction(action);
  };

  const handleConfirm = () => {
    // TODO: wire up real API calls when backend is ready
    if (confirmAction === 'Send Message') {
      toast.success(
        `Message sent to ${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''}!`,
      );
    } else if (confirmAction === 'Request Skill Update') {
      toast.success(
        `Skill update requested for ${selectedMembers.length} member${
          selectedMembers.length > 1 ? 's' : ''
        }!`,
      );
    }
    setSelectedMembers([]);
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setConfirmAction(null);
  };

  const noneSelected = selectedMembers.length === 0;

  return (
    <div className={styles.teamCardWrapper}>
      <div className={styles.teamCardContainer}>
        <div className={styles.teamCardHeader}>
          <h2 className={styles.teamCardTitle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="42"
              viewBox="0 0 40 42"
              fill="none"
            >
              <path
                d="M10 15.5234L20 25.8742L30 15.5234"
                stroke="#828282"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Your Team_______ rating
          </h2>
        </div>

        {/* Bulk Action Bar */}
        <div className={styles.bulkActionBar}>
          <span className={styles.selectedCount}>
            {noneSelected
              ? 'No members selected'
              : `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} selected`}
          </span>
          <div className={styles.bulkButtons}>
            <button
              type="button"
              className={styles.bulkBtn}
              disabled={noneSelected}
              onClick={() => handleBulkAction('Send Message')}
            >
              Send Message
            </button>
            <button
              type="button"
              className={styles.bulkBtn}
              disabled={noneSelected}
              onClick={() => handleBulkAction('Request Skill Update')}
            >
              Request Skill Update
            </button>
          </div>
        </div>

        {/* Member Rows */}
        <div>
          {teamMembers.map(member => (
            <TeamMemberRow
              key={member.id}
              member={member}
              isSelected={selectedMembers.includes(member.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      </div>

      <div className={styles.showMoreSpan}>
        <span>
          <span className={styles.showMoreText}>Show your team member </span>
          <span className={styles.showMoreText} style={{ textDecoration: 'none' }}>
            &gt;
          </span>
        </span>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          count={selectedMembers.length}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
