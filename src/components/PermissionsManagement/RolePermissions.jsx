import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { boxStyle, boxStyleDark } from 'styles';
import { getPresetsByRole, createNewPreset } from 'actions/rolePermissionPresets';
import PermissionsPresetsModal from './PermissionsPresetsModal';
import { ENDPOINTS } from '../../utils/URL';
import { updateRole, getAllRoles } from '../../actions/role';
import PermissionList from './PermissionList';
import permissionLabel from './PermissionsConst';
import hasPermission from '../../utils/permissions';
import { roleOperationLabels } from './PermissionsConst';

function RolePermissions(props) {
  const { darkMode } = props;
  const [permissions, setPermissions] = useState(props.permissions);
  const [deleteRoleModal, setDeleteRoleModal] = useState(false);
  const [editRoleNameModal, setEditRoleNameModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [changed, setChanged] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const history = useHistory();
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showRoleSaveOperationModal, setShowRoleSaveOperationModal] = useState(false);
  const [showRoleDeleteOperationModal, setShowRoleDelteOperationModal] = useState(false);
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
    if (roleName !== props.role) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [roleName]);

  const handleSaveNewPreset = async () => {
    let count = 1;
    // eslint-disable-next-line no-loop-func
    while (props.presets.some(preset => preset.presetName === `New Preset ${count}`)) {
      count += 1;
    }
    const newPreset = {
      presetName: `New Preset ${count}`,
      roleName: props.role,
      permissions,
    };

    const status = await props.createNewPreset(newPreset);
    if (status === 0) {
      toast.success(`Preset created successfully`);
    } else {
      toast.error(`Error creating preset`);
    }
  };

  const handleModalOpen = value => {
    if (value === 'save') {
      setShowRoleSaveOperationModal(true);
    } else if (value === 'delete') {
      setShowRoleDelteOperationModal(true);
    } else {
      setShowRoleSaveOperationModal(false);
      setShowRoleDelteOperationModal(false);
    }
  };

  const updateInfo = async () => {
    const id = props.roleId;

    const updatedRole = {
      roleName,
      permissions,
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
      await axios.delete(URL);
      history.push('/permissionsmanagement');
    } catch (error) {
      // console.log(error.message);
    }
  };

  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  return (
    <>
      {changed ? (
        <Alert color="warning" className="user-role-tab__alert ">
          You have unsaved changes! Please click <strong>Save</strong> button to save changes!
        </Alert>
      ) : null}
      <header>
        <div className="user-role-tab__name-container">
          <div className="name-container__role-name">
            <h1 className="user-role-tab__h1">Role Name: {roleName}</h1>
            {canEditRole && (
              <FontAwesomeIcon
                icon={faEdit}
                size="lg"
                className={`user-role-tab__icon edit-icon ${darkMode ? 'text-light' : ''}`}
                onClick={toggleEditRoleNameModal}
              />
            )}
          </div>
          {canEditRole && (
            <div style={{ flexDirection: 'row', display: 'flex' }}>
              <div className="name-container__btn_columns">
                <div className="name-container__btns">
                  <Button
                    className="btn_save responsive-font-size"
                    color="success"
                    onClick={handleSaveNewPreset}
                    style={boxStyling}
                  >
                    Create New Preset
                  </Button>
                  <Button
                    className="responsive-font-size btn_save"
                    color="primary"
                    onClick={() => {
                      setShowPresetModal(!showPresetModal);
                    }}
                    style={boxStyling}
                  >
                    Load Presets
                  </Button>
                </div>
                <div className="name-container__btns">
                  <div>
                    <Button
                      className="btn_save responsive-font-size mr-2"
                      color="success"
                      onClick={() => updateInfo()}
                      style={boxStyling}
                    >
                      Save
                    </Button>
                    <i
                      data-toggle="tooltip"
                      data-placement="center"
                      title="Click for information about this"
                      aria-hidden="true"
                      className="fa fa-info-circle"
                      onClick={() => {
                        // eslint-disable-next-line no-undef
                        handleModalOpen('save');
                      }}
                    />
                  </div>
                  <div>
                    <Button
                      className="responsive-font-size btn_save mr-2"
                      color="danger"
                      onClick={toggleDeleteRoleModal}
                      style={boxStyling}
                      disabled={!canDeleteRole}
                    >
                      Delete Role
                    </Button>
                    <i
                      data-toggle="tooltip"
                      data-placement="center"
                      title="Click for information about this"
                      aria-hidden="true"
                      className="fa fa-info-circle mt-2"
                      onClick={() => {
                        // eslint-disable-next-line no-undef
                        handleModalOpen('delete');
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <Modal
            className={darkMode ? 'dark-mode text-light' : ''}
            isOpen={editRoleNameModal}
            toggle={toggleEditRoleNameModal}
          >
            <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Edit Role Name</ModalHeader>
            <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
              <label htmlFor="editRoleName" className={darkMode ? 'text-light' : ''}>
                New Role Name
              </label>
              <Input
                type="text"
                name="editRoleName"
                id="editRoleName"
                value={roleName}
                onChange={handleChangeRoleName}
              />
            </ModalBody>
            <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
              <Button onClick={toggleEditRoleNameModal} style={boxStyling}>
                Cancel
              </Button>
              <Button
                style={boxStyling}
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
          darkMode={darkMode}
        />
      </ul>
      {roleOperationLabels.map(label => (
        <Modal
          isOpen={label.key === 'save' ? showRoleSaveOperationModal : showRoleDeleteOperationModal}
          toggle={handleModalOpen}
          id="#modal2-body_new-role--padding"
          key={label.key}
          className={darkMode ? 'text-light dark-mode' : ''}
        >
          <ModalHeader toggle={handleModalOpen} className={darkMode ? 'bg-space-cadet' : ''}>
            Role Operation Info
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>{label.description}</ModalBody>
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
            <Button
              onClick={() =>
                label.key === 'save'
                  ? setShowRoleSaveOperationModal(false)
                  : setShowRoleDelteOperationModal(false)
              }
              color="secondary"
              className="float-left"
            >
              {' '}
              Ok{' '}
            </Button>
          </ModalFooter>
        </Modal>
      ))}
      <Modal
        className={darkMode ? 'dark-mode text-light' : ''}
        isOpen={deleteRoleModal}
        toggle={toggleDeleteRoleModal}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            size="lg"
            className="user-role-tab__icon warning-icon"
          />
          Delete {roleName} Role
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          Are you sure you want to delete <strong>{roleName}</strong> role?
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button onClick={toggleDeleteRoleModal} style={boxStyling}>
            Cancel
          </Button>
          <Button color="danger" onClick={() => deleteRole()} style={boxStyling}>
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
        className={darkMode ? 'dark-mode text-light' : ''}
      >
        <ModalHeader
          className={darkMode ? 'bg-space-cadet' : ''}
          toggle={() => {
            setShowPresetModal(previous => !previous);
          }}
          cssModule={{ 'modal-title': 'w-100 text-center my-auto' }}
        >
          Role Presets
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} id="modal-body_new-role--padding">
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
