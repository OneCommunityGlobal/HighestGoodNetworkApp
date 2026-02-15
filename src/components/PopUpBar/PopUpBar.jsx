import Loading from '../common/Loading';
import styles from './PopUpBar.module.css';

function PopUpBar({
  firstName = window.viewingUser?.firstName,
  lastName = window.viewingUser?.lastName,
  message,
  onClickClose,
  textColor = '#000',
  isLoading = false,
  // eslint-disable-next-line no-unused-vars
  button = true,
}) {
  const defaultTemplate =
    `You are currently functioning as ${firstName} ${lastName}, ` +
    `you only have the permissions of ${firstName}`;

  const displayText = message ?? defaultTemplate;

  return (
    <div
      className={`${styles.popupContainer}`}
      data-testid="test-popup"
      style={{ color: textColor }}
    >
      {isLoading ? <Loading /> : <p className="popup_message">{displayText}</p>}
      <button type="button" className={`${styles.closeButton}`} onClick={onClickClose}>
        X
      </button>
    </div>
  );
}

export default PopUpBar;
