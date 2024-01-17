import React, { useState } from 'react';
import styles from './SubscribePage.module.css'; // Import the CSS module
import { addNonHgnUserEmailSubscription } from '../../actions/sendEmails';
import { useDispatch } from 'react-redux';

const SubscribePage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = email => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (validateEmail(email)) {
      dispatch(addNonHgnUserEmailSubscription(email));
      console.log('Email valid, submit to the server:', email);
      setEmail('');
      setError('');
    } else {
      setError('Please enter a valid email address.');
    }
  };

  return (
    <div className={styles.subscribeContainer}>
      <h1 className={styles.header}>Subscribe for Weekly Updates</h1>
      {/* ... */}
      <p className={styles.description}>
        Join our mailing list for updates. We'll send a confirmation to ensure you're the owner of
        the email provided. Once confirmed, we promise only a single email per week. Don't forget to
        check your spam to stay informed!
      </p>
      <p className={styles.note}>
        Want to opt out later? No problem, every email has an unsubscribe link at the bottom.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
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
};

export default SubscribePage;
