import React, { useEffect, useState } from 'react';

import { Button, Modal, ModalBody, ModalHeader, Row, Col } from 'reactstrap';
import CreateNewRolePopup from './NewRolePopUp';
import './PermissionsManagement.css';
import { connect,useSelector } from 'react-redux';
import { getAllRoles } from '../../actions/role';
import { updateUserProfile, getUserProfile } from 'actions/userProfile';
import { getAllUserProfile } from 'actions/userManagement';
import UserPermissionsPopUp from './UserPermissionsPopUp';
import { useHistory } from 'react-router-dom';
import { boxStyle } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';

const PermissionsManagement = ({ getAllRoles, roles, auth, getUserRole, userProfile }) => {
  const [isNewRolePopUpOpen, setIsNewRolePopUpOpen] = useState(false);
  const [isUserPermissionsOpen, setIsUserPermissionsOpen] = useState(false);

  let history = useHistory();
  const togglePopUpNewRole = () => {
    setIsNewRolePopUpOpen(previousState => !previousState);
  };

  roles = roles.filter(role => {
    if (role != null) return role;
  });

  useEffect(() => {
    getAllRoles();
    getUserRole(auth?.user.userid);
  }, []);

  const togglePopUpUserPermissions = () => {
    setIsUserPermissionsOpen(previousState => !previousState);
  };
  const role = userProfile?.role;
  const roleNames = roles?.map(role => role.roleName);

  return (
    <div key={`${role}+permission`} className="permissions-management">
      <h1 className="permissions-management__title">User Roles</h1>
      <div key={`${role}_header`} className="permissions-management__header">
        <div key={`${role}_name`} className="role-name-container">
          {roleNames?.map(roleName => {
            let roleNameLC = roleName.toLowerCase().replace(' ', '-');
            return (
              <div key={roleNameLC} className="role-name">
                <button
                  onClick={() => history.push(`/permissionsmanagement/${roleNameLC}`)}
                  key={roleName}
                  className="role-btn"
                >
                  {roleName}
                 </button>
                  <div className='infos'>
                    <EditableInfoModal
                    role={role}
                    areaName={`${roleName}`+'Info'}
                    fontSize={18}
                    isPermissionPage={true}
                    />
                  </div>
              </div>
            )})}
        </div>
        {userProfile?.role === 'Owner' && (
          <div className="buttons-container">
            <Button
              className="permissions-management__button"
              type="button"
              color="success"
              onClick={() => togglePopUpNewRole()}
              style={boxStyle}
            >
              Add New Role
            </Button>
            <Button
              color="primary"
              className="permissions-management__button"
              type="button"
              onClick={() => {
                togglePopUpUserPermissions();
              }}
              style={boxStyle}
            >
              Manage User Permissions
            </Button>
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
            <CreateNewRolePopup toggle={togglePopUpNewRole} />
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
  );
};

// export default PermissionsManagement;
const mapStateToProps = state => ({
  roles: state.role.roles,
  auth: state.auth,
  userProfile: state.userProfile,
});

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  updateUserProfile: data => dispatch(updateUserProfile(data)),
  getAllUsers: () => dispatch(getAllUserProfile),
  getUserRole: id => dispatch(getUserProfile(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsManagement);
