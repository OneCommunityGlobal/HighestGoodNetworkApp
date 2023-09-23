import React, { useState, useEffect } from 'react';
import ResetPasswordButton from './ResetPasswordButton';
import { DELETE, PAUSE, RESUME, SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import { UserStatus, FinalDay } from '../../utils/enums';
import { useHistory } from 'react-router-dom';
import ActiveCell from './ActiveCell';
import hasPermission from 'utils/permissions';
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCalendarDay, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';
import { formatDate } from 'utils/formatDate';

/**
 * The body row of the user table
 */
const UserTableData = React.memo(props => {
  const [isChanging, onReset] = useState(false);
  const history = useHistory();
  const canAddDeleteEditOwners = props.hasPermission('addDeleteEditOwners');

  /**
   * reset the changing state upon rerender with new isActive status
   */
  useEffect(() => {
    onReset(false);
  }, [props.isActive, props.resetLoading]);

  const checkPermissionsOnOwner = () => {
    return props.user.role === 'Owner' && !canAddDeleteEditOwners;
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
      <td>
        <a href={`/userprofile/${props.user._id}`}>{props.user.firstName}</a>
      </td>
      <td>
        <a href={`/userprofile/${props.user._id}`}>{props.user.lastName}</a>
      </td>
      <td>{props.user.role}</td>
      <td className="email_cell">
        {props.user.email}
        <FontAwesomeIcon
          className="copy_icon"
          icon={faCopy}
          onClick={() => {
            navigator.clipboard.writeText(props.user.email);
            toast.success('Email Copied!');
          }}
        />
      </td>
      <td>{props.user.weeklycommittedHours}</td>
      <td>
        <button
          type="button"
          className={`btn btn-outline-${props.isActive ? 'warning' : 'success'} btn-sm`}
          onClick={e => {
            onReset(true);
            props.onPauseResumeClick(
              props.user,
              props.isActive ? UserStatus.InActive : UserStatus.Active,
            );
          }}
          style={boxStyle}
        >
          {isChanging ? '...' : props.isActive ? PAUSE : RESUME}
        </button>
      </td>
      <td className="centered-td">
        <button
          className={`btn btn-outline-primary btn-sm${
            props.timeOffRequests.length > 0 ? ` time-off-request-btn-moved` : ''
          }`}
          onClick={e => props.onLogTimeOffClick(props.user)}
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
            <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
          </svg>
        </button>
        {props.timeOffRequests.length > 0 && (
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
        <button
          type="button"
          className={`btn btn-outline-${props.isSet ? 'warning' : 'success'} btn-sm`}
          onClick={e => {
            props.onFinalDayClick(
              props.user,
              props.isSet ? FinalDay.NotSetFinalDay : FinalDay.FinalDay,
            );
          }}
          style={boxStyle}
        >
          {props.isSet ? CANCEL : SET_FINAL_DAY}
        </button>
      </td>
      <td>
        {props.user.isActive === false && props.user.reactivationDate
          ? formatDate(props.user.reactivationDate)
          : ''}
      </td>
      <td>{props.user.endDate ? formatDate(props.user.endDate) : 'N/A'}</td>
      {checkPermissionsOnOwner() ? null : (
        <td>
          <span className="usermanagement-actions-cell">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={e => {
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

export default connect(null, { hasPermission })(UserTableData);
