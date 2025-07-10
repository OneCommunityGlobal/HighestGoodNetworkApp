import { useHistory } from 'react-router-dom';
import styles from './ConfirmationMessage.module.css'; // Make sure to create this CSS module

function ConfirmationMessage({ message, isSuccess, confirmationMessageCallback }) {
  const history = useHistory();
  return (
    <div className={styles.confirmationContainer}>
      {isSuccess && <div className={styles.oneCommunityIcon} />}
      <p />
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
      {!isSuccess && <h2>{message}</h2>}
      <div className={styles.buttonsContainer}>
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            history.push('/subscribe');
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
