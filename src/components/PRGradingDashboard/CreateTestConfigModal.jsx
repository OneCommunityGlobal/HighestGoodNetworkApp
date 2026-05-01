import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import styles from './CreateTestConfigModal.module.css';

const TEST_DATA_TYPES = ['minimal', 'mixed', 'edge cases', 'custom'];

function CreateTestConfigModal({ onAdd, onCancel, existingTeamNames }) {
  const [teamName, setTeamName] = useState('');
  const [reviewerCount, setReviewerCount] = useState('');
  const [testDataType, setTestDataType] = useState('');
  const [notes, setNotes] = useState('');
  const [reviewerNames, setReviewerNames] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Escape key closes modal
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') handleCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    } else if (existingTeamNames.some(n => n.toLowerCase() === teamName.trim().toLowerCase())) {
      newErrors.teamName = 'Team name must be unique. This name already exists.';
    }

    if (!reviewerCount || isNaN(reviewerCount) || parseInt(reviewerCount, 10) < 1) {
      newErrors.reviewerCount = 'Reviewer count must be a valid number (1 or greater)';
    }

    if (!testDataType) {
      newErrors.testDataType = 'Please select a test data type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const reviewerList = reviewerNames
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      await onAdd({
        teamName: teamName.trim(),
        reviewerCount: parseInt(reviewerCount, 10),
        testDataType,
        notes: notes.trim(),
        reviewerNames: reviewerList,
      });

      // Reset form
      setTeamName('');
      setReviewerCount('');
      setTestDataType('');
      setNotes('');
      setReviewerNames('');
      setErrors({});
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTeamName('');
    setReviewerCount('');
    setTestDataType('');
    setNotes('');
    setReviewerNames('');
    setErrors({});
    onCancel();
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) handleCancel();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-test-config-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="create-test-config-title" className={styles.modalTitle}>
            Create Test Configuration
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.closeButton}
            aria-label="Close"
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Team Name */}
            <div className={styles.formGroup}>
              <label htmlFor="teamName" className={styles.label}>
                Team Name <span className={styles.required}>*</span>
              </label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={e => {
                  setTeamName(e.target.value);
                  if (errors.teamName) setErrors(prev => ({ ...prev, teamName: '' }));
                }}
                className={`${styles.input} ${errors.teamName ? styles.inputError : ''}`}
                placeholder="Enter team name (must be unique)"
              />
              {errors.teamName && <p className={styles.errorMessage}>{errors.teamName}</p>}
            </div>

            {/* Reviewer Count */}
            <div className={styles.formGroup}>
              <label htmlFor="reviewerCount" className={styles.label}>
                Reviewer Count <span className={styles.required}>*</span>
              </label>
              <input
                id="reviewerCount"
                type="number"
                min="1"
                value={reviewerCount}
                onChange={e => {
                  setReviewerCount(e.target.value);
                  if (errors.reviewerCount) setErrors(prev => ({ ...prev, reviewerCount: '' }));
                }}
                className={`${styles.input} ${errors.reviewerCount ? styles.inputError : ''}`}
                placeholder="Enter number of reviewers"
              />
              {errors.reviewerCount && (
                <p className={styles.errorMessage}>{errors.reviewerCount}</p>
              )}
            </div>

            {/* Test Data Type */}
            <div className={styles.formGroup}>
              <label htmlFor="testDataType" className={styles.label}>
                Test Data Type <span className={styles.required}>*</span>
              </label>
              <select
                id="testDataType"
                value={testDataType}
                onChange={e => {
                  setTestDataType(e.target.value);
                  if (errors.testDataType) setErrors(prev => ({ ...prev, testDataType: '' }));
                }}
                className={`${styles.input} ${styles.select} ${
                  errors.testDataType ? styles.inputError : ''
                }`}
              >
                <option value="">Select a test data type</option>
                {TEST_DATA_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {errors.testDataType && <p className={styles.errorMessage}>{errors.testDataType}</p>}
            </div>

            {/* Reviewer Names */}
            <div className={styles.formGroup}>
              <label htmlFor="reviewerNames" className={styles.label}>
                Reviewer Names
                <span className={styles.hint}> (comma-separated, optional)</span>
              </label>
              <input
                id="reviewerNames"
                type="text"
                value={reviewerNames}
                onChange={e => setReviewerNames(e.target.value)}
                className={styles.input}
                placeholder="e.g. Alice, Bob, Charlie"
              />
            </div>

            {/* Notes */}
            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>
                Notes
                <span className={styles.hint}> (optional)</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Add any additional context about this configuration"
                rows={3}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={handleCancel}
              className={`${styles.button} ${styles.buttonCancel}`}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonConfirm}`}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Create Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateTestConfigModal.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  existingTeamNames: PropTypes.arrayOf(PropTypes.string),
};

CreateTestConfigModal.defaultProps = {
  existingTeamNames: [],
};

export default CreateTestConfigModal;
