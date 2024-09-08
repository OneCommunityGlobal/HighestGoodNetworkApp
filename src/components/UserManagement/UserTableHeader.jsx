import React,{useState} from 'react';
// import { useDispatch } from 'react-redux';
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
// import { disableEditUserInfo, enableEditUserInfo } from 'actions/userManagement';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEdit, faSave } from '@fortawesome/free-solid-svg-icons';

/**
 * The header row of the user table.
*/
const UserTableHeader = React.memo(({ authRole, roleSearchText, darkMode, editUser,enableEditUserInfo,disableEditUserInfo }) => {
  // const dispatch = useDispatch();
  const [editFlag, setEditFlag] = useState(editUser)
  const enableEdit = (value) => {
    setEditFlag(value)
    enableEditUserInfo(value)
  }
  const disableEdit = (value) => {
    // const dispatch = useDispatch();
    setEditFlag(value)
    disableEditUserInfo(value)
  }

  return (
    <tr className={darkMode ? 'bg-space-cadet' : ''}>
      <th scope="col" id="usermanagement_active">
        {ACTIVE}
      </th>
      <th scope="col" id="usermanagement_first" className='p-auto'>
        <div className='text-center flex'>
          <span className='m-auto'>
            {FIRST_NAME}
          </span>
          {authRole==="Owner" ?(editFlag.first == 1 ? <FontAwesomeIcon icon={faEdit} className='editbutton' onClick={() => enableEdit({ ...editFlag, 'first': 0 })}/> : <FontAwesomeIcon icon={faSave} className='editbutton' onClick={() => disableEdit({ ...editFlag, 'first': 1 })}/>):<></>}
        </div>
      </th>
      <th scope="col" id="usermanagement_last_name" className=''>
        <div className='text-center'>
          <span className='m-auto'>{LAST_NAME}</span>
          {authRole==="Owner" ?(editFlag.last == 1 ? <FontAwesomeIcon icon={faEdit} className='editbutton' onClick={() => enableEdit({ ...editFlag, 'last': 0 })}/>: <FontAwesomeIcon icon={faSave} className='editbutton' onClick={() => disableEdit({ ...editFlag, 'last': 1 })}/>):<></>}
        </div>
      </th>
      <th scope="col" id="usermanagement_role">
        <div className='text-center'>
          <span className='m-auto'>{ROLE}</span>
          {authRole==="Owner" ?(editFlag.role == 1 ? <FontAwesomeIcon icon={faEdit} className='editbutton' onClick={() => enableEdit({ ...editFlag, 'role': 0 })}/> : <FontAwesomeIcon icon={faSave} className='editbutton' onClick={() => disableEdit({ ...editFlag, 'role': 1 })}/>):<></>}
        </div>
      </th>
      <th scope="col" id="usermanagement_email">
        <div className='text-center'>
          <span className='m-auto text-center'>{EMAIL}</span>
          {authRole==="Owner" ?(editFlag.email == 1 ? <FontAwesomeIcon icon={faEdit} className='editbutton' onClick={() => enableEdit({ ...editFlag, 'email': 0 })}/> : <FontAwesomeIcon icon={faSave} className='editbutton' onClick={() => disableEdit({ ...editFlag, 'email': 1 })}/>):<></>}
        </div>
      </th>
      <th scope="col" id="usermanagement_hrs">
        <div className='text-center'>
          <span className='m-auto'>{WKLY_COMMITTED_HRS}</span>
          {authRole==="Owner" ? (editFlag.weeklycommittedHours == 1 ?
            <FontAwesomeIcon icon={faEdit} className='editbutton' onClick={() => enableEdit({ ...editFlag, 'weeklycommittedHours': 0 })} />
            : <FontAwesomeIcon icon={faSave} className='editbutton' onClick={() => disableEdit({ ...editFlag, 'weeklycommittedHours': 1 })}/>):<></>}
        </div>
      </th>

      <th scope="col" id="usermanagement_pause">
        <div className='text-center m-auto'>
          {PAUSE}
        </div>
      </th>

      <th scope="col" id="usermanagement_requested_time_off">
        <div className='text-center m-auto'>
          {REQUESTED_TIME_OFF}
        </div>
      </th>

      <th scope="col" id="usermanagement_finalday">
        <div className='text-center m-auto'>
          {MANAGE_FINAL_DAY}
        </div>
      </th>

      <th scope="col" id="usermanagement_resume_date">
        <div className='text-center m-auto'>
          {USER_RESUME_DATE}
        </div>
      </th>

      <th scope="col" id="usermanagement_resume_date">
        <div className='text-center'>
          <span className='m-auto text-center'>{USER_START_DATE}</span>
          {authRole==="Owner"?(editFlag.startDate == 1 ? <FontAwesomeIcon icon={faEdit} className='editbutton' onClick={() => enableEdit({ ...editFlag, 'startDate': 0 })}/> : <FontAwesomeIcon icon={faSave} className='editbutton' onClick={() => disableEdit({ ...editFlag, 'startDate': 1 })}/>):<></>}
        </div>
      </th>

      <th scope="col" id="usermanagement_resume_date">
        <div className='text-center'>
          <span className='m-auto text-center'>{USER_END_DATE}</span>
          {authRole==="Owner"? (editFlag.endDate == 1 ? <FontAwesomeIcon icon={faEdit} className='editbutton' onClick={() => enableEdit({ ...editFlag, 'endDate': 0 })}/>: <FontAwesomeIcon icon={faSave} className='editbutton' onClick={() => disableEdit({ ...editFlag, 'endDate': 1 })}/>):<></>}
        </div>
      </th>

      {userTableDataPermissions(authRole, roleSearchText) && (
        <th scope="col" id="usermanagement_delete"></th>
      )}
    </tr>
  );
});

export default UserTableHeader;
