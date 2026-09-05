import Loading from '../common/Loading';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import styles from './PopUpBar.module.css';
import { Button } from 'reactstrap';

function PopUpBar({
  firstName = window.viewingUser?.firstName,
  lastName = window.viewingUser?.lastName,
  message,
  onClickClose,
  textColor = '#000',
  isLoading = false,
  button = true,
  isMeetingNotification = false,
  permissionsChanged = false,
}) {
  const defaultTemplate =
    `You are currently functioning as ${firstName} ${lastName}, ` +
    `you only have the permissions of ${firstName}`;

  const displayText = message ?? defaultTemplate;

  const containerClass = [
    styles.popupContainer,
    textColor === 'black_text' ? styles.blackText : '',
    isMeetingNotification ? styles.meetingNotification : '',
    permissionsChanged ? styles.permissionsChanged : '',
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
        <p className={styles.popupMessage}>
          {isMeetingNotification ? parse(DOMPurify.sanitize(displayText)) : displayText}
        </p>
      )}
      {button && <Button close onClick={onClickClose} style={{ paddingRight: '5px' }} />}
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
