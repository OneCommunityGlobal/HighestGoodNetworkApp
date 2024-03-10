import React from 'react';
import styles from './ConfirmationMessage.module.css'; // Make sure to create this CSS module
import { useHistory } from 'react-router-dom';

const ConfirmationMessage = ({ message, isSuccess, confirmationMessageCallback }) => {
  const history = useHistory();
  return (
    <div className={styles.confirmationContainer}>
      {isSuccess && <div className={styles.oneCommunityIcon}></div>}
      <p></p>
      {isSuccess && (
        <div className={styles.envelope}>
          <div className={styles.iconContainer}>
            <div className={styles.checkmark}>✓</div>
          </div>
        </div>
      )}
      {!isSuccess && (
        <div className={styles.envelope}>
          <div className={styles.iconContainer}>
            <div className={styles.crossmark}>✖</div>
          </div>
        </div>
      )}
      {!isSuccess ? (
        <h2>
          {' '}
          <p></p>
          {message}
        </h2>
      ) : (
        <h2></h2>
      )}
      <div className={styles.buttonsContainer}>
        <button
          className={styles.button}
          onClick={() => {
            history.push('/email-subscribe');
            confirmationMessageCallback();
          }}
        >
          Enter New Email
        </button>
      </div>
    </div>
  );
};

export default ConfirmationMessage;
