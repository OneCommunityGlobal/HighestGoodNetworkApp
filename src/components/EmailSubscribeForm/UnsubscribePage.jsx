import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from './SubscribePage.module.css'; // Reuse the same styles as SubscribePage
import { removeNonHgnUserEmailSubscription } from '../../actions/sendEmails';

function UnsubscribePage() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isUnsubscribed, setIsUnsubscribed] = useState(false); // State to track if unsubscribed

  const validateEmail = emailval => {
    return /\S+@\S+\.\S+/.test(emailval);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    try {
      // Dispatch the unsubscribe action and wait for the result
      const unsubscribeAction = removeNonHgnUserEmailSubscription(email);
      const result = await dispatch(unsubscribeAction);

      // If successful, update the state to show the unsubscribed message
      if (result.success) {
        setIsUnsubscribed(true);
      } else {
        // If the result indicates failure, show an error message
        setError(result.message || 'Failed to unsubscribe. Please try again.');
      }
    } catch (err) {
      // Handle unexpected errors
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (isUnsubscribed) {
    // Show the "Email unsubscribed" message
    return (
      <div className={styles.subscribeContainer}>
        <div className={styles.oneCommunityIcon} />
        <h1 className={styles.header}>Email Unsubscribed</h1>
        <p className={styles.description}>
          Your email has been successfully unsubscribed. You will no longer receive weekly updates.
        </p>
      </div>
    );
  }

  // Default unsubscribe form
  return (
    <div className={styles.subscribeContainer}>
      <div className={styles.oneCommunityIcon} />
      <h1 className={styles.header}>Unsubscribe from Weekly Emails</h1>
      <p className={styles.description}>
        Sorry to see you go! Enter your email below to unsubscribe from our weekly updates. You’ll
        stop receiving all future mailings once you confirm.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={`${styles.inputField} ${error ? styles.error : ''}`}
        />
        <button className={styles.subscribeButton} type="submit">
          Unsubscribe
        </button>
        {error && <div className={styles.errorMessage}>{error}</div>}
      </form>
    </div>
  );
}

export default UnsubscribePage;
