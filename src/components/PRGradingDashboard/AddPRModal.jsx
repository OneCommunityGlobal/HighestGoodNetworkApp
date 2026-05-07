import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import styles from './AddPRModal.module.css';

const PR_NUMBER_REGEX = /^\d+(?:\s*\+\s*\d+)*$/;
const GRADE_OPTIONS = ['Unsatisfactory', 'Okay', 'Exceptional', 'No Correct Image'];

function AddPRModal({ reviewer, onAdd, onCancel }) {
  const [prNumber, setPrNumber] = useState('');
  const [prNumberError, setPrNumberError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [step, setStep] = useState(1); // 1: PR Number input, 2: Grade selection

  const validatePRNumber = value => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setPrNumberError('');
      return false;
    }
    // Test the regex on the trimmed value
    // Allow formats like: "1234", "1234 + 5678", "1234+5678", "1234 + 5678 + 9012"
    const isValid = PR_NUMBER_REGEX.test(trimmedValue);
    if (!isValid) {
      setPrNumberError('Invalid format. Use format like "1234" or "1234 + 5678"');
      return false;
    }
    setPrNumberError('');
    return true;
  };

  const handlePRNumberChange = e => {
    const value = e.target.value;
    setPrNumber(value);
    // Clear error when user starts typing, validate on blur/submit
    if (prNumberError) {
      // If there was an error, re-validate to show success when fixed
      if (value.trim()) {
        validatePRNumber(value);
      } else {
        setPrNumberError('');
      }
    }
  };

  const handlePRNumberBlur = () => {
    if (prNumber.trim()) {
      validatePRNumber(prNumber);
    }
  };

  const handlePRNumberSubmit = e => {
    e.preventDefault();
    if (validatePRNumber(prNumber)) {
      setStep(2);
    }
  };

  const handleGradeSelect = grade => {
    setSelectedGrade(grade);
    // Automatically add on selection
    onAdd(reviewer, prNumber.trim(), grade);
    // Reset form
    setPrNumber('');
    setSelectedGrade('');
    setStep(1);
    setPrNumberError('');
  };

  const handleCancel = () => {
    setPrNumber('');
    setSelectedGrade('');
    setStep(1);
    setPrNumberError('');
    onCancel();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>Add PR for {reviewer}</h3>
        <button
          type="button"
          onClick={handleCancel}
          className={styles.closeButton}
          aria-label="Close"
        >
          <X className={styles.closeIcon} />
        </button>
      </div>

      {step === 1 && (
        <form onSubmit={handlePRNumberSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="prNumber" className={styles.label}>
              PR Number
            </label>
            <input
              id="prNumber"
              type="text"
              value={prNumber}
              onChange={handlePRNumberChange}
              onBlur={handlePRNumberBlur}
              placeholder="e.g., 1234 or 1234 + 5678"
              className={`${styles.input} ${prNumberError ? styles.inputError : ''}`}
            />
            {prNumberError && <p className={styles.errorMessage}>{prNumberError}</p>}
            {!prNumberError && prNumber.trim() && (
              <p className={styles.successMessage}>
                <Check className={styles.successIcon} />
                Valid format
              </p>
            )}
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleCancel}
              className={`${styles.button} ${styles.buttonCancel}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!prNumber.trim() || !!prNumberError}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Next
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div>
          <div className={styles.formGroup}>
            <p className={styles.prNumberDisplay}>
              PR Number: <span className={styles.prNumberValue}>{prNumber}</span>
            </p>
            <div className={styles.gradeLabel}>Select Grade</div>
            <div className={styles.gradeOptions}>
              {GRADE_OPTIONS.map(grade => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => handleGradeSelect(grade)}
                  className={`${styles.gradeButton} ${
                    selectedGrade === grade ? styles.gradeButtonSelected : ''
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedGrade('');
              }}
              className={`${styles.button} ${styles.buttonCancel}`}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPRModal;
