import Loading from 'components/common/Loading';
import './PopUpBar.css';

function PopUpBar({
  firstName = window.viewingUser?.firstName,
  lastName = window.viewingUser?.lastName,
  message,
  onClickClose,
  textColor = '#000',
  isLoading = false,
}) {
  const defaultTemplate =
    `You are currently functioning as ${firstName} ${lastName}, ` +
    `you only have the permissions of ${firstName}`;

  const displayText = message ?? defaultTemplate;

  return (
    <div className="popup_container" data-testid="test-popup" style={{ color: textColor }}>
      {isLoading ? <Loading /> : <p className="popup_message">{displayText}</p>}
      <button type="button" className="close_button" onClick={onClickClose}>
        X
      </button>
    </div>
  );
}

export default PopUpBar;
