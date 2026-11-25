import { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import styles from './ConfirmationModal.module.css';

function RemoveReviewerModal({ reviewer, onConfirm, onCancel }) {
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) onCancel();
  };

  const handleOverlayKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Close modal by clicking outside"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-reviewer-modal-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="remove-reviewer-modal-title" className={styles.modalTitle}>
            Remove Reviewer
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className={styles.closeButton}
            aria-label="Close"
          >
            <X className={styles.closeIcon} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.confirmationIcon}>
            <Trash2 className={styles.icon} />
          </div>
          <p className={styles.confirmationText}>
            Remove reviewer <strong>{reviewer}</strong> from this week?
          </p>
          <p className={styles.noteText}>
            Their past PR review history will remain visible in analytics.
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles.button} ${styles.buttonCancel}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${styles.button} ${styles.buttonConfirm}`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default RemoveReviewerModal;
