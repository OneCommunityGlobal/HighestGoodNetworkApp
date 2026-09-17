import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './AddReviewerModal.module.css';

function AddReviewerModal({ onAdd, onCancel }) {
  const [reviewerName, setReviewerName] = useState('');
  const [prsNeeded, setPrsNeeded] = useState('');
  const [errors, setErrors] = useState({});

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!reviewerName.trim()) {
      newErrors.reviewerName = 'Reviewer name is required';
    }
    if (!prsNeeded || isNaN(prsNeeded) || parseInt(prsNeeded, 10) < 0) {
      newErrors.prsNeeded = 'PRs Needed must be a valid number (0 or greater)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      onAdd({
        reviewer: reviewerName.trim(),
        prsNeeded: parseInt(prsNeeded, 10),
        prsReviewed: 0,
        gradedPrs: [],
      });
      // Reset form
      setReviewerName('');
      setPrsNeeded('');
      setErrors({});
    }
  };

  const handleCancel = () => {
    setReviewerName('');
    setPrsNeeded('');
    setErrors({});
    onCancel();
  };

  const handleOverlayKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleOverlayClick = e => {
    // Only close if clicking directly on the overlay, not on the modal
    if (e.target === e.currentTarget) {
      handleCancel();
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
        aria-labelledby="add-reviewer-modal-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="add-reviewer-modal-title" className={styles.modalTitle}>
            Add New Reviewer
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
            <div className={styles.formGroup}>
              <label htmlFor="reviewerName" className={styles.label}>
                Reviewer Name <span className={styles.required}>*</span>
              </label>
              <input
                id="reviewerName"
                type="text"
                value={reviewerName}
                onChange={e => {
                  setReviewerName(e.target.value);
                  if (errors.reviewerName) {
                    setErrors(prev => ({ ...prev, reviewerName: '' }));
                  }
                }}
                className={`${styles.input} ${errors.reviewerName ? styles.inputError : ''}`}
                placeholder="Enter reviewer name"
              />
              {errors.reviewerName && <p className={styles.errorMessage}>{errors.reviewerName}</p>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="prsNeeded" className={styles.label}>
                PRs Needed <span className={styles.required}>*</span>
              </label>
              <input
                id="prsNeeded"
                type="number"
                min="0"
                value={prsNeeded}
                onChange={e => {
                  setPrsNeeded(e.target.value);
                  if (errors.prsNeeded) {
                    setErrors(prev => ({ ...prev, prsNeeded: '' }));
                  }
                }}
                className={`${styles.input} ${errors.prsNeeded ? styles.inputError : ''}`}
                placeholder="Enter number of PRs needed"
              />
              {errors.prsNeeded && <p className={styles.errorMessage}>{errors.prsNeeded}</p>}
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={handleCancel}
              className={`${styles.button} ${styles.buttonCancel}`}
            >
              Cancel
            </button>
            <button type="submit" className={`${styles.button} ${styles.buttonConfirm}`}>
              Add Reviewer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddReviewerModal;
