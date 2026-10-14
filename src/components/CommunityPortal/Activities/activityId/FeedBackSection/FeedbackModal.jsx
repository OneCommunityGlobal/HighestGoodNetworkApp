import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
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
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.modalOverlay}`}>
        <div className={`${styles.modal}`}>
          <div className={`${styles.modalHeader}`}>
            <h3>{title}</h3>
            <button type="button" onClick={onClose}>
              ✕
            </button>
          </div>

          {importantLabel && <div className={`${styles.importantLabel}`}>{importantLabel}</div>}

          <div className={`${styles.modalBody}`}>{children}</div>

          <div className={`${styles.modalActions}`}>
            <button type="button" onClick={onClose} className={`${styles.btnSecondary}`}>
              {cancelLabel}
            </button>
            {showSubmit && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={disableSubmit}
                className={`${styles.btnPrimary}`}
              >
                {submitLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

FeedbackModal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  showSubmit: PropTypes.bool,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  disableSubmit: PropTypes.bool,
  importantLabel: PropTypes.string,
};

FeedbackModal.defaultProps = {
  showSubmit: true,
  submitLabel: 'Submit',
  cancelLabel: 'Cancel',
  disableSubmit: false,
  importantLabel: null,
};
