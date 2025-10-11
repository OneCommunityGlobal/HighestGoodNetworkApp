import React from 'react';
import { useSelector } from 'react-redux';
import styles from './FeedbackModal.module.css';

const FeedbackModal = ({
  title,
  children,
  onClose,
  onSubmit,
  show,
  showSubmit = true,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  disableSubmit = false,
  importantLabel = null,
}) => {
  const darkMode = useSelector(state => state.theme?.darkMode);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${darkMode ? styles.modalDark : ''}`}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        {importantLabel && <div className={styles.importantLabel}>{importantLabel}</div>}

        <div className={styles.modalBody}>{children}</div>

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            className={`${styles.btnSecondary} ${darkMode ? styles.btnSecondaryDark : ''}`}
          >
            {cancelLabel}
          </button>
          {showSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={disableSubmit}
              className={styles.btnPrimary}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
