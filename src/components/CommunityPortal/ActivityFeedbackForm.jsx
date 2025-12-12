import React, { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./FeedbackPage.module.css";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const ActivityFeedbackPage = () => {
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
    }, 900);
  };

  return (
    <div className={darkMode ? styles.pageDark : styles.pageLight}>
      <div className={styles.container}>

        <h1 className={styles.heading}>Activity Feedback</h1>

        {submitted && <div className={styles.success}>Feedback submitted!</div>}

        {/*5-STAR RATING SYSTEM */}
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
                  <StarIcon className={styles.starFilledIcon} />
                ) : (
                  <StarBorderIcon className={styles.starEmptyIcon} />
                )}
              </span>
            );
          })}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* COMMENT BOX */}
        <textarea
          className={styles.commentBox}
          maxLength={300}
          placeholder="Optional: Add your feedback (max 300 characters)"
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

export default ActivityFeedbackPage;
