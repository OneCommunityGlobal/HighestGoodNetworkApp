// import React from 'react';
import './PopUpBar.css';

function PopUpBar(props) {
  const { viewingUser, onClickClose } = props;
  const { firstName, lastName } = viewingUser;
  return (
    <div className="popup_container" data-testid="test-popup">
      {`You are currently viewing the header for ${firstName} ${lastName}`}
      <button type="button" className="close_button" onClick={onClickClose}>
        X
      </button>
    </div>
  );
}

export default PopUpBar;
