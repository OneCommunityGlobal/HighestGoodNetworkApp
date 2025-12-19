import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './FeedbackModal.module.css';

const ActivityFeedbackModal = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [moreDetails, setMoreDetails] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const darkMode = useSelector(state => state.theme.darkMode);

  const modalRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    const focusable = modalRef.current.querySelectorAll('button, textarea, [role="button"]');
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    const trap = e => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    const escClose = e => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', trap);
    document.addEventListener('keydown', escClose);

    return () => {
      document.removeEventListener('keydown', trap);
      document.removeEventListener('keydown', escClose);
    };
  }, [onClose]);

  const handleSubmit = () => {
    if (!rating) {
      setError('Please select a rating.');
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => onClose(), 1200);
    }, 900);
  };

  const FilledStar = (
    <svg viewBox="0 0 24 24" className={styles.starFilled}>
      <path d="M12 .587l3.668 7.568L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.593z" />
    </svg>
  );

  const EmptyStar = (
    <svg viewBox="0 0 24 24" className={styles.starEmpty}>
      <path
        d="M12 .587l3.668 7.568L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.593z"
        strokeWidth="2"
      />
    </svg>
  );

  return (
    <div
      className={styles.overlay}
      role="button"
      tabIndex={0}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={darkMode ? styles.modalDark : styles.modalLight}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close feedback form">
          ✕
        </button>

        <h2 className={styles.heading}>Activity Feedback</h2>

        {submitted && <div className={styles.success}>Feedback submitted!</div>}

        <div className={styles.starContainer}>
          {[1, 2, 3, 4, 5].map(star => {
            const filled = star <= (hover || rating);
            return (
              <span
                key={star}
                className={styles.starWrapper}
                tabIndex={0}
                role="button"
                aria-label={`Rate ${star} stars`}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => {
                  setRating(star);
                  setError('');
                }}
                onKeyDown={e => {
                  if (e.key === 'ArrowRight' && rating < 5) setRating(rating + 1);
                  if (e.key === 'ArrowLeft' && rating > 1) setRating(rating - 1);
                  if (e.key === 'Enter') setRating(star);
                }}
              >
                {filled ? FilledStar : EmptyStar}
              </span>
            );
          })}
        </div>

        {error && (
          <div ref={errorRef} className={styles.error}>
            {error}
          </div>
        )}

        <textarea
          className={styles.commentBox}
          maxLength={300}
          placeholder="Optional: Add your feedback"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <div className={comment.length > 250 ? styles.charCountWarning : styles.charCount}>
          {comment.length}/300
        </div>

        <button className={styles.moreDetailsBtn} onClick={() => setShowMore(!showMore)}>
          {showMore ? 'Hide Additional Details' : 'Add More Details'}
        </button>

        {showMore && (
          <textarea
            className={styles.moreDetailsBox}
            placeholder="Additional optional information..."
            value={moreDetails}
            onChange={e => setMoreDetails(e.target.value)}
          />
        )}

        <button
          className={rating ? styles.submitButton : styles.submitButtonDisabled}
          onClick={handleSubmit}
          aria-disabled={loading || !rating}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
};

export default ActivityFeedbackModal;
