// import React from 'react';
import Loading from '~/components/common/Loading';
import './PopUpBar.css';

function PopUpBar(props) {
  const { message, onClickClose, textColor, isLoading = false } = props;
  return (
    <div className={`popup_container ${textColor}`} data-testid="test-popup">
      {message}
      {isLoading ? (
        <span className="close_button">
          <Loading className="fa-sm" />
        </span>
      ) : (
        <button type="button" className="close_button btn_padding" onClick={onClickClose}>
          X
        </button>
      )}
    </div>
  );
}

export default PopUpBar;
