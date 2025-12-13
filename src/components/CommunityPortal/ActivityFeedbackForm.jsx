import React, { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./FeedbackModal.module.css";

const ActivityFeedbackModal = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const darkMode = useSelector((state) => state.theme.darkMode);

  const handleSubmit = () => {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => onClose(), 1200);
    }, 900);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={darkMode ? styles.modalDark : styles.modalLight}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles.heading}>Activity Feedback</h2>

        {submitted && <div className={styles.success}>Feedback submitted!</div>}
        <div className={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hover || rating);

            return (
              <span
                key={star}
                className={styles.starWrapper}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => {
                  setRating(star);
                  setError("");
                }}
              >
                {filled ? (
                  <svg
                    className={styles.starFilledIcon}
                    viewBox="0 0 24 24"
                    fill="#ffb400"
                  >
                    <path d="M12 .587l3.668 7.568L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.593z" />
                  </svg>
                ) : (
                  <svg
                    className={styles.starEmptyIcon}
                    viewBox="0 0 24 24"
                    stroke="#ccc"
                    fill="none"
                    strokeWidth="2"
                  >
                    <path d="M12 .587l3.668 7.568L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.593z" />
                  </svg>
                )}
              </span>
            );
          })}
        </div>

        {error && <div className={styles.error}>{error}</div>}
        <textarea
          className={styles.commentBox}
          maxLength={300}
          placeholder="Optional: Add your feedback"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className={styles.charCount}>{comment.length}/300</div>
        <button
          className={rating ? styles.submitButton : styles.submitButtonDisabled}
          disabled={!rating || loading}
          onClick={handleSubmit}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
};

export default ActivityFeedbackModal;
