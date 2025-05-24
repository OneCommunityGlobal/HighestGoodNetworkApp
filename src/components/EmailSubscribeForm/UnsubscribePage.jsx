import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from './SubscribePage.module.css'; // Reuse same styles
import { removeNonHgnUserEmailSubscription } from '../../actions/sendEmails';
import ConfirmationMessage from './ConfirmationMessage';

function UnsubscribePage() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationStatus, setConfirmationStatus] = useState(null); // null = no message yet

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
    setEmail('');
    dispatch(removeNonHgnUserEmailSubscription(email));

    // Just show confirmation immediately, since toast handles the rest
    setConfirmationMessage('If this email was subscribed, you will no longer receive updates.');
    setConfirmationStatus(true);
  };

  const confirmationMessageCallback = () => {
    setConfirmationMessage('');
    setConfirmationStatus(null);
  };

  return (
    <div className={styles.subscribeContainer}>
      <h1 className={styles.header}>Unsubscribe from Weekly Emails</h1>
      <p className={styles.description}>
        Sorry to see you go! Enter your email below to unsubscribe from our weekly updates. You’ll
        stop receiving all future mailings once you confirm.
      </p>

      {confirmationMessage && (
        <ConfirmationMessage
          message={confirmationMessage}
          isSuccess={confirmationStatus}
          confirmationMessageCallback={confirmationMessageCallback}
        />
      )}

      {!confirmationStatus && (
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
      )}
    </div>
  );
}

export default UnsubscribePage;
