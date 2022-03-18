import { React } from 'react';
import { useHistory } from 'react-router';

// pass userId of an account to navigate to user profile onClick of icon
export const ProfileNavDot = ({ userId }) => {
  const history = useHistory();
  return (
    <span
      style={{ fontSize: '1.5rem' }}
      onClick={() => {
        history.push(`/userprofile/${userId}`);
      }}
      title="Click here to go to the user's profile."
    >
      <i className="fa fa-user" />
    </span>
  );
};
