import React, { useState } from 'react';
import StarRating from './StarRating';
import './styles/FeedbackModal.css';

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
    if (e.target.className === 'modal-overlay') {
      handleClose();
    }
  };

  const handleOverlayKeyDown = e => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return isOpen ? (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-content">
        <span 
          className="close-icon" 
          onClick={handleClose}
          onKeyDown={(e) => {
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
        <h2 className="header-feedback">Your feedback is very important to us!</h2>
        
        {hasSubmitted && !submitted && (
          <div>
            <p className="success-message">You have already submitted feedback for this activity.</p>
            <p className="para">Thank you for your feedback!</p>
            <div className="modal-buttons">
              <button type="button" className="cancel-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        )}
        
        {submitted && <p className="success-message">{successMessage}</p>}
        
        {!hasSubmitted && !submitted && (
          <div>
            <p className="para">
              If you can, please tell us what parts you are not happy or satisfied with.
            </p>
            <form onSubmit={handleSubmit}>
              <StarRating onRate={setRating} />
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder="Please leave your feedback (optional)"
                maxLength="300"
              />
              <div className="char-count">{charCount}/300</div>
              <div className="modal-buttons">
                <button type="submit" className="submit-btn" disabled={rating === 0}>
                  Submit Feedback
                </button>
                <button type="button" className="cancel-btn" onClick={handleClose}>
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
