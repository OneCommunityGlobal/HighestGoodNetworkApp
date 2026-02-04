import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAllUserProfile } from '../../actions/userManagement';
import { ENDPOINTS } from '~/utils/URL';
import userTableDataPermissions from '../../utils/userTableDataPermissions';
import PropTypes from 'prop-types';
import {
  ACTIVE,
  FIRST_NAME,
  LAST_NAME,
  ROLE,
  TITLE,
  EMAIL,
  WKLY_COMMITTED_HRS,
  PAUSE,
  USER_RESUME_DATE,
  MANAGE_FINAL_DAY,
  USER_START_DATE,
  USER_END_DATE,
} from '../../languages/en/ui';

/**
 * The header row of the user table.
 */
const UserTableHeaderComponent = ({ authUser, roleSearchText, darkMode, editUser, enableEditUserInfo, disableEditUserInfo, isMobile, mobileFontSize, roles }) => {
    const authRole = authUser?.role;
    const dispatch = useDispatch();
    const [editFlag, setEditFlag] = useState(editUser);
    const updatedUserData = useSelector(state => state.userProfileEdit.newUserData);
    const saveUserInformation = async updatedData => {
      try {
        const permissions = {
          frontPermissions: [],
          removedDefaultPermissions: [],
        };
        const requestor = authUser;
        const roleUpdateData = updatedUserData.filter(change => change.item === 'role')
        for (let i = 0; i < roleUpdateData.length; i+=1) {
          const roleUpdate = roleUpdateData[i];
          const permissionURL = `${ENDPOINTS.PERMISSION_MANAGEMENT_UPDATE()}/user/${roleUpdate.user_id}`;
          const roleIndex = roles?.findIndex(({ roleName }) => roleName === roleUpdate.value);
          const rolePermissions = roleIndex !== -1 ? roles[roleIndex].permissions : [];
          permissions.defaultPermissions = rolePermissions
          const permissionData = {
            reason: `Role Changed to **${roleUpdate.value}**.`,
            permissions: permissions,
            requestor: requestor,
          }

          axios.patch(permissionURL, permissionData).catch(err => console.error(err))
        }
        
        const response = await axios.patch(ENDPOINTS.USER_PROFILE_UPDATE, updatedData);
        if (response.status === 200) {
          const toastId = toast.success(' Saving Data...', { autoClose: false });
          await dispatch(getAllUserProfile());
          toast.update(toastId, {
            render: 'Data Updated successfully !',
            // type: toast.TYPE.SUCCESS,
            autoClose: 3000,
          });
        } else {
          toast.error('Error Updating Data!');
        }
      } catch (error) {
        toast.error('Error Updating Data ! ');
      }
    };
    const darkModeStyle = darkMode ? { color: 'white', backgroundColor: '#3a506b' } : { backgroundColor: "#f0f8ff",color:"black"};
    const enableEdit = value => {
      setEditFlag(value);
      enableEditUserInfo(value);
    };
    const disableEdit = value => {
      setEditFlag(value);
      disableEditUserInfo(value);
      saveUserInformation(updatedUserData);
    };

    return (
      <tr className={darkMode ? 'bg-space-cadet' : ''}
          style={{fontSize: isMobile ? mobileFontSize : 'initial'}}
      >
        <th scope="col" id="usermanagement_active" style={darkModeStyle}>
          {ACTIVE}
        </th>
        <th scope="col" id="usermanagement_first" className="p-auto" style={darkModeStyle}>
          <div className="text-center flex">
            <span className="m-auto">{FIRST_NAME}</span>
            {(() => {
              if (authRole === 'Owner') {
                if (editFlag.first === 1) {
                  return (
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="editbutton"
                      onClick={() => enableEdit({ ...editFlag, first: 0 })}
                    />
                  );
                }
                return (
                  <FontAwesomeIcon
                    icon={faSave}
                    className="editbutton"
                    onClick={() => disableEdit({ ...editFlag, first: 1 })}
                  />
                );
              }
              return <> </>;
            })()}
          </div>
        </th>
        <th scope="col" id="usermanagement_last_name" className="" style={darkModeStyle}>
          <div className="text-center">
            <span className="m-auto">{LAST_NAME}</span>
            {(() => {
              if (authRole === 'Owner') {
                if (editFlag.last === 1) {
                  return (
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="editbutton"
                      onClick={() => enableEdit({ ...editFlag, last: 0 })}
                    />
                  );
                }
                return (
                  <FontAwesomeIcon
                    icon={faSave}
                    className="editbutton"
                    onClick={() => disableEdit({ ...editFlag, last: 1 })}
                  />
                );
              }
              return <> </>;
            })()}
          </div>
        </th>
        <th scope="col" id="usermanagement_role" style={darkModeStyle}>
          <div className="text-center">
            <span className="m-auto">{ROLE}</span>
            {(() => {
              if (authRole === 'Owner') {
                if (editFlag.role === 1) {
                  return (
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="editbutton"
                      onClick={() => enableEdit({ ...editFlag, role: 0 })}
                    />
                  );
                }
                return (
                  <FontAwesomeIcon
                    icon={faSave}
                    className="editbutton"
                    onClick={() => disableEdit({ ...editFlag, role: 1 })}
                  />
                );
              }
              return <> </>;
            })()}
          </div>
        </th>
        <th scope="col" id="usermanagement_title" style={darkModeStyle}>
          <div>
            <div className="text-center">
              <span className="m-auto">{TITLE}</span>
              {(() => {
                if (authRole === 'Owner') {
                  if (editFlag.jobTitle === 1) {
                    return (
                      <FontAwesomeIcon
                        icon={faEdit}
                        className="editbutton"
                        onClick={() => enableEdit({ ...editFlag, jobTitle: 0 })}
                      />
                    );
                  }
                  return (
                    <FontAwesomeIcon
                      icon={faSave}
                      className="editbutton"
                      onClick={() => disableEdit({ ...editFlag, jobTitle: 1 })}
                    />
                  );
                }
                return <> </>;
              })()}
            </div>
          </div>
        </th>

        <th scope="col" id="usermanagement_email" style={darkModeStyle}>
          <div className="text-center">
            <span className="m-auto text-center">{EMAIL}</span>
            {(() => {
              if (authRole === 'Owner') {
                if (editFlag.email === 1) {
                  return (
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="editbutton"
                      onClick={() => enableEdit({ ...editFlag, email: 0 })}
                    />
                  );
                }
                return (
                  <FontAwesomeIcon
                    icon={faSave}
                    className="editbutton"
                    onClick={() => disableEdit({ ...editFlag, email: 1 })}
                  />
                );
              }
              return <> </>;
            })()}
          </div>
        </th>
        <th scope="col" id="usermanagement_hrs" style={darkModeStyle}>
          <div className="text-center">
            <span className="m-auto">{WKLY_COMMITTED_HRS}</span>
            {(() => {
              if (authRole === 'Owner') {
                if (editFlag.weeklycommittedHours === 1) {
                  return (
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="editbutton"
                      onClick={() => enableEdit({ ...editFlag, weeklycommittedHours: 0 })}
                    />
                  );
                }
                return (
                  <FontAwesomeIcon
                    icon={faSave}
                    className="editbutton"
                    onClick={() => disableEdit({ ...editFlag, weeklycommittedHours: 1 })}
                  />
                );
              }
              return <> </>;
            })()}
          </div>
        </th>

        <th scope="col" id="usermanagement_pause" style={darkModeStyle}>
          <div className="text-center m-auto">{PAUSE}</div>
        </th>

        <th scope="col" id="usermanagement_requested_time_off" style={darkModeStyle}>
        <div
          className="text-center m-auto"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <span>Req.</span>
          <i
            className="fa fa-clock-o"
            aria-hidden="true"
            title="time"
            style={{
              fontSize: '14px',
              color: darkMode ? 'lightgray' : 'black',
            }}
          />
          <span>off</span>
        </div>
        </th>

        <th scope="col" id="usermanagement_finalday" style={darkModeStyle}>
          <div className="text-center m-auto">{MANAGE_FINAL_DAY}</div>
        </th>

        <th scope="col" id="usermanagement_resume_date" style={darkModeStyle}>
          <div className="text-center m-auto">{USER_RESUME_DATE}</div>
        </th>

        <th scope="col" id="usermanagement_resume_date" style={darkModeStyle}>
          <div className="text-center">
            <span className="m-auto text-center">{USER_START_DATE}</span>
            {(() => {
              if (authRole === 'Owner') {
                if (editFlag.startDate === 1) {
                  return (
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="editbutton"
                      onClick={() => enableEdit({ ...editFlag, startDate: 0 })}
                    />
                  );
                }
                return (
                  <FontAwesomeIcon
                    icon={faSave}
                    className="editbutton"
                    onClick={() => disableEdit({ ...editFlag, startDate: 1 })}
                  />
                );
              }
              return <> </>;
            })()}
          </div>
        </th>

        <th scope="col" id="usermanagement_resume_date" style={darkModeStyle}>
          <div className="text-center">
            <span className="m-auto text-center">{USER_END_DATE}</span>
            {(() => {
              if (authRole === 'Owner') {
                if (editFlag.endDate === 1) {
                  return (
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="editbutton"
                      onClick={() => enableEdit({ ...editFlag, endDate: 0 })}
                    />
                  );
                }
                return (
                  <FontAwesomeIcon
                    icon={faSave}
                    className="editbutton"
                    onClick={() => disableEdit({ ...editFlag, endDate: 1 })}
                  />
                );
              }
              return <> </>;
            })()}
          </div>
        </th>

        {userTableDataPermissions(authRole, roleSearchText) && (
          <th scope="col" id="usermanagement_delete" aria-label="Delete User" style={darkModeStyle} />
        )}
      </tr>
    );
  };

UserTableHeaderComponent.propTypes = {
  authRole: PropTypes.string.isRequired,
  roleSearchText: PropTypes.string,
  darkMode: PropTypes.bool,
  editUser: PropTypes.object,
  enableEditUserInfo: PropTypes.func.isRequired,
  disableEditUserInfo: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
  mobileFontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  roles: PropTypes.object,
  auth: PropTypes.object,
 
};

const UserTableHeader = React.memo(UserTableHeaderComponent);
UserTableHeader.displayName = 'UserTableHeader';

export default UserTableHeader;
