import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addEventFeedback } from '../../../actions/communityPortal/eventFeedback';
import styles from './Feedbackform.module.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const isValidName = name => {
  if (!name || name.trim() === '') return false;
  const allowedChars = new Set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ -'");
  for (let chr of name) {
    if (!allowedChars.has(chr)) return false;
  }
  return true;
};

const isValidEmail = email => {
  const validTLDs = new Set([
    'com',
    'org',
    'net',
    'edu',
    'gov',
    'io',
    'co',
    'uk',
    'us',
    'ca',
    'de',
    'jp',
    'fr',
    'au',
    'in',
    'cn',
    'br',
    'es',
    'it',
    'info',
    'biz',
    'xyz',
    'me',
    'tv',
    'online',
    'store',
    'ai',
  ]);

  if (typeof email !== 'string') return false;
  if (!email || email.includes(' ')) return false;
  const trimmed = email.trim();
  if (/[\x00-\x1F\x7F\u200B-\u200F]/.test(trimmed)) return false;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(trimmed)) return false;

  const domainParts = trimmed.split('@')[1].split('.');
  const TLD = domainParts[domainParts.length - 1].toLowerCase();

  return validTLDs.has(TLD);
};

function Feedbackform() {
  const dispatch = useDispatch();
  const { eventId } = useParams();

  /** 🔹 Dynamic event context (read-only, safe) */
  const event = useSelector(state =>
    state.communityEvents?.events?.find(e => String(e._id) === String(eventId)),
  );

  const eventName = event?.name || 'This Event';
  const eventDate = event?.date
    ? new Date(event.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const initialFormState = {
    eventId,
    name: '',
    email: '',
    rating: 0,
    comments: '',
  };

  const [formData, setFormData] = useState({ ...initialFormState });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [acceptCommentsEmpty, setAcceptCommentsEmpty] = useState(false);

  const handleToggle = () => setModal(!modal);

  const handleModalNoLetMeEnter = () => {
    setModal(false);
    setAcceptCommentsEmpty(false);
  };

  const handleModalYesLeaveEmpty = () => {
    setModal(false);
    setAcceptCommentsEmpty(true);
  };

  useEffect(() => {
    setAcceptCommentsEmpty(false);
  }, [formData.comments]);

  useEffect(() => {
    if (acceptCommentsEmpty) handleSubmit();
  }, [acceptCommentsEmpty]);

  const handleSubmit = e => {
    if (e?.preventDefault) e.preventDefault();

    const newErrors = {};

    if (!isValidName(formData.name)) {
      newErrors.name =
        'Please enter your full name. Letters, spaces, hyphens, and apostrophes only.';
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!formData.comments.trim() && !acceptCommentsEmpty) {
      setModal(true);
      return;
    }

    dispatch(addEventFeedback({ ...formData }));
    setFormData({ ...initialFormState });
    setErrors({});
    setAcceptCommentsEmpty(false);
  };

  const handleCancel = () => {
    setFormData({ ...initialFormState });
    setErrors({});
    setAcceptCommentsEmpty(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRating = star => {
    setFormData(prev => ({ ...prev, rating: star }));
  };

  return (
    <div className={styles['Feedback-form-container']}>
      <h2>Event Feedback</h2>

      {/* ✅ Dynamic event context */}
      <div className={styles.eventContext}>
        <strong>{eventName}</strong>
        {eventDate && <div className={styles.eventDate}>{eventDate}</div>}
      </div>

      <p className={styles.helperText}>
        This feedback helps us improve future events. It takes less than 2 minutes to complete.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">
          <span className={styles.required}>Name</span>
        </label>
        <p id="name-helper" className={styles.fieldHelper}>
          Required so we can associate feedback with attendance if needed.
        </p>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          onChange={handleChange}
          value={formData.name}
          aria-describedby="name-helper"
          required
        />
        {errors.name && <div className={styles['error-text']}>{errors.name}</div>}

        <label htmlFor="email">
          <span className={styles.required}>Email Address</span>
        </label>
        <p id="email-helper" className={styles.fieldHelper}>
          Required in case we need to follow up on your feedback.
        </p>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          onChange={handleChange}
          value={formData.email}
          aria-describedby="email-helper"
          required
        />
        {errors.email && <div className={styles['error-text']}>{errors.email}</div>}

        <strong className={styles.ratingLabel}>
          <span className={styles.required}>Rate your experience</span>
        </strong>
        <p id="rating-helper" className={styles.fieldHelper}>
          1 = Very poor, 5 = Excellent
        </p>

        <div className={styles['star-rating']} role="radiogroup" aria-labelledby="rating-helper">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              role="radio"
              aria-checked={formData.rating === star}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              tabIndex={formData.rating === star || (formData.rating === 0 && star === 1) ? 0 : -1}
              onClick={() => handleRating(star)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRating(star);
                }
              }}
              className={`${styles.star} ${star <= formData.rating ? styles.selected : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        {errors.rating && <div className={styles['error-text']}>{errors.rating}</div>}

        <label htmlFor="comments">Comments (optional)</label>
        <p id="comments-helper" className={styles.fieldHelper}>
          Share anything specific you liked or think we could improve.
        </p>
        <textarea
          id="comments"
          name="comments"
          placeholder="Your thoughts..."
          onChange={handleChange}
          value={formData.comments}
          aria-describedby="comments-helper"
        />

        <div className={styles['button-group']}>
          <button type="submit" className={styles['submit-button']}>
            Submit Feedback
          </button>
          <button type="button" className={styles['cancel-button']} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>

      {modal && (
        <Modal isOpen={modal} toggle={handleToggle}>
          <ModalHeader toggle={handleToggle}>Missing Comments</ModalHeader>
          <ModalBody>
            You haven’t entered any comments. Are you sure you want to submit without additional
            feedback?
          </ModalBody>
          <ModalFooter className={styles['modal-button-group']}>
            <Button color="primary" onClick={handleModalNoLetMeEnter}>
              No, let me add comments
            </Button>
            <Button color="secondary" onClick={handleModalYesLeaveEmpty}>
              Yes, submit anyway
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default Feedbackform;
