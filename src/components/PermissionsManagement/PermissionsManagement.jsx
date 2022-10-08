import React from 'react';
import { useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import CreateNewRolePopup from './NewRolePopUp';
import './PermissionsManagement.css';

const PermissionsManagement = () => {
  const [isNewRolePopUpOpen, setIsNewRolePopUpOpen] = useState(false);

  const toggle = () => {
    setIsNewRolePopUpOpen(previousState => !previousState);
  };
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
      <p>
        <a href="/permissionsmanagement/admin">Administrator</a>
      </p>
      <p>
        <a href="/permissionsmanagement/owner">Owner</a>
      </p>
      <p>
        <a href="/permissionsmanagement/coreteam">Core Team</a>
      </p>
      <p>
        <a href="/permissionsmanagement/manager">Manager</a>
      </p>
      <p>
        <a href="/permissionsmanagement/mentor">Mentor</a>
      </p>
      <p>
        <a href="/permissionsmanagement/volunteer">Volunteer</a>
      </p>
    </div>
  );
};

export default PermissionsManagement;
