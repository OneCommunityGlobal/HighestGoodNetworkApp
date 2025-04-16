import React, { useState, useEffect } from 'react';
import { Tooltip } from 'reactstrap';
import { connect, useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Link, useHistory } from 'react-router-dom';
import { updateUserInfomation } from '../../actions/userManagement';
import { getAllRoles } from '../../actions/role';
import ResetPasswordButton from './ResetPasswordButton';
import { DELETE, PAUSE, RESUME, SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import { UserStatus, FinalDay } from '../../utils/enums';
import ActiveCell from './ActiveCell';
import hasPermission from '../../utils/permissions';
import { boxStyle } from '../../styles';
import { formatDateLocal } from '../../utils/formatDate';
import { cantUpdateDevAdminDetails } from '../../utils/permissions';
import { formatDate, formatDateYYYYMMDD } from '../../utils/formatDate';
import SetUpFinalDayButton from './SetUpFinalDayButton';
/**
 * The body row of the user table
 */
const UserTableData = React.memo(props => {
  const { darkMode } = props;
  const editUser = useSelector(state => state.userProfileEdit?.editable);
  const [tooltipDeleteOpen, setTooltipDelete] = useState(false);
  const [tooltipPauseOpen, setTooltipPause] = useState(false);
  const [tooltipFinalDayOpen, setTooltipFinalDay] = useState(false);
  const isMobile = props.isMobile;
  const mobileFontSize = props.mobileFontSize;
  const [tooltipReportsOpen, setTooltipReports] = useState(false);

  const [isChanging, onReset] = useState(false);
  const canAddDeleteEditOwners = props.hasPermission('addDeleteEditOwners');
  const [formData, updateFormData] = useState({
    firstName: props.user.firstName,
    lastName: props.user.lastName,
    id: props.user._id,
    role: props.user.role,
    jobTitle: props.user.jobTitle,
    email: props.user.email,
    weeklycommittedHours: props.user.weeklycommittedHours,
    startDate: formatDate(props.user.startDate),
    endDate: formatDate(props.user.endDate),
  });
  const dispatch = useDispatch();
  const history = useHistory();
  const { roles } = useSelector(state => state.role);
  const joinTimeStamp = date => {
    const now = new Date();
    let formattedTimestamp = now.toISOString();
    formattedTimestamp = `${date.toString()}T${formattedTimestamp.split('T')[1]}`;
    return formattedTimestamp;
  };
  const addUserInformation = (item, value, id) => {
    dispatch(
      updateUserInfomation({
        item,
        value,
        user_id: id,
      }),
    );
  };
  const canDeleteUsers = props.hasPermission('deleteUserProfile');
  const resetPasswordStatus = props.hasPermission('resetPassword');
  const updatePasswordStatus = props.hasPermission('updatePassword');
  const canChangeUserStatus = props.hasPermission('changeUserStatus');
  const canSeeReports = props.hasPermission('getReports');
  const toggleDeleteTooltip = () => setTooltipDelete(!tooltipDeleteOpen);
  const togglePauseTooltip = () => setTooltipPause(!tooltipPauseOpen);
  const toggleFinalDayTooltip = () => setTooltipFinalDay(!tooltipFinalDayOpen);
  const toggleReportsTooltip = () => setTooltipReports(!tooltipReportsOpen);

  /**
   * reset the changing state upon rerender with new isActive status
   */
  useEffect(() => {
    onReset(false);
    dispatch(getAllRoles());
  }, [props.isActive, props.resetLoading]);

  useEffect(() => {
    updateFormData({
      firstName: props.user.firstName,
      lastName: props.user.lastName,
      id: props.user._id,
      role: props.user.role,
      jobTitle: props.user.jobTitle,
      email: props.user.email,
      weeklycommittedHours: props.user.weeklycommittedHours,
      startDate: formatDateYYYYMMDD(props.user.startDate),
      endDate: formatDateYYYYMMDD(props.user.endDate),
    });
  }, [props.user]);

  /**
   * Checks whether users should be able to change the record of other users.
   * @returns {boolean} true if the target user record has a owner role, the logged in
   * user does not have the addDeleteEditOwners permission, or the target user is only
   * editable by Jae's account.
   */
  const checkPermissionsOnOwner = () => {
    const recordEmail = props.user.email;
    const loginUserEmail = props.authEmail;
    return (
      (props.user.role === 'Owner' && !canAddDeleteEditOwners) ||
      cantUpdateDevAdminDetails(recordEmail, loginUserEmail)
    );
  };

  const isCurrentUser = props.user.email === props.authEmail;

  const getButtonText = () => {
    if (isChanging) {
      return '...';
    }
    if (props.isActive) {
      return PAUSE;
    }
    return RESUME;
  };

  return (
    <tr
      className={`usermanagement__tr ${darkMode ? 'dark-usermanagement-data' : 'light-usermanagement-data'}`}
      id={`tr_user_${props.index}`}
      style={{ fontSize: isMobile ? mobileFontSize : 'initial' }}
    >
      <td className="usermanagement__active--input" style={{ position: 'relative' }}>
        <ActiveCell
          isActive={props.isActive}
          canChange={canChangeUserStatus}
          key={`active_cell${props.index}`}
          index={props.index}
          onClick={() => props.onActiveInactiveClick(props.user)}
        />
        {!canSeeReports ? (
          <Tooltip
            placement="bottom"
            isOpen={tooltipReportsOpen}
            target={`report-icon-${props.user._id}`}
            toggle={toggleReportsTooltip}
          >
            You don&apos;t have permission to view user reports
          </Tooltip>
        ) : (
          ''
        )}
        <span style={{ position: 'absolute', top: 0, right: 0 }}>
          <button
            type="button"
            className="team-member-tasks-user-report-link"
            style={{
              fontSize: 24,
              opacity: canSeeReports ? 1 : 0.7,
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            onClick={(event) => {
              if (!canSeeReports) {
                event.preventDefault();
                return;
              }
            
              if (event.metaKey || event.ctrlKey || event.button === 1) {
                window.open(`/peoplereport/${props.user._id}`, '_blank');
                return;
              }
            
              event.preventDefault(); // prevent full reload
              history.push(`/peoplereport/${props.user._id}`);
            }}
          >
            <img
              src="/report_icon.png"
              alt="reportsicon"
              className="team-member-tasks-user-report-link-image"
              id={`report-icon-${props.user._id}`}
              style={{
                cursor: canSeeReports ? 'pointer' : 'not-allowed', // Change cursor style to indicate the disabled state
              }}
            />
          </button>
        </span>
      </td>
      <td className="email_cell">
        {editUser?.first ? (
          <div>
            <a href={`/userprofile/${props.user._id}`} className={darkMode ? 'text-white' : 'text-dark'}>
              {formData.firstName}{' '}
            </a>
            <FontAwesomeIcon
              className="copy_icon"
              icon={faCopy}
              onClick={() => {
                navigator.clipboard.writeText(formData.firstName);
                toast.success('First Name Copied!');
              }}
            />
          </div>
        ) : (
          <input
            type="text"
            className={`edituser_input_firstname ${darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}`}
            value={formData.firstName}
            onChange={e => {
              updateFormData({ ...formData, firstName: e.target.value });
              addUserInformation('firstName', e.target.value, props.user._id);
            }}
          />
        )}
      </td>
      <td className="email_cell">
        {editUser?.last ? (
          <div>
            <a href={`/userprofile/${props.user._id}`} className={darkMode ? 'text-white' : 'text-dark'}>
              {formData.lastName}
            </a>
            <FontAwesomeIcon
              className="copy_icon"
              icon={faCopy}
              onClick={() => {
                navigator.clipboard.writeText(formData.lastName);
                toast.success('Last Name Copied!');
              }}
            />
          </div>
        ) : (
          <input
            type="text"
            className={`edituser_input text-center ${darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}`}
            value={formData.lastName}
            onChange={e => {
              updateFormData({ ...formData, lastName: e.target.value });
              addUserInformation('lastName', e.target.value, props.user._id);
            }}
          />
        )}
      </td>
      <td id="usermanagement_role">
        {editUser?.role && roles !== undefined ? (
          formData.role
        ) : (
          <select
            id=""
            value={formData.role}
            onChange={e => {
              updateFormData({ ...formData, role: e.target.value });
              addUserInformation('role', e.target.value, props.user._id);
            }}
            className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
          >
            {roles?.map((e, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <option key={index} value={e.roleName}>
                {e.roleName}
              </option>
            ))}
          </select>
        )}
      </td>

      <td title={formData.jobTitle}>
        {editUser?.jobTitle ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", maxWidth: "100%" }}>
            <span className="tooltip-container">{formData.jobTitle}</span>
            <FontAwesomeIcon
              className="copy_icon"
              icon={faCopy}
              onClick={() => {
                navigator.clipboard.writeText(formData.jobTitle);
                toast.success('Title Copied!');
              }}
            />
          </div>
        ) : (
          <input
            type="text"
            className="edituser_input"
            style={{ maxWidth: "100%" }}
            value={formData.jobTitle}
            onChange={e => {
              updateFormData({ ...formData, jobTitle: e.target.value });
              addUserInformation('jobTitle', e.target.value, props.user._id);
            }}
          />
        )}

      </td>

      <td className="email_cell">
        {editUser?.email ? (
          <div>
            {formData.email}
            <FontAwesomeIcon
              className="copy_icon"
              icon={faCopy}
              onClick={() => {
                navigator.clipboard.writeText(formData.email);
                toast.success('Email Copied!');
              }}
            />
          </div>
        ) : (
          <input
            type="text"
            className={`edituser_input ${darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}`}
            value={formData.email}
            onChange={e => {
              updateFormData({ ...formData, email: e.target.value });
              addUserInformation('email', e.target.value, props.user._id);
            }}
          />
        )}
      </td>
      <td>
        {editUser?.weeklycommittedHours ? (
          <span>{formData.weeklycommittedHours}</span>
        ) : (
          <input
            type="number"
            className={`edituser_input ${darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}`}
            value={formData.weeklycommittedHours}
            onChange={e => {
              updateFormData({ ...formData, weeklycommittedHours: e.target.value });
              addUserInformation('weeklycommittedHours', e.target.value, props.user._id);
            }}
          />
        )}
      </td>
      <td>
        {!canChangeUserStatus ? (
          <Tooltip
            placement="bottom"
            isOpen={tooltipPauseOpen}
            target={`btn-pause-profile-${props.user._id}`}
            toggle={togglePauseTooltip}
          >
            You don&apos;t have permission to change user status
          </Tooltip>
        ) : (
          ''
        )}
        <button
          type="button"
          className={`btn btn-outline-${props.isActive ? 'warning' : 'success'} btn-sm`}
          onClick={() => {
            if (cantUpdateDevAdminDetails(props.user.email, props.authEmail)) {
              alert(
                'STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.',
              );
              return;
            }
            onReset(true);
            props.onPauseResumeClick(
              props.user,
              props.isActive ? UserStatus.InActive : UserStatus.Active,
            );
          }}
          style={{
            ...darkMode ? { boxShadow: '0 0 0 0', fontWeight: 'bold' } : boxStyle,
            padding: '5px', // Added 2px padding
          }}
          disabled={!canChangeUserStatus}
          id={`btn-pause-profile-${props.user._id}`}
        >
          {/* {isChanging ? '...' : props.isActive ? PAUSE : RESUME} */}
          {getButtonText()}
        </button>
      </td>
      <td className="centered-td">
        <button
          type="button"
          className={`btn btn-outline-primary btn-sm${props.timeOffRequests?.length > 0 ? ` time-off-request-btn-moved` : ''
            }`}
          onClick={() => props.onLogTimeOffClick(props.user)}
          id="requested-time-off-btn"
          style={{
            ...darkMode ? { boxShadow: '0 0 0 0', fontWeight: 'bold' } : boxStyle,
            padding: '5px', // Added 2px padding
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="19"
            viewBox="0 0 448 512"
            className="requested-time-off-calender-svg"
          >
            <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
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
              <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
            </svg>
          </i>
        )}
      </td>
      <td>
        {!isCurrentUser && (
          <>
            {!canChangeUserStatus ? (
              <Tooltip
                placement="bottom"
                isOpen={tooltipFinalDayOpen}
                target={`btn-final-day-${props.user._id}`}
                toggle={toggleFinalDayTooltip}
              >
                You don&apos;t have permission to change user status
              </Tooltip>
            ) : (
              ''
            )}
            <SetUpFinalDayButton
              userProfile={props.user}
              darkMode={darkMode}
              onFinalDaySave={updatedUser => {
                // Update the user object in the parent state
                props.onUserUpdate(updatedUser);
              }}
            />
          </>
        )}
      </td>
      <td>
        {props.user.isActive === false && props.user.reactivationDate
          ? formatDateLocal(props.user.reactivationDate)
          : ''}
      </td>
      <td>
        {editUser?.startDate ? (
          <span>
            {props.user.startDate ? formatDate(formData.startDate) : 'N/A'}
            {/* {formData.startDate},{props.user.startDate} */}
          </span>
        ) : (
          <input
            type="date"
            className={`edituser_input ${darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}`}
            value={formData.startDate}
            onChange={e => {
              updateFormData({ ...formData, startDate: e.target.value });
              addUserInformation('startDate', joinTimeStamp(e.target.value), props.user._id);
            }}
          />
        )}
      </td>
      <td className="email_cell">
        {editUser?.endDate ? (
          <div>
            {props.user.endDate ? formatDate(formData.endDate) : 'N/A'}
            <FontAwesomeIcon
              className="copy_icon"
              icon={faCopy}
              onClick={() => {
                navigator.clipboard.writeText(
                  props.user.endDate ? formatDate(formData.endDate) : 'N/A',
                );
                toast.success('End Date Copied!');
              }}
            />
          </div>
        ) : (
          <input
            type="date"
            className={`edituser_input ${darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}`}
            value={formData.endDate}
            onChange={e => {
              updateFormData({ ...formData, endDate: e.target.value });
              addUserInformation('endDate', joinTimeStamp(e.target.value), props.user._id);
            }}
          />
        )}
      </td>
      {checkPermissionsOnOwner() ? null : (
        <td>
          <span className="usermanagement-actions-cell">
            {!canDeleteUsers ? (
              <Tooltip
                placement="bottom"
                isOpen={tooltipDeleteOpen}
                target={`btn-delete-${props.user._id}`}
                toggle={toggleDeleteTooltip}
              >
                You don&apos;t have permission to delete the user
              </Tooltip>
            ) : (
              ''
            )}
            <button
              type="button"
              id={`btn-delete-${props.user._id}`}
              className="btn btn-outline-danger btn-sm"
              onClick={() => {
                props.onDeleteClick(props.user, 'archive');
              }}
              style={{
                ...darkMode ? { boxShadow: '0 0 0 0', fontWeight: 'bold' } : boxStyle,
                padding: '5px', // Added 2px padding
              }}
              disabled={props.auth?.user.userid === props.user._id || !canDeleteUsers}
            >
              {DELETE}
            </button>
          </span>
          <span className="usermanagement-actions-cell">
            <ResetPasswordButton
              authEmail={props.authEmail}
              user={props.user}
              darkMode={darkMode}
              isSmallButton
              canUpdatePassword={resetPasswordStatus || updatePasswordStatus}
            />
          </span>
        </td>
      )}
    </tr>
  );
});

const mapStateToProps = state => ({
  auth: state.auth,
  authEmail: state.auth.user.email,
});

export default connect(mapStateToProps, { hasPermission })(UserTableData);
