import Loading from '~/components/common/Loading';
import './PopUpBar.css';

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

  return (
    <div
      className={`popup_container${textColor === 'black_text' ? ' black_text' : ''}${
        isMeetingNotification ? ' meeting_notification' : ''
      }`}
      data-testid="test-popup"
      style={textColor === 'black_text' ? undefined : { color: textColor }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <p className="popup_message" dangerouslySetInnerHTML={{ __html: displayText }}></p>
      )}
      {button && (
        <button type="button" className="close_button" onClick={onClickClose}>
          X
        </button>
      )}
    </div>
  );
}

export default PopUpBar;
