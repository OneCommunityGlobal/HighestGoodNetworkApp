// import React from 'react';
import './PopUpBar.css';

function PopUpBar(props) {
  const { viewingUser, onClickClose } = props;
  const { firstName, lastName } = viewingUser;
  return (
    <div className="popup_container" data-testid="test-popup">
      {`You are currently functioning as ${firstName} ${lastName}, you only have the permissions of ${firstName}`}
      <button type="button" className="close_button" onClick={onClickClose}>
        X
      </button>
    </div>
  );
}

export default PopUpBar;
