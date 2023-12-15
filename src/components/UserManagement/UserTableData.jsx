import React, { useState, useEffect } from 'react';
import ResetPasswordButton from './ResetPasswordButton';
import { DELETE, PAUSE, RESUME, SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import { UserStatus, FinalDay } from '../../utils/enums';
import ActiveCell from './ActiveCell';
import hasPermission from 'utils/permissions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';
import { formatDate } from 'utils/formatDate';

/**
 * The body row of the user table
 */
const UserTableData = React.memo(props => {
  const [isChanging, onReset] = useState(false);
  // const history = useHistory();
  // const canAddDeleteEditOwners = hasPermission('addDeleteEditOwners');
  const canAddDeleteEditOwners = props.hasPermission('addDeleteEditOwners');

  console.log("user table", props)
  /**
   * reset the changing state upon rerender with new isActive status
   */

  useEffect(() => {
    onReset(false);
  }, [props.isActive, props.resetLoading]);

  const checkPermissionsOnOwner = () => {
    return (
      props.user.role === 'Owner' &&
      !hasPermission(props.role, 'addDeleteEditOwners', props.roles, props.userPermissions)
    );
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

      <td className="email_cell">
      <a href={`/userprofile/${props.user._id}`}>{props.user.firstName} </a>
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
       <a href={`/userprofile/${props.user._id}`}>{props.user.lastName}</a>
        <FontAwesomeIcon
          className="copy_icon"
          icon={faCopy}
          onClick={() => {
            navigator.clipboard.writeText(props.user.lastName);
            toast.success('Last Name Copied!');
          }}
        />

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
      <td>{props.user.createdDate ? formatDate(props.user.createdDate) : 'N/A'}</td>
      
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
        {
          props.auth?.user.userid === props.user._id ? '': 
                  <><span className="usermanagement-actions-cell">
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
                    
                    </>
          }
          <span className="usermanagement-actions-cell">
              <ResetPasswordButton user={props.user} isSmallButton />
            </span>
        </td>
      )}
    </tr>
  );
});

export default connect(null, {hasPermission})(UserTableData);
