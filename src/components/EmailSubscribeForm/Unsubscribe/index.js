// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { set } from 'lodash';
import styles from './SubscribePage.module.css'; // Import the CSS module
import {
  removeNonHgnUserEmailSubscription,
  addNonHgnUserEmailSubscription,
} from '../../../actions/sendEmails';
import ConfirmationMessage from './ConfirmationMessage';

function SubscribePage() {
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationStatus, setConfirmationStatus] = useState(false);
  useEffect(() => {
    const queryemail = query.get('email');
    if (queryemail) {
      removeNonHgnUserEmailSubscription(email).then(result => {
        if (result.success) {
          // Handle success
          setConfirmationStatus(true);
          setConfirmationMessage('Successfully removed email subscription');
        } else {
          // Handle failure
          setConfirmationStatus(true);
          setConfirmationMessage('Successfully removed email subscription');
        }
      });
    }
  }, [query]);

  const validateEmail = emailval => {
    return /\S+@\S+\.\S+/.test(emailval);
  };

  const confirmationMessageCallback = () => {
    setConfirmationMessage('');
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (validateEmail(email)) {
      dispatch(addNonHgnUserEmailSubscription(email));
      // console.log('Email valid, submit to the server:', email);
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

  return (
    <div className={styles.subscribeContainer}>
      <h1 className={styles.header}>Subscribe for Weekly Updates</h1>
      {/* ... */}
      <p className={styles.description}>
        Join our mailing list for updates. We&apos;ll send a confirmation to ensure you&apos;re the
        owner of the email provided. Once confirmed, we promise only a single email per week.
        Don&apos;t forget to check your spam folder if you didn&apos;t receive the confirmation!
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
      {/* ... */}
    </div>
  );
}

export default SubscribePage;
