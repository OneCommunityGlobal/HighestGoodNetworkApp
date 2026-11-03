import React from 'react';
import styles from './FormPreviewModal.module.css';
import {
  normalizeQuestionType,
  resolveInputType,
  getVisibleStandardApplicantFields,
  isFieldRequired,
  numberedQuestionLabel,
} from './jobFormQuestionUtils';

/**
 * FormPreviewModal Component
 * Displays a read-only preview of the form as it will appear to applicants
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Array} props.formFields - Array of form field objects to display
 * @param {string} props.jobTitle - The job title for the form
 * @param {Object} props.fixedFields - Backend fixedFields flags for default profile sections
 * @param {boolean} props.darkMode - Dark mode flag
 */
function FormPreviewModal({ isOpen, onClose, formFields, jobTitle, fixedFields, darkMode }) {
  if (!isOpen) return null;

  // Filter to show only visible fields
  const visibleFields = formFields.filter(field => field.visible !== false);
  const standardFields = getVisibleStandardApplicantFields(fixedFields);

  const renderField = (field, index) => {
    const { questionText, options } = field;
    const questionType = normalizeQuestionType(field);
    const fieldKey = `preview-field-${index}-${questionText}`;
    const questionLabel = numberedQuestionLabel(questionText, index);
    const requiredMark = isFieldRequired(field) ? (
      <span className={styles.previewRequiredMark} aria-hidden="true">
        {' '}
        *
      </span>
    ) : null;

    switch (questionType) {
      case 'textbox':
        return (
          <div key={fieldKey} className={styles.previewField}>
            <label className={styles.previewLabel}>
              {questionLabel}
              {requiredMark}
            </label>
            <input
              type={resolveInputType(field)}
              placeholder={
                resolveInputType(field) === 'email' ? 'Enter email address' : 'Enter text here'
              }
              disabled
              className={styles.previewInput}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldKey} className={styles.previewField}>
            <label className={styles.previewLabel}>
              {questionLabel}
              {requiredMark}
            </label>
            <textarea placeholder="Enter text here" disabled className={styles.previewTextarea} />
          </div>
        );

      case 'date':
        return (
          <div key={fieldKey} className={styles.previewField}>
            <label className={styles.previewLabel}>
              {questionLabel}
              {requiredMark}
            </label>
            <input type="date" disabled className={styles.previewInput} />
          </div>
        );

      case 'file':
        return (
          <div key={fieldKey} className={styles.previewField}>
            <label className={styles.previewLabel}>
              {questionLabel}
              {requiredMark}
            </label>
            <input type="file" disabled className={styles.previewInput} />
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldKey} className={styles.previewField}>
            <label className={styles.previewLabel}>
              {questionLabel}
              {requiredMark}
            </label>
            <div className={styles.previewOptions}>
              {options &&
                options.map((option, optIdx) => (
                  <div key={`${fieldKey}-opt-${optIdx}`} className={styles.previewOptionItem}>
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
          <div key={fieldKey} className={styles.previewField}>
            <label className={styles.previewLabel}>
              {questionLabel}
              {requiredMark}
            </label>
            <div className={styles.previewOptions}>
              {options &&
                options.map((option, optIdx) => (
                  <div key={`${fieldKey}-opt-${optIdx}`} className={styles.previewOptionItem}>
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
          <div key={fieldKey} className={styles.previewField}>
            <label className={styles.previewLabel}>
              {questionLabel}
              {requiredMark}
            </label>
            <select disabled className={styles.previewSelect}>
              <option>Select an option</option>
              {options &&
                options.map(option => (
                  <option key={`${fieldKey}-${option}`} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
        );

      default:
        return (
          <div key={fieldKey} className={styles.previewField}>
            <label className={styles.previewLabel}>
              {questionLabel}
              {requiredMark}
            </label>
            <input
              type="text"
              placeholder="Enter text here"
              disabled
              className={styles.previewInput}
            />
          </div>
        );
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

            {visibleFields.length === 0 && standardFields.length === 0 ? (
              <div className={styles.previewEmptyMessage}>
                <p>No visible profile fields or custom questions for this form.</p>
              </div>
            ) : null}

            <div className={styles.previewFieldsContainer}>
              {standardFields.length > 0 ? (
                <div className={styles.previewStandardSection}>
                  <p className={styles.previewStandardNote}>
                    Default /job-application profile fields (from fixedFields)
                  </p>
                  {standardFields.map(field => (
                    <div key={field.label} className={styles.previewField}>
                      <label className={styles.previewLabel}>
                        {field.label}
                        {field.required && (
                          <span className={styles.previewRequiredMark} aria-hidden="true">
                            {' '}
                            *
                          </span>
                        )}
                      </label>
                      {field.inputType === 'select' ? (
                        <select disabled className={styles.previewInput} defaultValue="">
                          <option value="">{field.placeholder}</option>
                        </select>
                      ) : field.inputType === 'file' ? (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          disabled
                          className={styles.previewInput}
                        />
                      ) : (
                        <input
                          type={field.inputType === 'tel' ? 'tel' : field.inputType}
                          placeholder={field.placeholder}
                          disabled
                          className={styles.previewInput}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {visibleFields.length > 0 &&
                visibleFields.map((field, index) => renderField(field, index))}
            </div>
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
