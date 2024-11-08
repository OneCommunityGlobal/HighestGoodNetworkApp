import { useHistory } from 'react-router-dom';
import styles from './ConfirmationMessage.module.css';

function ConfirmationMessage({ message, isSuccess, confirmationMessageCallback }) {
  const history = useHistory();
  return (
    <div className={styles.confirmationContainer}>
      {isSuccess && <div className={styles.oneCommunityIcon} />}

      {isSuccess && (
        <div className={styles.envelope}>
          <div className={styles.iconContainer}>
            <div className={styles.checkmark}>→</div>
          </div>
        </div>
      )}

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.buttonsContainer}>
        <button
          type="button"
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
}

export default ConfirmationMessage;
