import React, { useState, useEffect } from 'react'
import { DELETE, PAUSE, RESUME, ACTIVE, INACTIVE } from '../../languages/en/ui'
import ResetPasswordButton from './ResetPasswordButton';

/**
 * The body row of the user table
 */
const UserTableData = React.memo((props) => {

  const [isChanging, onReset] = useState(false);

  /** 
   * reset the changing state upon rerender with new isActive status
   */
  useEffect(() => {
    onReset(false);
  }, [props.isActive, props.resetLoading])

  const onActiveInactiveClick = (user) => {
    props.onActiveInactiveClick(user);
  }

  return (
    <tr className="usermanagement__tr" id={"tr_user_" + props.index}>
      <td className='usermanagement__active--input'>
        <ActiveCell
          isActive={props.isActive}
          key={"active_cell" + props.index}
          index={props.index}
          user={props.user}
          onActiveInactiveClick={onActiveInactiveClick} />
      </td>
      <td><a href={"/userprofile/" + props.user._id} >{props.user.firstName}</a></td>
      <td><a href={"/userprofile/" + props.user._id} >{props.user.lastName}</a></td>
      <td>{props.user.role}</td>
      <td>{props.user.email}</td>
      <td>{props.user.weeklyComittedHours}</td>
      <td>
        <button type="button" className={"btn btn-outline-" + (props.isActive ? "warning" : "success") + " btn-sm"}
          onClick={(e) => {
            onReset(true);
            props.onPauseResumeClick(props.user, (props.isActive ? INACTIVE : ACTIVE));
          }}>
          {isChanging ? "..." : (props.isActive ? PAUSE : RESUME)}
        </button>
      </td>
      <td>
        {(props.user.isActive === false && props.user.reactivationDate) ?
          (props.user.reactivationDate.toLocaleString().split('T')[0]) : ''}
      </td>
      <td>
        <span className="usermanagement-actions-cell">
          <button type="button" className="btn btn-outline-danger btn-sm"
            onClick={(e) => {
              props.onDeleteClick(props.user, 'archive');
            }}>{DELETE}</button>
        </span>
        <span className="usermanagement-actions-cell">
          <ResetPasswordButton user={props.user} buttonText="Reset" />
        </span>
      </td>
    </tr>
  )
});

/**
 * Component to show the active status in the 
 */
const ActiveCell = React.memo((props) => {
  return <div className={props.isActive ? "isActive" : "isNotActive"} id={"active_cell_" + props.index}
    title="Click here to change the user status"
    onClick={() => {
      props.onActiveInactiveClick(props.user);
    }}>
    <i className="fa fa-circle" aria-hidden="true"></i>
  </div>;
});

export default UserTableData
