import Loading from '../common/Loading';
import PropTypes from 'prop-types';
import styles from './PopUpBar.module.css';

function PopUpBar({
  firstName = window.viewingUser?.firstName,
  lastName = window.viewingUser?.lastName,
  message,
  onClickClose,
  textColor = '#000',
  isLoading = false,
  button = true,
  isMeetingNotification = false,
}) {
  const defaultTemplate =
    `You are currently functioning as ${firstName} ${lastName}, ` +
    `you only have the permissions of ${firstName}`;

  const displayText = message ?? defaultTemplate;

  const containerClass = [
    styles.popupContainer,
    textColor === 'black_text' ? styles.blackText : '',
    isMeetingNotification ? styles.meetingNotification : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClass}
      data-testid="test-popup"
      style={textColor === 'black_text' ? undefined : { color: textColor }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <p className={styles.popupMessage} dangerouslySetInnerHTML={{ __html: displayText }} />
      )}
      {button && (
        <button type="button" className={styles.closeButton} onClick={onClickClose}>
          X
        </button>
      )}
    </div>
  );
}

PopUpBar.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  message: PropTypes.string,
  onClickClose: PropTypes.func,
  textColor: PropTypes.string,
  isLoading: PropTypes.bool,
  button: PropTypes.bool,
  isMeetingNotification: PropTypes.bool,
};

export default PopUpBar;
