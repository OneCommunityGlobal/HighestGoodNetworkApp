import React, { useEffect, useState } from 'react';
import axios from "axios"

import { Button, Modal, ModalBody, ModalHeader, Row, Col } from 'reactstrap';
import './PermissionsManagement.css';
import { connect, useSelector } from 'react-redux';
import { updateUserProfile, getUserProfile } from 'actions/userProfile';
import { getAllUserProfile } from 'actions/userManagement';
import { useHistory } from 'react-router-dom';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import UserPermissionsPopUp from './UserPermissionsPopUp';
import { getAllRoles } from '../../actions/role';
import { getInfoCollections } from '../../actions/information';
import hasPermission from '../../utils/permissions';
import CreateNewRolePopup from './NewRolePopUp';
import PermissionChangeLogTable from './PermissionChangeLogTable'
import { ENDPOINTS } from 'utils/URL';

function PermissionsManagement({ getAllRoles, roles, auth, getUserRole, userProfile, hasPermission, getInfoCollections, darkMode }) {
  const [isNewRolePopUpOpen, setIsNewRolePopUpOpen] = useState(false);
  const [isUserPermissionsOpen, setIsUserPermissionsOpen] = useState(false);

  const canPostRole = hasPermission('postRole');
  const canPutRole = hasPermission('putRole');
  const canManageUserPermissions = hasPermission('putUserProfilePermissions');

   // Added permissionChangeLogs state management
   const [changeLogs, setChangeLogs] = useState([])
   const [loading, setLoading] = useState(true);

  const history = useHistory();
  const togglePopUpNewRole = () => {
    setIsNewRolePopUpOpen(previousState => !previousState);
  };

  roles = roles.filter(role => {
    if (role != null) return role;
  });

  useEffect(() => {
    getAllRoles();
    getInfoCollections();
    getUserRole(auth?.user.userid);
    
    const getChangeLogs = async () => {
      try {
        const response = await axios.get(ENDPOINTS.PERMISSION_CHANGE_LOGS(auth?.user.userid))
        setChangeLogs(response.data)
        setLoading(false);
      }
      catch (error) {
        console.error('Error fetching change logs:', error)
      }
    }

    getChangeLogs()
  }, []);

  const togglePopUpUserPermissions = () => {
    setIsUserPermissionsOpen(previousState => !previousState);
  };
  const role = userProfile?.role;
  const roleNames = roles?.map(role => role.roleName);

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight:"100%" ,border: "1px solid #1B2A41"}}>
      <div key={`${role}+permission`} className={darkMode ? "permissions-management-dark bg-yinmn-blue" : "permissions-management"}>
        <h1 className="permissions-management__title">User Roles</h1>
        <div key={`${role}_header`} className="permissions-management__header">
          {canPutRole &&
            <div key={`${role}_name`} className="role-name-container">
            {roleNames?.map(roleName => {
              const roleNameLC = roleName.toLowerCase().replace(' ', '-');
              return (
                <div key={roleNameLC} className={`role-name ${darkMode ? 'role-name-dark' : ''}`}>
                  <button
                    onClick={() => history.push(`/permissionsmanagement/${roleNameLC}`)}
                    key={roleName}
                    className={`role-btn ${darkMode ? 'text-light' : ''}`}
                  >
                    {roleName}
                  </button>
                  <div className="infos">
                    <EditableInfoModal
                      role={role}
                      areaName={`${roleName}` + 'Info'}
                      areaTitle={`${roleName}` + ' User Role'}
                      fontSize={18}
                      isPermissionPage
                    />
                  </div>
                </div>
              );
            })}
          </div>
          }
          {(canPostRole || canManageUserPermissions) && (
            <div className="buttons-container">
              {canPostRole &&
              <Button
                className="permissions-management__button"
                type="button"
                color="success"
                onClick={() => togglePopUpNewRole()}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Add New Role
              </Button>}
              {(canManageUserPermissions) &&
              <Button
                color="primary"
                className="permissions-management__button"
                type="button"
                onClick={() => {
                  togglePopUpUserPermissions();
                }}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Manage User Permissions
              </Button>}
            </div>
          )}
        </div>
        <div className="permissions-management--flex">
          <Modal isOpen={isNewRolePopUpOpen} toggle={togglePopUpNewRole} id="modal-content__new-role">
            <ModalHeader
              toggle={togglePopUpNewRole}
              cssModule={{ 'modal-title': 'w-100 text-center my-auto' }}
            >
              Create New Role
            </ModalHeader>
            <ModalBody id="modal-body_new-role--padding">
              <CreateNewRolePopup toggle={togglePopUpNewRole} roleNames={roleNames} />
            </ModalBody>
          </Modal>
          <Modal
            isOpen={isUserPermissionsOpen}
            toggle={togglePopUpUserPermissions}
            id="modal-content__new-role"
          >
            <ModalHeader
              toggle={togglePopUpUserPermissions}
              cssModule={{ 'modal-title': 'w-100 text-center my-auto' }}
            >
              Manage User Permissions
            </ModalHeader>
            <ModalBody id="modal-body_new-role--padding">
              <UserPermissionsPopUp toggle={togglePopUpUserPermissions} />
            </ModalBody>
          </Modal>
        </div>
      </div>
      {loading && (<p className='loading-message'>Loading...</p>)}
      {changeLogs?.length > 0 && (<PermissionChangeLogTable changeLogs={changeLogs.slice().reverse()} darkMode={darkMode}/>)}
      <br />
      <br />
    </div>
  );
}

// export default PermissionsManagement;
const mapStateToProps = state => ({
  roles: state.role.roles,
  auth: state.auth,
  userProfile: state.userProfile,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getInfoCollections: () => dispatch(getInfoCollections()),
  getAllRoles: () => dispatch(getAllRoles()),
  updateUserProfile: data => dispatch(updateUserProfile(data)),
  getAllUsers: () => dispatch(getAllUserProfile()),
  getUserRole: id => dispatch(getUserProfile(id)),
  hasPermission: action => dispatch(hasPermission(action)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsManagement);

