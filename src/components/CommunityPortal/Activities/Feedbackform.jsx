import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addEventFeedback } from '../../../actions/communityPortal/eventFeedback';
import styles from './Feedbackform.module.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Spinner } from 'reactstrap';
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
  // Reject control/invisible characters
  if (/[\x00-\x1F\x7F\u200B-\u200F]/.test(trimmed)) return false;

  // Basic structure check
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(trimmed)) return false;

  // Extract TLD
  const domain = trimmed.split('@')[1];
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;

  const TLD = domainParts[domainParts.length - 1].toLowerCase();

  return validTLDs.has(TLD);
};
function Feedbackform() {
  const dispatch = useDispatch();
  const { eventId, email } = useParams();
  const initialFormState = { eventId: eventId, name: '', email: '', rating: 0, comments: '' };

  const [formData, setFormData] = useState({
    ...initialFormState,
  });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [acceptCommentsEmpty, setAcceptCommentsEmpty] = useState(false);

  const handleToggle = () => {
    setModal(!modal);
  };

  const handleModalNoLetMeEnter = () => {
    setModal(false);
    setAcceptCommentsEmpty(false);
  };

  const handleModalYesLeaveEmpty = () => {
    setModal(false);
    setAcceptCommentsEmpty(true);
  };

  // Reset override when comment changes
  useEffect(() => {
    setAcceptCommentsEmpty(false);
  }, [formData.comments]);

  useEffect(() => {
    if (acceptCommentsEmpty) {
      handleSubmit();
    }
  }, [acceptCommentsEmpty]);

  const handleSubmit = e => {
    if (e && e.preventDefault) {
      e.preventDefault(); // Prevent page reload
    }
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!isValidName(formData.name)) {
      newErrors.name =
        'Name is required and can only contain letters, spaces, hyphens, or apostrophes.';
    } else {
      delete newErrors.name;
      setErrors(newErrors);
    }
    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Enter a valid Email address';
    } else {
      delete newErrors.email;
      setErrors(newErrors);
    }

    if (formData.rating === 0) {
      const errorMsg = 'Please select a rating';
      newErrors.rating = errorMsg;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!formData.comments.trim() && !acceptCommentsEmpty) {
      setModal(true);
      return;
    }

    const eventFeedback = {
      ...formData,
    };
    dispatch(addEventFeedback(eventFeedback));
    setFormData({ ...initialFormState });
    const emptyMsg = '';
    setErrors([]);
    setAcceptCommentsEmpty(false);
  };

  // Reset form fields when Cancel is clicked
  const handleCancel = () => {
    const emptyMsg = '';
    setErrors(emptyMsg);
    setFormData({ ...initialFormState });
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
      <p>
        We appreciate your participation in our event. Please provide your feedback to help us
        improve.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          <span className={styles.required}>Name</span>
          <input
            name="name"
            type="text"
            placeholder="Enter full name"
            onChange={handleChange}
            value={formData.name}
            required
          />
        </label>
        {errors.name && <div className={styles['error-text']}> {errors.name} </div>}

        <label>
          <span className={styles.required}>Email Address</span>
          <input
            name="email"
            type="email"
            placeholder="abc@gmail.com"
            onChange={handleChange}
            value={formData.email}
            required
          />
        </label>
        {errors.email && <div className={styles['error-text']}> {errors.email} </div>}

        <strong>
          <span className={styles.required}>Rate your experience </span>
        </strong>

        <div className={styles['star-rating']} role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              role="radio"
              aria-checked={formData.rating === star}
              onClick={() => handleRating(star)}
              tabIndex={
                formData.rating === 0 ? (star === 1 ? 0 : -1) : formData.rating === star ? 0 : -1
              }
              onKeyDown={e => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  handleRating(Math.max(1, formData.rating - 1));
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  handleRating(Math.min(5, formData.rating + 1));
                } else if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRating(star);
                }
              }}
              className={`${styles.star} ${star <= formData.rating ? styles.selected : ''}`}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        {errors.rating && <div className={styles['error-text']}>{errors.rating}</div>}
        <label>
          Comments
          <textarea
            name="comments"
            placeholder="Add your extra thoughts.."
            onChange={handleChange}
            value={formData.comments}
          />
        </label>

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
        <Modal className="Modal-container" isOpen={modal} toggle={handleToggle}>
          <ModalHeader toggle={handleToggle}> Missing Comments </ModalHeader>
          <ModalBody>
            Oops, it looks like you haven&#39;t entered any comments. We&#39;d really appreciate
            your feedback! Are you sure you want to leave it empty?
          </ModalBody>
          <ModalFooter>
            <div className={styles['modal-button-group']}>
              <Button color="primary" onClick={handleModalNoLetMeEnter}>
                No, Let me Enter
              </Button>
              <Button color="secondary" onClick={handleModalYesLeaveEmpty}>
                Yes, Leave Empty
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default Feedbackform;
