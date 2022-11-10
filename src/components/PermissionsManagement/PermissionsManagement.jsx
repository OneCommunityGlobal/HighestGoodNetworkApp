import React, { useEffect } from 'react';
import { useState } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import CreateNewRolePopup from './NewRolePopUp';
import './PermissionsManagement.css';
import { connect } from 'react-redux';
import { getAllRoles } from '../../actions/role';
import { updateUserProfile } from 'actions/userProfile';
import { getAllUserProfile } from 'actions/userManagement';
import UserPermissionsPopUp from './UserPermissionsPopUp';

const PermissionsManagement = ({ getAllRoles, roles }) => {
  const [isNewRolePopUpOpen, setIsNewRolePopUpOpen] = useState(false);
  const [isUserPermissionsOpen, setIsUserPermissionsOpen] = useState(false);

  const togglePopUpNewRole = () => {
    setIsNewRolePopUpOpen(previousState => !previousState);
  };

  roles = roles.filter(role => {
    if (role != null) return role;
  });

  useEffect(() => {
    getAllRoles();
  }, []);

  const togglePopUpUserPermissions = () => {
    setIsUserPermissionsOpen(previousState => !previousState);
  };

  const roleNames = roles?.map(role => role.roleName);

  return (
    <div className="permissions-management">
      <div className="permissions-management__header">
        <h1 className="permissions-management__title">User Roles:</h1>

        <Button
          className="permissions-management__button"
          type="button"
          color="primary"
          onClick={() => togglePopUpNewRole()}
        >
          Add New Role
        </Button>
      </div>
      <div className="permissions-management--flex">
        <div>
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
        <div>
          {roleNames?.map(roleName => {
            let roleNameLC = roleName.toLowerCase().replace(' ', '-');
            return (
              <p key={roleName}>
                <a href={`/permissionsmanagement/${roleNameLC}`}>{roleName}</a>
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// export default PermissionsManagement;
const mapStateToProps = state => ({
  roles: state.role.roles,
});

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  updateUserProfile: data => dispatch(updateUserProfile(data)),
  getAllUsers: () => dispatch(getAllUserProfile),
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsManagement);
