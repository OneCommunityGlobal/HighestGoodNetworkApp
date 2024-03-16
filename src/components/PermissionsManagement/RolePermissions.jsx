import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import permissionLabel from './PermissionsConst';
import PermissionList from './PermissionList';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { updateRole, getAllRoles } from '../../actions/role';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { boxStyle } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import PermissionsPresetsModal from './PermissionsPresetsModal.jsx';
import { getPresetsByRole, createNewPreset } from 'actions/rolePermissionPresets';
import hasPermission from '../../utils/permissions';

function RolePermissions(props) {
  const [permissions, setPermissions] = useState(props.permissions);
  const [deleteRoleModal, setDeleteRoleModal] = useState(false);
  const [editRoleNameModal, setEditRoleNameModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [changed, setChanged] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const history = useHistory();
  const [showPresetModal, setShowPresetModal] = useState(false);
  const userProfile = useSelector(state => state.userProfile);

  const isEditableRole =
    props.role === 'Owner'
      ? props.hasPermission('addDeleteEditOwners')
      : props.auth.user.role !== props.role;
  const canEditRole = isEditableRole && props.hasPermission('putRole');
  const canDeleteRole = isEditableRole && props.hasPermission('deleteRole');

  useEffect(() => {
    setRoleName(props.role);
    props.getPresets(props.role);
  }, []);

  useEffect(() => {
    setPermissions(props.permissions);
  }, [props.roles]);

  const toggleDeleteRoleModal = () => {
    setDeleteRoleModal(!deleteRoleModal);
  };

  const toggleEditRoleNameModal = () => {
    setEditRoleNameModal(!editRoleNameModal);
  };

  const handleChangeRoleName = e => {
    setRoleName(e.target.value);
  };

  useEffect(() => {
    roleName !== props.role ? setDisabled(false) : setDisabled(true);
  }, [roleName]);

  const handleSaveNewPreset = async () => {
    let count = 1;
    while (props.presets.some(preset => preset.presetName === 'New Preset ' + count)) {
      count += 1;
    }
    const newPreset = {
      presetName: 'New Preset ' + count,
      roleName: props.role,
      permissions: permissions,
    };

    const status = await props.createNewPreset(newPreset);
    if (status === 0) {
      toast.success(`Preset created successfully`);
    } else {
      toast.error(`Error creating preset`);
    }
  };

  const updateInfo = async () => {
    const id = props.roleId;

    const updatedRole = {
      roleName: roleName,
      permissions: permissions,
      roleId: id,
    };
    try {
      delete userProfile.permissions; // prevent overriding 'permissions' key-value pair
      await props.updateRole(id, { ...updatedRole, ...userProfile });
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
            {canEditRole && (
              <FontAwesomeIcon
                icon={faEdit}
                size="lg"
                className="user-role-tab__icon edit-icon"
                onClick={toggleEditRoleNameModal}
              />
            )}
          </div>
          {canEditRole && (
            <div style={{ flexDirection: 'row', display: 'flex' }}>
              <div className="name-container__btn_columns">
                <div className="name-container__btns">
                  <Button
                    className="btn_save"
                    color="success"
                    onClick={handleSaveNewPreset}
                    style={boxStyle}
                  >
                    Create New Preset
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      setShowPresetModal(!showPresetModal);
                    }}
                    style={boxStyle}
                  >
                    Load Presets
                  </Button>
                </div>
                <div className="name-container__btns">
                  <Button
                    className="btn_save"
                    color="success"
                    onClick={() => updateInfo()}
                    style={boxStyle}
                  >
                    Save
                  </Button>
                  <Button
                    color="danger"
                    onClick={toggleDeleteRoleModal}
                    style={boxStyle}
                    disabled={!canDeleteRole}
                  >
                    Delete Role
                  </Button>
                </div>
              </div>

              <div
                className="icon-button-container"
                style={{ position: 'relative', width: '0', height: '0' }}
              >
                <div
                  className="name-container__btns"
                  style={{ position: 'absolute', left: '10px', top: '20px' }}
                >
                  <i
                    data-toggle="tooltip"
                    data-placement="center"
                    title="Click for information about this"
                    aria-hidden="true"
                    className="fa fa-info-circle"
                    onClick={() => {
                      handleModalOpen('Create New Preset');
                    }}
                  />
                  <i
                    data-toggle="tooltip"
                    data-placement="center"
                    title="Click for information about this"
                    aria-hidden="true"
                    className="fa fa-info-circle"
                    onClick={() => {
                      handleModalOpen('Load Presets');
                    }}
                  />
                </div>
              </div>
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
        <PermissionList
          rolePermissions={permissions}
          permissionsList={permissionLabel}
          editable={canEditRole}
          setPermissions={setPermissions}
          onChange={() => {
            setChanged(true);
          }}
        />
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

      <Modal
        isOpen={showPresetModal}
        toggle={() => {
          setShowPresetModal(previous => !previous);
        }}
        id="modal-content__new-role"
      >
        <ModalHeader
          toggle={() => {
            setShowPresetModal(previous => !previous);
          }}
          cssModule={{ 'modal-title': 'w-100 text-center my-auto' }}
        >
          Role Presets
        </ModalHeader>
        <ModalBody id="modal-body_new-role--padding">
          <PermissionsPresetsModal
            roleId={props.roleId}
            roleName={props.role}
            onApply={perms => setPermissions(perms)}
          />
        </ModalBody>
      </Modal>
    </>
  );
}

const mapStateToProps = state => ({
  roles: state.role.roles,
  presets: state.rolePreset.presets,
  auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  updateRole: (roleId, updatedRole) => dispatch(updateRole(roleId, updatedRole)),
  getPresets: role => dispatch(getPresetsByRole(role)),
  createNewPreset: newPreset => dispatch(createNewPreset(newPreset)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RolePermissions);
