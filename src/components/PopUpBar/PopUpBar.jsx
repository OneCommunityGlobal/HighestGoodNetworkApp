import React from 'react';
import './PopUpBar.css';

const PopUpBar = (props) => {
  const { auth, userProfile } = props;
  const { firstName, lastName, _id } = userProfile;
  const { user } = auth;

  if (auth.userid == _id) {
    return '';
  }

  return (
    <div className="popup_container">
      {`You are currently viewing the dashboard for ${firstName} ${lastName}`}.
    </div>
  );
};

export default PopUpBar;
