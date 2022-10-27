import React, { useEffect } from 'react';
import { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import CreateNewRolePopup from './NewRolePopUp';
import './PermissionsManagement.css';
import { connect } from 'react-redux';
import { getAllRoles } from '../../actions/role';

const PermissionsManagement = ({ getAllRoles, roles }) => {
  const [isNewRolePopUpOpen, setIsNewRolePopUpOpen] = useState(false);

  const toggle = () => {
    setIsNewRolePopUpOpen(previousState => !previousState);
  };
  roles = roles.filter(role => {
    if (role != null) return role;
  });

  useEffect(() => {
    getAllRoles();
  }, []);

  const roleNames = roles?.map(role => role.roleName);

  return (
    <div className="permissions-management">
      <div className="permissions-management__header">
        <h1 className="permissions-management__title">User Roles:</h1>
        <button type="button" className="btn btn-info" onClick={() => toggle()}>
          Add New Role
        </button>
      </div>

      <Modal isOpen={isNewRolePopUpOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Create New Role</ModalHeader>
        <ModalBody>
          <CreateNewRolePopup toggle={toggle} />
        </ModalBody>
      </Modal>
      {roleNames?.map(roleName => {
        let roleNameLC = roleName.toLowerCase().replace(' ', '-');
        return (
          <p key={roleName}>
            <a href={`/permissionsmanagement/${roleNameLC}`}>{roleName}</a>
          </p>
        );
      })}
    </div>
  );
};

// export default PermissionsManagement;
const mapStateToProps = state => ({ roles: state.role.roles });

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsManagement);
