import React, { useState, useEffect } from 'react';
import ResetPasswordButton from './ResetPasswordButton';
import { DELETE, PAUSE, RESUME, SET_FINAL_DAY, CANCEL, EDIT_USER_INFO } from '../../languages/en/ui';
import { UserStatus, FinalDay } from '../../utils/enums';
import ActiveCell from './ActiveCell';
import DropDownSearchBox from './DropDownSearchBox';
import hasPermission from 'utils/permissions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCalendarDay, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';
import { formatDate } from 'utils/formatDate';
import { cantUpdateDevAdminDetails } from 'utils/permissions';
import { updateUserProfile as updateUserProfileAction } from '../../actions/userProfile';

/**
 * The body row of the user table
 */
const UserTableData = React.memo((props) => {
  console.log('props', props)
  const [isChanging, onReset] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Editing User Info
  const [userProfile, setUserProfile] = useState(props.user); // Initial user data
  const [saveTrigger, setSaveTrigger] = useState(false); // Trigger re-render
  const canAddDeleteEditOwners = props.hasPermission('addDeleteEditOwners');

  // Synchronize userProfile state with props.user when props.user changes
  useEffect(() => {
    setUserProfile(props.user);
  }, [props.user]);

  const onRoleSearch = (selectedRole) => {
    setUserProfile({
      ...userProfile,
      role: selectedRole,
    });
  };

  /**
   * reset the changing state upon rerender with new isActive status
   */
  useEffect(() => {
    onReset(false);
  }, [props.isActive, props.resetLoading]);

  /**
   * Monitor saveTrigger to update component when save is successful
   */
  useEffect(() => {
    if (saveTrigger) {
      setSaveTrigger(false);
      setIsEditing(false);
      setUserProfile(props.user);
    }
  }, [saveTrigger, props.user]);

  /**
   * Checks whether users should be able to change the record of other users.
   * @returns {boolean} true if the target user record has a owner role, the logged in 
   * user does not have the addDeleteEditOwners permission, or the target user is only
   * editable by Jae's account.
   */
  const checkPermissionsOnOwner = () => {
    const recordEmail = props.user.email;
    const loginUserEmail = props.authEmail;

    return (props.user.role === 'Owner' && !canAddDeleteEditOwners) || cantUpdateDevAdminDetails(recordEmail, loginUserEmail);
  };

  /**
   * Handles the save action and triggers component update
   */
  const handleSave = async () => {
    try {
      await props.updateUserProfile(userProfile);
      setSaveTrigger(true); // Trigger re-render
    } catch (err) {
      console.error('An error occurred while saving the profile:', err);
      alert('An error occurred while attempting to save this profile.');
    }
  };

  /**
   * Handles input change for the user profile fields
   * @param {string} key - The key of the user profile field
   * @param {any} value - The new value for the field
   */
  const handleChange = (key, value) => {
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      [key]: value,
    }));
  };

  return (
    <tr className="usermanagement__tr" id={`tr_user_${props.index}`}>
      <td className="usermanagement__active--input">
        <ActiveCell
          isActive={props.isActive}
          canChange={true}
          key={`active_cell${props.index}`}
          index={props.index}
          onClick={() => props.onActiveInactiveClick(props.user)}
        />
      </td>
      <td className="usermanagement__active--input">
        <button
          type="button"
          className="btn btn-outline-success btn-sm"
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          style={boxStyle}
        >
          {isEditing ? 'Save' : EDIT_USER_INFO}
        </button>
      </td>
      <td className="email_cell">
        {isEditing ? (
          <input
            type="text"
            value={userProfile.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            style={{ width: '100%', display: 'inline-block' }}
          />
        ) : (
          <a href={`/userprofile/${props.user._id}`}>{props.user.firstName}</a>
        )}
        <FontAwesomeIcon
          className="copy_icon"
          icon={faCopy}
          onClick={() => {
            navigator.clipboard.writeText(props.user.firstName);
            toast.success('First Name Copied!');
          }}
        />
      </td>
      <td className="email_cell">
        {isEditing ? (
          <input
            type="text"
            value={userProfile.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            style={{ width: '100%', display: 'inline-block' }}
          />
        ) : (
          <a href={`/userprofile/${props.user._id}`}>{props.user.lastName}</a>
        )}
        <FontAwesomeIcon
          className="copy_icon"
          icon={faCopy}
          onClick={() => {
            navigator.clipboard.writeText(props.user.lastName);
            toast.success('Last Name Copied!');
          }}
        />
      </td>
      <td>
        {isEditing ? (
          <DropDownSearchBox
            id={'role_search'}
            items={props.roleList}
            value={userProfile.role}
            searchCallback={onRoleSearch}
            placeholder={userProfile.role}
            width="100%"
          />
        ) : (
          <>{props.user.role}</>
        )}
      </td>
      <td className="email_cell">
        {isEditing ? (
          <input
            type="text"
            value={userProfile.email}
            onChange={(e) => handleChange('email', e.target.value)}
            style={{ width: '100%', display: 'inline-block' }}
          />
        ) : (
          <>{props.user.email}</>
        )}
        <FontAwesomeIcon
          className="copy_icon"
          icon={faCopy}
          onClick={() => {
            navigator.clipboard.writeText(props.user.email);
            toast.success('Email Copied!');
          }}
        />
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            value={userProfile.weeklycommittedHours}
            onChange={(e) => handleChange('weeklycommittedHours', e.target.value)}
            style={{ maxWidth: '75px' }}
          />
        ) : (
          <> {props.user.weeklycommittedHours}</>
        )}
      </td>
      <td>
        <button
          type="button"
          className={`btn btn-outline-${props.isActive ? 'warning' : 'success'} btn-sm`}
          onClick={(e) => {
            if (cantUpdateDevAdminDetails(props.user.email, props.authEmail)) {
              alert('STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.');
              return;
            }
            onReset(true);
            props.onPauseResumeClick(props.user, props.isActive ? UserStatus.InActive : UserStatus.Active);
          }}
          style={boxStyle}
        >
          {isChanging ? '...' : props.isActive ? PAUSE : RESUME}
        </button>
      </td>
      <td className="centered-td">
        <button
          className={`btn btn-outline-primary btn-sm${props.timeOffRequests?.length > 0 ? ` time-off-request-btn-moved` : ''}`}
          onClick={(e) => props.onLogTimeOffClick(props.user)}
          id="requested-time-off-btn"
          style={boxStyle}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="19"
            viewBox="0 0 448 512"
            className="requested-time-off-calender-svg"
          >
            <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272" />
          </svg>
        </button>
        {props.timeOffRequests?.length > 0 && (
          <i className="requested-time-off-clock-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 512 512"
              className="requested-time-off-clock-icon-svg"
            >
              <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM" />
            </svg>
          </i>
        )}
      </td>
      <td>
        {props.user.isActive === false && props.user.reactivationDate
          ? formatDate(props.user.reactivationDate)
          : ''}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            value={userProfile.createdDate ? formatDate(userProfile.createdDate) : 'N/A'}
            onChange={(e) => handleChange('createdDate', e.target.value)}
            style={{ width: '100%', display: 'inline-block' }}
          />
        ) : (
          <> {props.user.createdDate ? formatDate(props.user.createdDate) : 'N/A'}</>
        )}
      </td>
      <td className="email_cell">
        {props.user.endDate ? formatDate(props.user.endDate) : 'N/A'}
        <FontAwesomeIcon
          className="copy_icon"
          icon={faCopy}
          onClick={() => {
            navigator.clipboard.writeText(props.user.endDate ? formatDate(props.user.endDate) : 'N/A');
            toast.success('End Date Copied!');
          }}
        />
      </td>
      {checkPermissionsOnOwner() ? null : (
        <td>
          <span className="usermanagement-actions-cell">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={(e) => {
                props.onDeleteClick(props.user, 'archive');
              }}
              style={boxStyle}
            >
              {DELETE}
            </button>
          </span>
          <span className="usermanagement-actions-cell">
            <ResetPasswordButton authEmail={props.authEmail} user={props.user} isSmallButton />
          </span>
        </td>
      )}
    </tr>
  );
});

const mapDispatchToProps = {
  updateUserProfile: updateUserProfileAction,
};

export default connect(null, { hasPermission, ...mapDispatchToProps })(UserTableData);
