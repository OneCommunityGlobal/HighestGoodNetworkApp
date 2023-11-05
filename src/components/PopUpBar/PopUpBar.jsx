// import React from 'react';
import './PopUpBar.css';

function PopUpBar(props) {
  const { userProfile } = props;
  const { firstName, lastName } = userProfile;
  return (
    <div className="popup_container">
      {`You are currently viewing the dashboard for ${firstName} ${lastName}`}.
    </div>
  );
}

export default PopUpBar;
