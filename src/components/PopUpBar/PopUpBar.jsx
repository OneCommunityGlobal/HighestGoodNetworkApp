import Loading from '~/components/common/Loading';
import styles from './PopUpBar.module.css';

function PopUpBar({
  firstName = window.viewingUser?.firstName,
  lastName = window.viewingUser?.lastName,
  message,
  onClickClose,
  textColor = '#000',
  isLoading = false,
  button = true,
}) {
  const defaultTemplate =
    `You are currently functioning as ${firstName} ${lastName}, ` +
    `you only have the permissions of ${firstName}`;

  const displayText = message ?? defaultTemplate;

  return (
    <div className={styles.popup_container} data-testid="test-popup" style={{ color: textColor }}>
      {isLoading ? <Loading /> : <p className={styles.popup_message}>{displayText}</p>}

      {button && (
        <button type="button" className={styles.close_button} onClick={onClickClose}>
          X
        </button>
      )}
    </div>
  );
}

export default PopUpBar;
