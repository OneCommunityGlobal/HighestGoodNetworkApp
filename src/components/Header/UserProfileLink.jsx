import React from 'react';
import { Link } from 'react-router-dom';
import { NavLink } from 'reactstrap';
import PropTypes from 'prop-types';

/**
 * Shared component for user profile link in header.
 * Eliminates duplication across header components.
 * 
 * @component
 * @param {string} profileRoute - Base route for profile (e.g., '/profile' or '/communityportal/profile')
 * @param {string|number} displayUserId - User ID to link to
 * @param {string} profilePic - Profile picture URL
 * @param {string} className - CSS class to apply to the NavLink
 * @returns {React.ReactElement}
 */
const UserProfileLink = ({ profileRoute, displayUserId, profilePic, className }) => (
  <NavLink tag={Link} to={`${profileRoute}/${displayUserId}`} className={className}>
    <img
      src={profilePic || '/pfp-default-header.png'}
      alt="User profile"
      style={{ maxWidth: '60px', maxHeight: '60px' }}
      className="dashboardimg"
    />
  </NavLink>
);

UserProfileLink.propTypes = {
  profileRoute: PropTypes.string.isRequired,
  displayUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  profilePic: PropTypes.string,
  className: PropTypes.string,
};

UserProfileLink.defaultProps = {
  profilePic: '/pfp-default-header.png',
  className: '',
};

export default UserProfileLink;
