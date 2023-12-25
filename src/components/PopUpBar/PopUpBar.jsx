// import React from 'react';
import './PopUpBar.css';

function PopUpBar(props) {
  const { userProfile, component } = props;
  const { firstName, lastName } = userProfile;
  return (
    <div className="popup_container" data-testid="test-popup">
      {`You are currently viewing the ${component} for ${firstName} ${lastName}`}.
    </div>
  );
}

export default PopUpBar;
