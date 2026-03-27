import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './FormPreviewModal.module.css';

/**
 * FormPreviewModal Component
 * Displays a read-only preview of the form as it will appear to applicants
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Array} props.formFields - Array of form field objects to display
 * @param {string} props.jobTitle - The job title for the form
 * @param {boolean} props.darkMode - Dark mode flag
 */
function FormPreviewModal({ isOpen, onClose, formFields, jobTitle, darkMode }) {
  if (!isOpen) return null;

  // Filter to show only visible fields
  const visibleFields = formFields.filter(field => field.visible !== false);

  const renderField = (field, index) => {
    const { questionText, questionType, options } = field;

    switch (questionType) {
      case 'textbox':
        return (
          <div key={uuidv4()} className={styles.previewField}>
            <label className={styles.previewLabel}>{questionText}</label>
            <input
              type="text"
              placeholder="Enter text here"
              disabled
              className={styles.previewInput}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={uuidv4()} className={styles.previewField}>
            <label className={styles.previewLabel}>{questionText}</label>
            <textarea placeholder="Enter text here" disabled className={styles.previewTextarea} />
          </div>
        );

      case 'date':
        return (
          <div key={uuidv4()} className={styles.previewField}>
            <label className={styles.previewLabel}>{questionText}</label>
            <input type="date" disabled className={styles.previewInput} />
          </div>
        );

      case 'checkbox':
        return (
          <div key={uuidv4()} className={styles.previewField}>
            <label className={styles.previewLabel}>{questionText}</label>
            <div className={styles.previewOptions}>
              {options &&
                options.map((option, optIdx) => (
                  <div key={uuidv4()} className={styles.previewOptionItem}>
                    <input
                      type="checkbox"
                      disabled
                      id={`checkbox-${index}-${optIdx}`}
                      className={styles.previewCheckbox}
                    />
                    <label
                      htmlFor={`checkbox-${index}-${optIdx}`}
                      className={styles.previewOptionLabel}
                    >
                      {option}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        );

      case 'radio':
        return (
          <div key={uuidv4()} className={styles.previewField}>
            <label className={styles.previewLabel}>{questionText}</label>
            <div className={styles.previewOptions}>
              {options &&
                options.map((option, optIdx) => (
                  <div key={uuidv4()} className={styles.previewOptionItem}>
                    <input
                      type="radio"
                      disabled
                      id={`radio-${index}-${optIdx}`}
                      name={`radio-${index}`}
                      className={styles.previewRadio}
                    />
                    <label
                      htmlFor={`radio-${index}-${optIdx}`}
                      className={styles.previewOptionLabel}
                    >
                      {option}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        );

      case 'dropdown':
        return (
          <div key={uuidv4()} className={styles.previewField}>
            <label className={styles.previewLabel}>{questionText}</label>
            <select disabled className={styles.previewSelect}>
              <option>Select an option</option>
              {options &&
                options.map(option => (
                  <option key={uuidv4()} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  // Close only when clicking directly on the overlay, not inside the modal container
  const handleOverlayClick = event => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Keyboard support for accessibility
  const handleOverlayKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClose();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className={`${styles.modalOverlay} ${darkMode ? styles.darkMode : ''}`}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Close form preview"
    >
      <div
        className={styles.modalContainer}
        role="dialog"
        aria-modal="true"
        aria-label="Form preview dialog"
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Preview Form</h2>
          <button
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close preview"
            type="button"
          >
            &times;
          </button>
        </div>

        {/* Modal Content */}
        <div className={styles.modalContent}>
          <div className={styles.previewForm}>
            <h3 className={styles.previewFormTitle}>
              {jobTitle?.toUpperCase() || 'PLEASE CHOOSE AN OPTION'}
            </h3>
            <p className={styles.previewFormSubtitle}>
              This is a preview of how the form will appear to applicants.
            </p>

            {visibleFields.length === 0 ? (
              <div className={styles.previewEmptyMessage}>
                <p>No visible fields to display. Please add and enable questions.</p>
              </div>
            ) : (
              <div className={styles.previewFieldsContainer}>
                {visibleFields.map((field, index) => renderField(field, index))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.modalActionBtn} onClick={onClose}>
            Close Preview
          </button>
          <p className={styles.modalFooterNote}>Review the layout, text, and field order above.</p>
        </div>
      </div>
    </div>
  );
}

export default FormPreviewModal;
