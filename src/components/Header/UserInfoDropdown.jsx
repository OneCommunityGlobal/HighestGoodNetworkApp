import React from 'react';
import { Link } from 'react-router-dom';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import PropTypes from 'prop-types';
import DarkModeButton from './DarkModeButton';
import { cantUpdateDevAdminDetails } from '~/utils/permissions';
import { WELCOME, VIEW_PROFILE, UPDATE_PASSWORD, LOGOUT } from '~/languages/en/ui';

/**
 * Shared component for user info dropdown in header.
 * Displays welcome message, profile link, password update, dark mode toggle, and logout.
 * Eliminates duplication across header components.
 * 
 * @component
 * @param {string} firstName - User's first name
 * @param {string|number} displayUserId - User ID for profile link
 * @param {string} profileRoute - Base route for profile (e.g., '/profile' or '/communityportal/profile')
 * @param {string} userEmail - User's email address
 * @param {boolean} darkMode - Dark mode enabled flag
 * @param {Function} onLogout - Callback when logout is clicked (typically opens logout modal)
 * @param {string} dropdownMenuClass - CSS class for dropdown menu styling
 * @param {string} dropdownItemClass - CSS class for dropdown items
 * @returns {React.ReactElement}
 */
const UserInfoDropdown = ({
  firstName,
  displayUserId,
  profileRoute,
  userEmail,
  darkMode,
  onLogout,
  dropdownMenuClass,
  dropdownItemClass,
}) => {
  return (
    <UncontrolledDropdown inNavbar>
      <DropdownToggle nav caret className="text-light">
        <span>
          {WELCOME}, {firstName}
        </span>
      </DropdownToggle>
      <DropdownMenu right className={dropdownMenuClass}>
        <DropdownItem header className={darkMode ? 'text-custom-grey' : ''}>
          Hello {firstName}
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem tag={Link} to={`${profileRoute}/${displayUserId}`} className={dropdownItemClass}>
          {VIEW_PROFILE}
        </DropdownItem>
        {!cantUpdateDevAdminDetails(userEmail, userEmail) && (
          <DropdownItem tag={Link} to={`/updatepassword/${displayUserId}`} className={dropdownItemClass}>
            {UPDATE_PASSWORD}
          </DropdownItem>
        )}
        <DropdownItem className={dropdownItemClass}>
          <DarkModeButton />
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={onLogout} className={dropdownItemClass}>
          {LOGOUT}
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

UserInfoDropdown.propTypes = {
  firstName: PropTypes.string.isRequired,
  displayUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  profileRoute: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
  dropdownMenuClass: PropTypes.string,
  dropdownItemClass: PropTypes.string,
};

UserInfoDropdown.defaultProps = {
  darkMode: false,
  dropdownMenuClass: '',
  dropdownItemClass: '',
};

export default UserInfoDropdown;
