import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input } from 'reactstrap';
import styles from './FeedbackActivityModal.module.css';

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSubmit?: (payload: { rating: number; comment: string }) => Promise<void> | void
 */
export default function FeedbackActivityModal({ isOpen, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const MAX_LEN = 300;

  const handleSubmit = async () => {
    const payload = { rating, comment: comment.trim() };
    if (payload.rating === 0 || payload.comment.length === 0) return;

    // 👇 You asked to see this in console for future reuse
    // (e.g., to pass to another component or API)
    // eslint-disable-next-line no-console
    console.log('Feedback payload:', payload);

    try {
      setSubmitting(true);
      if (onSubmit) await onSubmit(payload);
      setSubmitted(true); // swap to success view
    } finally {
      setSubmitting(false);
    }
  };

  const closeAndReset = () => {
    setRating(0);
    setHover(0);
    setComment('');
    setSubmitting(false);
    setSubmitted(false);
    onClose?.();
  };

  return (
    <Modal isOpen={isOpen} toggle={closeAndReset} centered>
      <ModalHeader toggle={closeAndReset} className={styles.header}>
        <div className={styles.headerTitle}>Your feedback is very important to us!</div>
      </ModalHeader>

      {submitted ? (
        <ModalBody className={styles.successBody}>
          <div className={styles.successText}>
            Thank you for submitting the feedback! We appreciate you taking the time to submit.
          </div>
        </ModalBody>
      ) : (
        <ModalBody>
          <div className={styles.subtitle}>
            If you can, please tell us what parts you are not happy or satisfied with.
          </div>

          {/* Stars */}
          <div className={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => {
              const filled = (hover || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onFocus={() => setHover(star)}
                  onBlur={() => setHover(0)}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  className={`${styles.star} ${filled ? styles.starFilled : ''}`}
                >
                  ★
                </button>
              );
            })}
          </div>

          {/* Comment + counter */}
          <div className={styles.commentWrap}>
            <Input
              type="textarea"
              rows="6"
              maxLength={MAX_LEN}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="The event was..."
              className={styles.textarea}
            />
            <div className={styles.counter}>
              {comment.length}/{MAX_LEN}
            </div>
          </div>
        </ModalBody>
      )}

      {!submitted ? (
        <ModalFooter className={styles.footerRow}>
          <Button
            color="success"
            onClick={handleSubmit}
            disabled={submitting || rating === 0 || comment.trim().length === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
          <Button color="danger" onClick={closeAndReset}>
            Cancel
          </Button>
        </ModalFooter>
      ) : (
        <ModalFooter className={styles.footerCenter}>
          <Button color="primary" onClick={closeAndReset}>
            Close
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}
