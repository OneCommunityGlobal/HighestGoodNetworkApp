import React, { useState, useEffect } from 'react';
import hasPermission from 'utils/permissions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';
import { formatDate } from 'utils/formatDate';
import ActiveCell from './ActiveCell';
import { UserStatus, FinalDay } from '../../utils/enums';
import { DELETE, PAUSE, RESUME, SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import ResetPasswordButton from './ResetPasswordButton';

/**
 * The body row of the user table
 */
const UserTableData = React.memo(props => {
  const [isChanging, onReset] = useState(false);
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
          canChange
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
          onClick={() => {
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
      <td>
        <button
          type="button"
          className={`btn btn-outline-${props.isSet ? 'warning' : 'success'} btn-sm`}
          onClick={() => {
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
              onClick={() => {
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
