import React, { useState } from 'react';
import StarRating from './StarRating';
import styles from './styles/FeedbackModal.module.css';

function FeedbackModal({ isOpen, onClose, onFeedbackSubmitted, hasSubmitted, activityId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Reset form state when component mounts or when hasSubmitted changes
  React.useEffect(() => {
    if (!hasSubmitted) {
      setRating(0);
      setComment('');
      setCharCount(0);
      setErrorMessage('');
      setSuccessMessage('');
      setSubmitted(false);
    }
  }, [hasSubmitted]);

  const handleCommentChange = e => {
    const newComment = e.target.value;
    setComment(newComment);
    setCharCount(newComment.length);
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Prevent resubmission if already submitted
    if (hasSubmitted) {
      setErrorMessage('You have already submitted feedback for this activity.');
      return;
    }

    if (rating === 0) {
      setErrorMessage('Please select a rating.');
      setSuccessMessage(''); // Clear any success message
    } else {
      setErrorMessage('');
      setSuccessMessage(
        'Thank you for submitting the feedback! We appreciate you taking the time to submit.',
      );
      setSubmitted(true);

      // Call the callback to mark feedback as submitted
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

      // Optional: Clear form after successful submission
      // setRating(0);
      // setComment('');
      // setCharCount(0);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose(); // Call the parent function to hide the modal
    }
  };

  const handleOverlayClick = e => {
    if (e.target.classList.contains(styles['modal-overlay'])) {
      handleClose();
    }
  };

  const handleOverlayKeyDown = e => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return isOpen ? (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className={styles['modal-overlay']}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label="Feedback modal"
    >
      <div className={styles['modal-content']}>
        <span
          className={styles['close-icon']}
          onClick={handleClose}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClose();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
        >
          &times;
        </span>
        <h2 className={styles.headerFeedback}>Your feedback is very important to us!</h2>

        {hasSubmitted && !submitted && (
          <div>
            <p className={styles['success-message']}>
              You have already submitted feedback for this activity.
            </p>
            <p className={styles.para}>Thank you for your feedback!</p>
            <div className={styles['modal-buttons']}>
              <button type="button" className={styles['cancel-btn']} onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {submitted && <p className={styles['success-message']}>{successMessage}</p>}

        {!hasSubmitted && !submitted && (
          <div>
            <p className={styles.para}>
              If you can, please tell us what parts you are not happy or satisfied with.
            </p>
            <form onSubmit={handleSubmit}>
              <StarRating onRate={setRating} />
              {errorMessage && <p className={styles['error-message']}>{errorMessage}</p>}
              <textarea
                className={styles.textarea}
                value={comment}
                onChange={handleCommentChange}
                placeholder="Please leave your feedback (optional)"
                maxLength="300"
              />
              <div className={styles['char-count']}>{charCount}/300</div>
              <div className={styles['modal-buttons']}>
                <button type="submit" className={styles['submit-btn']} disabled={rating === 0}>
                  Submit Feedback
                </button>
                <button type="button" className={styles['cancel-btn']} onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  ) : null;
}

export default FeedbackModal;
