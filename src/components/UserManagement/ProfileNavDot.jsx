import { useHistory } from 'react-router';

// pass userId of an account to navigate to user profile onClick of icon and open in new tab if Command or Control key is pressed
function ProfileNavDot({ userId }) {
  const history = useHistory();

  const handleClick = event => {
    const url = `/userprofile/${userId}`;

    // Check if Command key (metaKey) or Control key (ctrlKey) is pressed
    if (event.metaKey || event.ctrlKey) {
      // Open the URL in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Navigate to the URL in the current tab
      history.push(url);
    }
  };

  return (
    <span
      style={{ fontSize: '1.5rem', cursor: 'pointer' }}
      onClick={handleClick}
      title="Click here to go to the user's profile."
    >
      <i className="fa fa-user" />
    </span>
  );
}

export default ProfileNavDot;
