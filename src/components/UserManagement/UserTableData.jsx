import React, { useState, useEffect } from 'react';
import ResetPasswordButton from './ResetPasswordButton';
import { DELETE, PAUSE, RESUME, SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import { UserStatus, FinalDay } from '../../utils/enums';
import { useHistory } from 'react-router-dom';
import ActiveCell from './ActiveCell';
import hasPermission from 'utils/permissions';
import Table from 'react-bootstrap/Table';


/**
 * The body row of the user table
 */
const UserTableData = React.memo(props => {
  const [isChanging, onReset] = useState(false);
  const history = useHistory();
  
  /**
   * reset the changing state upon rerender with new isActive status
   */
  useEffect(() => {
    onReset(false);
  }, [props.isActive, props.resetLoading]);

  return (
    <tr className="usermanagement__tr" id={`tr_user_${props.index}`}>
      <td className="usermanagement__active--input">
        <ActiveCell
          isActive={props.isActive}
          key={`active_cell${props.index}`}
          index={props.index}
          onClick={() => props.onActiveInactiveClick(props.user)}
        />
      </td>
      <td>
        <a
          href={`/userprofile/${props.user._id}`}
        >
          {props.user.firstName}
        </a>
      </td>
      <td>
        <a
          href={`/userprofile/${props.user._id}`}
        >
          {props.user.lastName}
        </a>
      </td>
      <td>{props.user.role}</td>
      <td>{props.user.email}</td>
      <td>{props.user.weeklyComittedHours}</td>
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
        >
          {isChanging ? '...' : props.isActive ? PAUSE : RESUME}
        </button>
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
        >
          {props.isSet ? CANCEL : SET_FINAL_DAY}
        </button>
      </td>
      <td>
        {props.user.isActive === false && props.user.reactivationDate
          ? props.user.reactivationDate.toLocaleString().split('T')[0]
          : ''}
      </td>
      <td>{props.user.endDate ? props.user.endDate.toLocaleString().split('T')[0] : 'N/A'}</td>
      <td>
        <span className="usermanagement-actions-cell">
          {props.user.role === 'Owner' &&
          !hasPermission(
            props.role,
            'addDeleteEditOwners',
            props.roles,
            props.userPermissions,
          ) ? null : (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={e => {
                props.onDeleteClick(props.user, 'archive');
              }}
            >
              {DELETE}
            </button>
          )}
        </span>
        <span className="usermanagement-actions-cell">
          <ResetPasswordButton user={props.user} isSmallButton />
        </span>
      </td>
    </tr> 
  );
});

export default UserTableData;
