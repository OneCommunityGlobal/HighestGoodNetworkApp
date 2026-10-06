import PropTypes from 'prop-types';

function AnnouncementsRoleModeBadge({ userRole }) {
  if (userRole === 'educator') {
    return (
      <span style={{ color: '#28a745' }}>
        {'\uD83D\uDC68\u200D\uD83C\uDFEB'} <strong>Educator Mode</strong> (Can create/edit)
      </span>
    );
  }

  if (userRole === 'student') {
    return (
      <span style={{ color: '#17a2b8' }}>
        {'\uD83D\uDC68\u200D\uD83C\uDF93'} <strong>Student Mode</strong> (View only)
      </span>
    );
  }

  return null;
}

AnnouncementsRoleModeBadge.propTypes = {
  userRole: PropTypes.string.isRequired,
};

export default AnnouncementsRoleModeBadge;
