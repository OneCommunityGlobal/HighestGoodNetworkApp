// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useHistory } from 'react-router-dom';
import styles from './ConfirmationMessage.module.css'; // Make sure to create this CSS module

// function ConfirmationMessage({ message, isSuccess, confirmationMessageCallback }) {
function ConfirmationMessage({ isSuccess, confirmationMessageCallback }) {
  const history = useHistory();
  return (
    <div className={styles.confirmationContainer}>
      {isSuccess && <div className={styles.oneCommunityIcon} />}
      <p />
      <p />
      <div className={styles.envelope}>
        <div className={styles.iconContainer}>
          <div className={styles.checkmark}>→</div>
        </div>
      </div>
      <p />
      <div className={styles.buttonsContainer}>
        <button
          className={styles.button}
          type="button"
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
}

export default ConfirmationMessage;
