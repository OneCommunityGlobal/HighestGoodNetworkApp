import React, { useState } from 'react'
import { DELETE } from '../../languages/en/ui'

/**
 * The body row of the user table
 */
const UserTableData = React.memo((props) => {
  return (
    <tr className="projects__tr" id={"tr_user_" + props.index}>
      <td className='projects__active--input'>
        <ActiveCell isActive={props.isActive}
          key={"active_cell" + props.index}
          index={props.index} />
      </td>
      <td>{props.firstName}</td>
      <td>{props.lastName}</td>
      <td>{props.role}</td>
      <td>{props.email}</td>
      <td>{props.weeklyComittedHours}</td>
      <td><button type="button" className="btn btn-outline-danger">{DELETE}</button></td>
    </tr>
  )
});

/**
 * Component to show the active status in the 
 */
const ActiveCell = React.memo((props) => {
  return <div className={props.isActive ? "isActive" : "isNotActive"} id={"active_cell_" + props.index}>
    <i className="fa fa-circle" aria-hidden="true"></i>
  </div>;
});

export default UserTableData
