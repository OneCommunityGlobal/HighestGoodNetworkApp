import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import styles from './ConfirmationModal.module.css';

function ConfirmationModal({ reviewer, prNumbers, grade, onConfirm, onCancel }) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleOverlayKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleOverlayClick = e => {
    // Only close if clicking directly on the overlay, not on the modal
    if (e.target === e.currentTarget) {
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
        aria-labelledby="confirmation-modal-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="confirmation-modal-title" className={styles.modalTitle}>
            Confirm Add PR
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
            <CheckCircle className={styles.icon} />
          </div>
          <p className={styles.confirmationText}>
            Add PR <strong>{prNumbers}</strong> with grade <strong>{grade}</strong> for{' '}
            <strong>{reviewer}</strong>?
          </p>
          <p className={styles.noteText}>
            This will automatically increment the PRs Reviewed count.
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
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
