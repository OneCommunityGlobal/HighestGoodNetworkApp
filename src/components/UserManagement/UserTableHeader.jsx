import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAllUserProfile } from '../../actions/userManagement';
import { ENDPOINTS } from '../../utils/URL';
import userTableDataPermissions from '../../utils/userTableDataPermissions';
import {
  ACTIVE,
  FIRST_NAME,
  LAST_NAME,
  ROLE,
  JOB_TITLE,
  EMAIL,
  WKLY_COMMITTED_HRS,
  PAUSE,
  USER_RESUME_DATE,
  MANAGE_FINAL_DAY,
  USER_START_DATE,
  USER_END_DATE,
  REQUESTED_TIME_OFF,
} from '../../languages/en/ui';

/**
 * The header row of the user table.
 */
const UserTableHeader = React.memo(
  ({ authRole, roleSearchText, darkMode, editUser, enableEditUserInfo, disableEditUserInfo }) => {
    const dispatch = useDispatch();
    const [editFlag, setEditFlag] = useState(editUser);
    const updatedUserData = useSelector(state => state.userProfileEdit.newUserData);
    const saveUserInformation = async updatedData => {
      try {
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
      <tr className={darkMode ? 'bg-space-cadet' : ''}>
        <th scope="col" id="usermanagement_active">
          {ACTIVE}
        </th>
        <th scope="col" id="usermanagement_first" className="p-auto">
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
        <th scope="col" id="usermanagement_last_name" className="">
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
        <th scope="col" id="usermanagement_role">
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
        <th scope="col" id="usermanagement_email">
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
        <th scope="col" id="usermanagement_hrs">
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
        <th scope="col" id="usermanagement_jobTitle" className="">
          <div className="text-center">
            <span className="m-auto">{JOB_TITLE}</span>
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
        </th>
        <th scope="col" id="usermanagement_pause">
          <div className="text-center m-auto">{PAUSE}</div>
        </th>

        <th scope="col" id="usermanagement_requested_time_off">
          <div className="text-center m-auto">{REQUESTED_TIME_OFF}</div>
        </th>

        <th scope="col" id="usermanagement_finalday">
          <div className="text-center m-auto">{MANAGE_FINAL_DAY}</div>
        </th>

        <th scope="col" id="usermanagement_resume_date">
          <div className="text-center m-auto">{USER_RESUME_DATE}</div>
        </th>

        <th scope="col" id="usermanagement_resume_date">
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

        <th scope="col" id="usermanagement_resume_date">
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
          <th scope="col" id="usermanagement_delete" aria-label="Delete User" />
        )}
      </tr>
    );
  },
);

export default UserTableHeader;
