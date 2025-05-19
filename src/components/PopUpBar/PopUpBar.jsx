// import React from 'react';
import Loading from 'components/common/Loading';
import './PopUpBar.css';

function PopUpBar(props) {
  const { message, onClickClose, textColor, isLoading = false } = props;
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
