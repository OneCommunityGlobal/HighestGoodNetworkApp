// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import confetti from 'canvas-confetti'; // Import canvas-confetti
import styles from './SubscribePage.module.css';
import {
  addNonHgnUserEmailSubscription,
  confirmNonHgnUserEmailSubscription,
} from '../../actions/sendEmails';
import ConfirmationMessage from './ConfirmationMessage';

function SubscribePage() {
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationStatus, setConfirmationStatus] = useState(false);
  const [showThanksPage, setShowThanksPage] = useState(false); // State to control the body content

  useEffect(() => {
    const token = query.get('token');
    if (token) {
      confirmNonHgnUserEmailSubscription(token).then(result => {
        if (result.success) {
          setConfirmationStatus(true);
          setShowThanksPage(true); // Show the "Thanks for subscribing!" page
        } else {
          setConfirmationStatus(false);
          setConfirmationMessage('Confirmation expired, please try again');
        }
      });
    }
  }, [query]);

  // Trigger confetti when the "Thanks for subscribing!" page is shown
  useEffect(() => {
    if (showThanksPage) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [showThanksPage]); // Run only when `showThanksPage` changes to `true`

  const validateEmail = emailval => {
    return /\S+@\S+\.\S+/.test(emailval);
  };

  const confirmationMessageCallback = () => {
    setConfirmationMessage('');
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (validateEmail(email)) {
      dispatch(addNonHgnUserEmailSubscription(email, () => setShowThanksPage(true))); // Pass callback to change body
      setEmail('');
      setError('');
    } else {
      setError('Please enter a valid email address.');
    }
  };

  if (confirmationMessage) {
    return (
      <ConfirmationMessage
        message={confirmationMessage}
        isSuccess={confirmationStatus}
        confirmationMessageCallback={confirmationMessageCallback}
      />
    );
  }

  // If the "Thanks for subscribing!" page should be shown
  if (showThanksPage) {
    return (
      <div className={styles.thanksContainer}>
        <div className={styles.oneCommunityIcon} />
        <div className={styles.thanksMessage}>Thanks for subscribing!</div>
      </div>
    );
  }

  // Default subscription form (if email is not confirmed)
  return (
    <div className={styles.subscribeContainer}>
      <div className={styles.oneCommunityIcon} />
      <h1 className={styles.header}>Subscribe for Weekly Updates</h1>
      <p className={styles.description}>
        Join our mailing list for updates. We&apos;ll send a confirmation to ensure you&apos;re the
        owner of the email provided. Once confirmed, we promise only a single email per week.
      </p>
      <p className={styles.note}>
        Want to opt out later? No problem, every email has an unsubscribe link at the bottom.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={`${styles.inputField} ${error ? styles.error : ''}`}
        />
        <button className={styles.subscribeButton} type="submit">
          Subscribe
        </button>
        {error && <div className={styles.errorMessage}>{error}</div>}
      </form>
    </div>
  );
}

export default SubscribePage;
