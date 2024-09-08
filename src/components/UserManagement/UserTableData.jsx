import React, { useState, useEffect } from 'react';
import ResetPasswordButton from './ResetPasswordButton';
import { DELETE, PAUSE, RESUME, SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import { UserStatus, FinalDay } from '../../utils/enums';
import ActiveCell from './ActiveCell';
import hasPermission from 'utils/permissions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCalendarDay, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from 'styles';
import { connect, useSelector } from 'react-redux';
import { formatDate, formatDateYYYYMMDD } from 'utils/formatDate';
import { formatDateLocal } from 'utils/formatDate';
import { cantUpdateDevAdminDetails } from 'utils/permissions';
import { useDispatch } from 'react-redux';
import { getAllRoles } from 'actions/role';
import {getAllUserProfile } from 'actions/userManagement';
// import { START_USER_INFO_UPDATE } from 'constants/userManagement';
import { useRef } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

/**
 * The body row of the user table
 */
const UserTableData = React.memo(props => {
  const darkMode = props.darkMode;
  const editUser = props.editUser!==undefined?props.editUser:{ 'first': 1, 'last': 1, 'role': 1, 'email': 1, 'weeklycommittedHours': 1 ,'startDate':1,'endDate':1};
  // console.log(props.editUser)
  const [isChanging, onReset] = useState(false);
  const canAddDeleteEditOwners = props.hasPermission('addDeleteEditOwners');
  const [formData, updateFormData] = useState({ firstName: props.user.firstName, lastName: props.user.lastName, id: props.user._id, role: props.user.role, email: props.user.email, weeklycommittedHours: props.user.weeklycommittedHours, startDate: formatDate(props.user.startDate), endDate: formatDate(props.user.endDate) })
  const dispatch = useDispatch();
  const { roles } = useSelector(state => state.role)
  const updateInfo=useSelector(state=>state.updateUserInfo)
  const toastShown = useRef(false);

  const joinTimeStamp=(date)=>{
    const now = new Date();
      var formattedTimestamp = now.toISOString();
      formattedTimestamp=date.toString()+'T'+formattedTimestamp.split('T')[1]
      return formattedTimestamp;
  }
  const saveUserInformation = async (item, value, id) => {
    try {
      var response=await axios.patch(ENDPOINTS.USER_PROFILE_UPDATE,{ item: item, value: value, id: id });
      if(response.status==200){
        dispatch(getAllUserProfile())
        toast.success("Data updated successfully !")
      }else{
        toast.error("Error Updating Data!")
      }
    } catch (error) {
      toast.error("Error Updating Data ! ")
    }
  }

  useEffect(() => {
    onReset(false);
    dispatch(getAllRoles())
  }, [props.isActive, props.resetLoading]);

  useEffect(() => {
    updateFormData({ firstName: props.user.firstName, lastName: props.user.lastName, id: props.user._id, role: props.user.role, email: props.user.email, weeklycommittedHours: props.user.weeklycommittedHours, startDate: formatDateYYYYMMDD(props.user.startDate), endDate: formatDateYYYYMMDD(props.user.endDate) })
  }, [props.user])

  /**
   * Checks whether users should be able to change the record of other users.
   * @returns {boolean} true if the target user record has a owner role, the logged in 
   * user does not have the addDeleteEditOwners permission, or the target user is only
   * editable by Jae's account.
   */
  const checkPermissionsOnOwner = () => {
    const recordEmail = props.user.email;
    const loginUserEmail = props.authEmail;

    return (props.user.role === 'Owner' && !canAddDeleteEditOwners)
      || cantUpdateDevAdminDetails(recordEmail, loginUserEmail);
  };

  const isCurrentUser = props.user.email === props.authEmail;

  return (
    <tr className={`usermanagement__tr ${darkMode ? 'bg-yinmn-blue' : ''}`} id={`tr_user_${props.index}`}>
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
        {editUser.first ? (<div>
          <a href={`/userprofile/${props.user._id}`} className={darkMode ? 'text-azure' : ''}>{formData.firstName} </a>
          <FontAwesomeIcon
            className="copy_icon"
            icon={faCopy}
            onClick={() => {
              navigator.clipboard.writeText(formData.firstName);
              toast.success('First Name Copied!');
            }}
          />
        </div>) : <input type='text' className='edituser_input_firstname' value={formData.firstName} onChange={(e) => { updateFormData({ ...formData, firstName: e.target.value }); saveUserInformation('firstName', e.target.value, props.user._id) }}></input>}
      </td>
      <td className="email_cell">
        {editUser.last ? <div><a href={`/userprofile/${props.user._id}`} className={darkMode ? 'text-azure' : ''}>{formData.lastName}</a>
          <FontAwesomeIcon
            className="copy_icon"
            icon={faCopy}
            onClick={() => {
              navigator.clipboard.writeText(formData.lastName);
              toast.success('Last Name Copied!');
            }}
          /></div> : <input type='text' className='edituser_input text-center' value={formData.lastName} onChange={(e) => { updateFormData({ ...formData, lastName: e.target.value }); saveUserInformation('lastName', e.target.value, props.user._id) }}></input>}

      </td>

      {editUser.role && roles !== undefined ? (<td>{formData.role}</td>) :
       ( <td><select name="role-select-tag" id="" value={formData.role} onChange={(e) => { updateFormData({ ...formData, role: e.target.value }); saveUserInformation('role', e.target.value, props.user._id) }}>
          {roles?.map((e, index) => <option key={index} value={e.roleName} >{e.roleName}</option>)}
        </select></td>)}


      <td className="email_cell">
        {editUser.email ? <div>
          {formData.email}
          <FontAwesomeIcon
            className="copy_icon"
            icon={faCopy}
            onClick={() => {
              navigator.clipboard.writeText(formData.email);
              toast.success('Email Copied!');
            }}
          /></div> : <input type='text' className='edituser_input' value={formData.email} onChange={(e) => { updateFormData({ ...formData, email: e.target.value }); saveUserInformation('email', e.target.value, props.user._id) }}></input>
        }
      </td>
      <td>
        {editUser.weeklycommittedHours ?
          <span>
            {formData.weeklycommittedHours}
          </span> :
          <input type='number' className='edituser_input' value={formData.weeklycommittedHours} onChange={(e) => { updateFormData({ ...formData, 'weeklycommittedHours': e.target.value }); saveUserInformation('weeklycommittedHours', e.target.value, props.user._id) }}></input>
        }
      </td>
      <td>
        <button
          type="button"
          className={`btn btn-outline-${props.isActive ? 'warning' : 'success'} btn-sm`}
          onClick={e => {
            if (cantUpdateDevAdminDetails(props.user.email, props.authEmail)) {
              alert('STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.');
              return;
            }
            onReset(true);
            props.onPauseResumeClick(
              props.user,
              props.isActive ? UserStatus.InActive : UserStatus.Active,
            );
          }}
          style={darkMode ? { boxShadow: "0 0 0 0", fontWeight: "bold" } : boxStyle}
        >
          {isChanging ? '...' : props.isActive ? PAUSE : RESUME}
        </button>
      </td>
      <td className="centered-td">
        <button
          className={`btn btn-outline-primary btn-sm${props.timeOffRequests?.length > 0 ? ` time-off-request-btn-moved` : ''
            }`}
          onClick={e => props.onLogTimeOffClick(props.user)}
          id="requested-time-off-btn"
          style={darkMode ? { boxShadow: "0 0 0 0", fontWeight: "bold" } : boxStyle}
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
          <button
            type="button"
            className={`btn btn-outline-${props.user.endDate ? 'warning' : 'success'} btn-sm`}
            onClick={e => {
              if (cantUpdateDevAdminDetails(props.user.email, props.authEmail)) {
                alert('STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.');
                return;
              }

              props.onFinalDayClick(
                props.user,
                props.user.endDate ? FinalDay.NotSetFinalDay : FinalDay.FinalDay,
              );
            }}
            style={darkMode ? { boxShadow: "0 0 0 0", fontWeight: "bold" } : boxStyle}
          >
            {props.user.endDate ? CANCEL : SET_FINAL_DAY}
          </button>
        )}
      </td>
      <td>
        {props.user.isActive === false && props.user.reactivationDate
          ? formatDateLocal(props.user.reactivationDate)
          : ''}
      </td>
      <td>
        {
          editUser.startDate ?
          
            <span>
              {props.user.startDate ? formatDate(formData.startDate) : 'N/A'}
              {/* {formData.startDate},{props.user.startDate} */}
            </span> :
            <input type='date' className='edituser_input' value={formData.startDate} onChange={(e) => { updateFormData({ ...formData, startDate: (e.target.value)}); saveUserInformation('startDate',joinTimeStamp(e.target.value), props.user._id);}}></input>
        }
      </td>
      <td className="email_cell">
        {editUser.endDate ? <div>
          {props.user.endDate ? formatDate(formData.endDate) : 'N/A'}
          <FontAwesomeIcon
            className="copy_icon"
            icon={faCopy}
            onClick={() => {
              navigator.clipboard.writeText(props.user.endDate ? formatDate(formData.endDate) : 'N/A');
              toast.success('End Date Copied!');
            }}
          />
        </div> :
          <input type='date' className='edituser_input' value={formData.endDate} onChange={(e) => { updateFormData({ ...formData, endDate: (e.target.value)}); saveUserInformation('endDate', joinTimeStamp(e.target.value), props.user._id) }}></input>
        }
      </td>
      {checkPermissionsOnOwner() ? null : (
        <td>
          <span className="usermanagement-actions-cell">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={e => {
                props.onDeleteClick(props.user, 'archive');
              }}
              style={darkMode ? { boxShadow: "0 0 0 0", fontWeight: "bold" } : boxStyle}
              disabled={props.auth?.user.userid === props.user._id}
            >
              {DELETE}
            </button>
          </span>
          <span className="usermanagement-actions-cell">
            <ResetPasswordButton authEmail={props.authEmail} user={props.user} darkMode={darkMode} isSmallButton />
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