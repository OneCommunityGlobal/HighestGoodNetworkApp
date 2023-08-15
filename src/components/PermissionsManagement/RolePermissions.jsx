import React, { useState, useEffect } from 'react';
import { permissionLabel } from './UserRoleTab';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { updateRole, getAllRoles } from '../../actions/role';
import { toast } from 'react-toastify';
import { permissionFrontToBack } from 'utils/associatedPermissions';
import { ENDPOINTS } from '../../utils/URL';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { boxStyle } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const mapPermissionToLabel = permissions => {
  const label = [];

  permissions.map(permission => {
    if (permissionLabel[permission]) {
      label.push(permissionLabel[permission]);
    }
  });

  return label;
};

function RolePermissions(props) {
  const modalInfo = {
  const [permissions, setPermissions] = useState(mapPermissionToLabel(props.permissions));
  const [deleteRoleModal, setDeleteRoleModal] = useState(false);
  const [editRoleNameModal, setEditRoleNameModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [changed, setChanged] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const history = useHistory();
  const [infoRoleModal, setinfoRoleModal] = useState(false);
  const [modalContent, setContent] = useState(null);

  useEffect(() => {
    setRoleName(props.role);
  }, []);

  const toggleDeleteRoleModal = () => {
    setDeleteRoleModal(!deleteRoleModal);
  };

  const toggleEditRoleNameModal = () => {
    setEditRoleNameModal(!editRoleNameModal);
  };

  const toggleInfoRoleModal = () => {
    setinfoRoleModal(!infoRoleModal);
  };

  const handleChangeRoleName = e => {
    setRoleName(e.target.value);
  };

  const handleModalOpen = idx => {
    setContent(modalInfo[idx]);
    setinfoRoleModal(true);
  };

  useEffect(() => {
    roleName !== props.role ? setDisabled(false) : setDisabled(true);
  }, [roleName]);

  const onRemovePermission = permission => {
    const newPermissions = permissions.filter(perm => perm !== permission);
    setPermissions(newPermissions);
  };

  const onAddPermission = permission => {
    setPermissions(previous => [...previous, permission]);
  };

  const updateInfo = async () => {
    const permissionsObjectName = permissions.map(perm => {
      return getKeyByValue(permissionLabel, perm);
    });

    const permissionsBackEnd = permissionsObjectName.map(permission =>
      permissionFrontToBack(permission),
    );
    const id = props.roleId;

    const updatedRole = {
      roleName: roleName,
      permissions: permissionsObjectName,
      permissionsBackEnd: permissionsBackEnd.flat(),
      roleId: id,
    };
    try {
      await props.updateRole(id, updatedRole);
      history.push('/permissionsmanagement');
      toast.success('Role updated successfully');
      setChanged(false);
    } catch (error) {
      toast.error('Error updating role');
    }
  };

  const deleteRole = async () => {
    try {
      const URL = ENDPOINTS.ROLES_BY_ID(props.roleId);
      const res = await axios.delete(URL);
      history.push('/permissionsmanagement');
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      {changed ? (
        <Alert color="warning" className="user-role-tab__alert ">
          You have unsaved changes! Please click <strong>Save</strong> button to save changes!
        </Alert>
      ) : (
        <></>
      )}
      <header>
        <div className="user-role-tab__name-container">
          <div className="name-container__role-name">
            <h1 className="user-role-tab__h1">Role Name: {roleName}</h1>
            {props?.userRole === 'Owner' && (
              <FontAwesomeIcon
                icon={faEdit}
                size="lg"
                className="user-role-tab__icon edit-icon"
                onClick={toggleEditRoleNameModal}
              />
            )}
          </div>
          {props?.userRole === 'Owner' && (
            <div className="name-container__btns">
              <Button className="btn_save" color="success" onClick={() => updateInfo()}>
                Save
              </Button>
              <Button color="danger" onClick={toggleDeleteRoleModal}>
                Delete Role
              </Button>
            </div>
          )}
          <Modal isOpen={editRoleNameModal} toggle={toggleEditRoleNameModal}>
            <ModalHeader>Edit Role Name</ModalHeader>
            <ModalBody>
              <label htmlFor="editRoleName">New Role Name</label>
              <Input
                type="text"
                name="editRoleName"
                id="editRoleName"
                value={roleName}
                onChange={handleChangeRoleName}
              />
            </ModalBody>
            <ModalFooter>
              <Button onClick={toggleEditRoleNameModal}>Cancel</Button>
              <Button
                color="success"
                disabled={disabled}
                onClick={() => {
                  toggleEditRoleNameModal();
                  setChanged(true);
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </Modal>
        </div>
        <h2 className="user-role-tab__h2">Permission List</h2>
      </header>
      <ul className="user-role-tab__permissionList">
        {props.permissionsList.map((permission) => (
          <li className="user-role-tab__permissions" key={permission}>
            <p style={{ color: permissions.includes(permission) ? 'green' : 'red' }}>
              {permission}
            </p>
            <div className="icon-button-container">
              <div style={{paddingRight: '27px'}}>
                  <EditableInfoModal
                    role={props?.userRole}
                    areaName={`${permission}`+'Info'}
                    fontSize={24} />{' '}
               </div>
              <Button
                className="icon-button"
                color={permissions.includes(permission) ? 'danger' : 'success'}
                onClick={() => {
                  permissions.includes(permission)
                    ? onRemovePermission(permission)
                    : onAddPermission(permission);
                  setChanged(true);
                }}
                disabled={props?.userRole !== 'Owner'}
                style={boxStyle}
              >
                {permissions.includes(permission) ? 'Delete' : 'Add'}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Modal isOpen={deleteRoleModal} toggle={toggleDeleteRoleModal}>
        <ModalHeader>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            size="lg"
            className="user-role-tab__icon warning-icon"
          />
          Delete {roleName} Role
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete <strong>{roleName}</strong> role?
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggleDeleteRoleModal} style={boxStyle}>
            Cancel
          </Button>
          <Button color="danger" onClick={() => deleteRole()} style={boxStyle}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={infoRoleModal} toggle={toggleInfoRoleModal}>
        <ModalHeader toggle={toggleInfoRoleModal}>Permission Info</ModalHeader>
        <ModalBody>{modalContent}</ModalBody>
        <ModalFooter>
          <Button onClick={toggleInfoRoleModal} color="secondary" className="float-left">
            {' '}
            Ok{' '}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

const mapStateToProps = state => ({ roles: state.role.roles });

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  updateRole: (roleId, updatedRole) => dispatch(updateRole(roleId, updatedRole)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RolePermissions);
