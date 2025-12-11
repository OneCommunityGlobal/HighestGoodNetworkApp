import React, { useState } from "react";
import styles from "./FeedbackModal.module.css";

const ActivityFeedback = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Submit Feedback</h2>
        <div className={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={
                (hover || rating) >= star
                  ? styles.starFilled
                  : styles.starEmpty
              }
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          className={styles.commentBox}
          placeholder="Optional: Add your feedback"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className={styles.buttonRow}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.submitBtn} disabled>
            Submit (Disabled)
          </button>
        </div>

      </div>
    </div>
  );
};

export default ActivityFeedback;
