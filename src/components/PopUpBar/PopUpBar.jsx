// import React from 'react';
import './PopUpBar.css';

function PopUpBar(props) {
  const { message, onClickClose } = props;
  return (
    <div className="popup_container" data-testid="test-popup">
      {message}
      <button type="button" className="close_button" onClick={onClickClose}>
        X
      </button>
    </div>
  );
}

export default PopUpBar;
