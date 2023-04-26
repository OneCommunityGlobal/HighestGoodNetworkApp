import React, { useEffect } from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import CreateNewRolePopup from './NewRolePopUp';
import './PermissionsManagement.css';
import { connect } from 'react-redux';
import { getAllRoles } from '../../actions/role';
import { updateUserProfile, getUserProfile } from 'actions/userProfile';
import { getAllUserProfile } from 'actions/userManagement';
import UserPermissionsPopUp from './UserPermissionsPopUp';
import { useHistory } from 'react-router-dom';

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

  const roleNames = roles?.map(role => role.roleName);

  return (
    <div className="permissions-management">
      <h1 className="permissions-management__title">User Roles</h1>
      <div className="permissions-management__header">
        <div className="role-name-container">
          {roleNames?.map(roleName => {
            let roleNameLC = roleName.toLowerCase().replace(' ', '-');
            return (
              <button
                onClick={() => history.push(`/permissionsmanagement/${roleNameLC}`)}
                key={roleName}
                className="role-name"
              >
                {roleName}
              </button>
            );
          })}
        </div>
        {userProfile?.role === 'Owner' && (
          <div className="buttons-container">
            <Button
              className="permissions-management__button"
              type="button"
              color="success"
              onClick={() => togglePopUpNewRole()}
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
