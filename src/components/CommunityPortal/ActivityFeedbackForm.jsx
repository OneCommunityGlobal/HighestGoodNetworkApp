import React, { useState } from "react";
import styles from "./FeedbackModal.module.css";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const ActivityFeedbackForm = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => onClose(), 1200);
    }, 800);
  };

  const canSubmit = rating > 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Submit Feedback</h2>

        {submitted && <div className={styles.success}>Feedback submitted!</div>}

        <div className={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((value) => {
            const filled = (hover || rating) >= value;
            return (
              <span
                key={value}
                className={styles.starWrapper}
                role="button"
                tabIndex={0}
                aria-label={`Rate ${value} stars`}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                onClick={() => {
                  setRating(value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setRating(value);
                }}
              >
                {filled ? (
                  <StarIcon className={styles.starFilledIcon} />
                ) : (
                  <StarBorderIcon className={styles.starEmptyIcon} />
                )}
              </span>
            );
          })}
        </div>

        <textarea
          className={styles.commentBox}
          maxLength={300}
          placeholder="Optional: Add your feedback (max 300 characters)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className={styles.charCount}>{comment.length}/300</div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonRow}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className={canSubmit ? styles.submitBtnActive : styles.submitBtnDisabled}
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeedbackForm;
