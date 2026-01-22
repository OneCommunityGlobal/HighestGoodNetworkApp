import { useHistory } from 'react-router-dom';
import styles from './ConfirmationMessage.module.css'; // Make sure to create this CSS module

function ConfirmationMessage({ message, isSuccess, confirmationMessageCallback }) {
  const history = useHistory();
  return (
    <div className={styles.confirmationContainer}>
      {isSuccess && <div className={styles.oneCommunityIcon} />}
      <p />
      {/* {isSuccess && (
        <div className={styles.envelope}>
          <div className={styles.iconContainer}>
            <div className={styles.checkmark}>✓</div>
          </div>
        </div>
      )} */}
      {/* Fix1: Indicating to the user that their email has been successfully verified */}
      {isSuccess && (
        <div className={styles.envelope}>
          <div className={styles.iconContainer}>
            <div className={styles.checkmark}>✓</div>
          </div>
        </div>
      )}
      {isSuccess && (
        <h2 className={styles.successHeading}>Your email has been successfully verified!</h2>
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
