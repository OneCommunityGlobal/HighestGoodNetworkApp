import React from 'react';
import { useState } from 'react';
import {
  ACTIVE,
  FIRST_NAME,
  LAST_NAME,
  ROLE,
  EMAIL,
  WKLY_COMMITTED_HRS,
  PAUSE,
  USER_RESUME_DATE,
  MANAGE_FINAL_DAY,
  USER_START_DATE,
  USER_END_DATE,
  REQUESTED_TIME_OFF,
} from '../../languages/en/ui';
import userTableDataPermissions from 'utils/userTableDataPermissions';
import { disableEditUserInfo, enableEditUserInfo } from 'actions/userManagement';
import { useDispatch } from 'react-redux';

/**
 * The header row of the user table.
 */
const UserTableHeader = React.memo(({ authRole, roleSearchText, darkMode,editUser}) => {

  const [editFlag,setEditFlag]=useState(editUser)
  // const [editFlag,setEditFlag]=useState({first:1,'last':1,'role':1,'email':1,'hours':1})
  const dispatch=useDispatch();

  const enableEdit=(value)=>{
    setEditFlag(value)
    dispatch(enableEditUserInfo(value))
  }
  const disableEdit=(value)=>{
    setEditFlag(value)
    dispatch(disableEditUserInfo(value))
  }

  return (
    <tr className={darkMode ? 'bg-space-cadet' : ''}>
      <th scope="col" id="usermanagement_active">
        {ACTIVE}
      </th>
      <th scope="col" id="usermanagement_first" className='p-auto'>
        <div className='text-center'>
          <span className='my-auto'>
            {FIRST_NAME}
            </span>
          {editFlag.first==1 ? <button className='btn btn-info ml-2' onClick={() => enableEdit({ ...editFlag, 'first': 0 })}>Edit</button> : <button className='btn btn-info ml-2' onClick={() => disableEdit({ ...editFlag, 'first': 1 })}>Save</button>}
        </div>
      </th>
      <th scope="col" id="usermanagement_last_name" className=''>
        <div className='text-center'>
          <span className='my-auto'>{LAST_NAME}</span>
          {editFlag.last==1 ? <button className='btn btn-info ml-2' onClick={() => enableEdit({ ...editFlag, 'last': 0 })}>Edit</button> : <button className='btn btn-info ml-2 ' onClick={() => disableEdit({ ...editFlag, 'last': 1 })}>Save</button>}
        </div>
      </th>
      <th scope="col" id="usermanagement_role">
        <div className='text-center'>
          <span className='my-auto'>{ROLE}</span>
          {editFlag.role==1 ? <button className='btn btn-info ml-2' onClick={() => enableEdit({ ...editFlag, 'role': 0 })}>Edit</button> : <button className='btn btn-info ml-2' onClick={() => disableEdit({ ...editFlag, 'role': 1 })}>Save</button>}
        </div>
      </th>
      <th scope="col" id="usermanagement_email">
        <div className='text-center'>
          <span className='my-auto text-center'>{EMAIL}</span>
          {editFlag.email==1 ? <button className='btn btn-info ml-2' onClick={() => enableEdit({ ...editFlag, 'email': 0 })}>Edit</button> : <button className='btn btn-info ml-2' onClick={() => disableEdit({ ...editFlag, 'email': 1 })}>Save</button>}
        </div>
      </th>
      <th scope="col" id="usermanagement_hrs">
        <span className='my-auto'>{WKLY_COMMITTED_HRS}</span>
        {editFlag.hours==1 ? <button className='btn btn-info ml-2' onClick={() => enableEdit({ ...editFlag, 'hours': 0 })}>Edit</button> : <button className='btn btn-info ml-2' onClick={() => disableEdit({ ...editFlag, 'hours': 1 })}>Save</button>}
      </th>
      <th scope="col" id="usermanagement_pause">
        <span>{PAUSE}</span>
      </th>
      <th scope="col" id="usermanagement_requested_time_off">
        {REQUESTED_TIME_OFF}
      </th>
      <th scope="col" id="usermanagement_finalday">
        {MANAGE_FINAL_DAY}
      </th>
      <th scope="col" id="usermanagement_resume_date">
        {USER_RESUME_DATE}
      </th>
      <th scope="col" id="usermanagement_resume_date">
        {USER_START_DATE}
      </th>
      <th scope="col" id="usermanagement_resume_date">
        {USER_END_DATE}
      </th>
      {userTableDataPermissions(authRole, roleSearchText) && (
        <th scope="col" id="usermanagement_delete"></th>
      )}
    </tr>
  );
});

export default UserTableHeader;
