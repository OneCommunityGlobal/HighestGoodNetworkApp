import './PopUpBar.css';

function PopUpBar(props) {
  const { userProfile, onClickClose } = props;
  const { firstName, lastName } = userProfile;

  return (
    <div className="popup_container">
      {`You are currently viewing the dashboard for ${firstName} ${lastName}`}
      <button type="button" className="close_button" onClick={onClickClose}>
        X
      </button>
    </div>
  );
}

export default PopUpBar;
