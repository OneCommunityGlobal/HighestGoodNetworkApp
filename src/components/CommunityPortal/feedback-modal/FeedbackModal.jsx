import React, { useState } from 'react';
import StarRating from './StarRating';
import './styles/FeedbackModal.css';

function FeedbackModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCommentChange = e => {
    const newComment = e.target.value;
    setComment(newComment);
    setCharCount(newComment.length);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage('Please select a rating.');
      setSuccessMessage(''); // Clear any success message
    } else {
      setErrorMessage('');
      setSuccessMessage(
        'Thank you for submitting the feedback! We appreciate you taking the time to submit.',
      );
      setSubmitted(true);
      // Optional:
      setRating(0);
      setComment('');
      setCharCount(0);
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

  return isOpen ? (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <span className="close-icon" onClick={handleClose}>
          &times;
        </span>
        <h2 className="header-feedback">Your feedback is very important to us!</h2>
        {submitted && <p className="success-message">{successMessage}</p>}
        {!submitted && (
          <p className="para">
            If you can, please tell us what parts you are not happy or satisfied with.
          </p>
        )}
        {!submitted && (
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
        )}
      </div>
    </div>
  ) : null;
}

export default FeedbackModal;
