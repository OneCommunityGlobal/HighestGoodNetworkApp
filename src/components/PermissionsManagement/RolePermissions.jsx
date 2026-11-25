import { useState, useEffect } from 'react';
import { useSelector, connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { boxStyle, boxStyleDark } from '~/styles';
import { getPresetsByRole, createNewPreset } from '~/actions/rolePermissionPresets';
import PermissionsPresetsModal from './PermissionsPresetsModal';
import { ENDPOINTS } from '~/utils/URL';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';
import { updateRole, getAllRoles } from '../../actions/role';
import { permissions as permissionKeys } from '../../utils/constants';
import hasPermission from '../../utils/permissions';
import PermissionList from './PermissionList';
import permissionLabel from './PermissionsConst';
import styles from './RolePermissions.module.css';

// Starting texts of the two blue icons; once an Owner saves a text, the saved one is shown
const SAVE_INFO = `<p>Here you can create new presets and save your changes.</p>
<ul>
<li><strong>Create New Preset:</strong> Click this button to save the current settings as a new preset that can be accessed with the "Load Presets" button.</li>
<li><strong>Save:</strong> Click this button to save any changes you've made.</li>
</ul>`;

const DELETE_ROLE_INFO = `<p>Here you can load saved presets and delete the current role.</p>
<ul>
<li><strong>Load Presets:</strong> Click this button to see all saved presets for this role. From there, you can choose one to load and replace the current set of permissions. Clicking Apply saves it right away, so you don't need to click Save.</li>
<li><strong>Delete Role:</strong> Click this button to delete the current Role. Everyone on this Role will become a Volunteer. <strong>WARNING: This action cannot be undone.</strong></li>
</ul>`;

function RolePermissions(props) {
  const { darkMode } = props;

  const [permissions, setPermissions] = useState(props.permissions);
  const [deleteRoleModal, setDeleteRoleModal] = useState(false);
  const [editRoleNameModal, setEditRoleNameModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [changed, setChanged] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [showPresetModal, setShowPresetModal] = useState(false);

  const history = useHistory();
  const userProfile = useSelector(state => state.userProfile);

  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  const toggleDeleteRoleModal = () => setDeleteRoleModal(prev => !prev);
  const toggleEditRoleNameModal = () => setEditRoleNameModal(prev => !prev);

  const isEditableRole =
    props.role === 'Owner'
      ? props.hasPermission(permissionKeys.addDeleteEditOwners)
      : props.auth.user.role !== props.role;

  const canEditRole = isEditableRole && props.hasPermission(permissionKeys.putRole);
  const canDeleteRole = isEditableRole && props.hasPermission(permissionKeys.deleteRole);

  useEffect(() => {
    setRoleName(props.role);
    props.getPresets(props.role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPermissions(props.permissions);
  }, [props.roles, props.permissions]);

  useEffect(() => {
    setDisabled(roleName === props.role);
  }, [roleName, props.role]);

  const handleChangeRoleName = e => setRoleName(e.target.value);

  const handleSaveNewPreset = async () => {
    let count = 1;
    while (props.presets.some(preset => preset.presetName === `New Preset ${count}`)) count += 1;

    const newPreset = {
      presetName: `New Preset ${count}`,
      roleName: props.role,
      permissions,
    };

    const status = await props.createNewPreset(newPreset);
    if (status === 0) toast.success('Preset created successfully');
    else toast.error('Error creating preset');
  };

  const updateInfo = async () => {
    const id = props.roleId;

    const updatedRole = { roleName, permissions, roleId: id };

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
      // ignore
    }
  };

  return (
    <div className={styles.wrapper}>
      {changed && (
        <Alert color="warning" className={styles.unsavedAlert}>
          You have unsaved changes! Please click <strong>Save</strong> button to save changes!
        </Alert>
      )}

      <header className={styles.header}>
        <div className={styles.nameContainer}>
          <div className={styles.titleRow}>
            <h1 className={styles.title} style={darkMode ? { color: '#fff' } : undefined}>
              Role Name: {roleName}
            </h1>

            {canEditRole && (
              <button
                type="button"
                className={styles.editIconBtn}
                onClick={toggleEditRoleNameModal}
                aria-label="Edit role name"
                data-testid="edit-role-icon"
              >
                <FontAwesomeIcon icon={faEdit} size="lg" />
              </button>
            )}
          </div>

          {canEditRole && (
            <div className={styles.actionsRow}>
              <div className={styles.actions}>
                <Button
                  className={styles.actionBtn}
                  color="success"
                  onClick={handleSaveNewPreset}
                  style={boxStyling}
                >
                  Create New Preset
                </Button>

                <Button
                  className={styles.actionBtn}
                  color="primary"
                  onClick={() => setShowPresetModal(true)}
                  style={boxStyling}
                >
                  Load Presets
                </Button>

                <div className={styles.btnWithInfo}>
                  <Button
                    className={styles.actionBtn}
                    color="success"
                    onClick={updateInfo}
                    style={boxStyling}
                  >
                    Save
                  </Button>

                  {/* role = the signed-in person, not the role on this page. The PermissionList
                      below fetches the texts once */}
                  <EditableInfoModal
                    role={props.auth.user.role}
                    areaName="Permission Page: save Info"
                    areaTitle="Save and Presets"
                    initialInfoHtml={SAVE_INFO}
                    skipFetch
                    fontSize={18}
                    darkMode={darkMode}
                  />
                </div>

                <div className={`${styles.btnWithInfo} ${styles.dangerGroup}`}>
                  <Button
                    className={styles.actionBtn}
                    color="danger"
                    onClick={toggleDeleteRoleModal}
                    style={boxStyling}
                    disabled={!canDeleteRole}
                  >
                    Delete Role
                  </Button>

                  <EditableInfoModal
                    role={props.auth.user.role}
                    areaName="Permission Page: delete role Info"
                    areaTitle="Load Presets and Delete Role"
                    initialInfoHtml={DELETE_ROLE_INFO}
                    skipFetch
                    fontSize={18}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Edit Role Name Modal */}
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

        <h2 className={styles.permissionListTitle}>Permission List</h2>
      </header>

      <div className={styles.permissionList}>
        <PermissionList
          rolePermissions={permissions}
          permissionsList={permissionLabel}
          editable={canEditRole}
          setPermissions={setPermissions}
          onChange={() => setChanged(true)}
          darkMode={darkMode}
        />
      </div>

      {/* Delete Role Modal */}
      <Modal
        className={darkMode ? 'dark-mode text-light' : ''}
        isOpen={deleteRoleModal}
        toggle={toggleDeleteRoleModal}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>
          <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className={styles.warningIcon} />
          <span className={styles.deleteTitle}>Delete {roleName} Role</span>
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          Are you sure you want to delete <strong>{roleName}</strong> role?
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button onClick={toggleDeleteRoleModal} style={boxStyling}>
            Cancel
          </Button>
          <Button color="danger" onClick={deleteRole} style={boxStyling}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Presets Modal */}
      <Modal
        isOpen={showPresetModal}
        toggle={() => setShowPresetModal(prev => !prev)}
        id="modal-content__new-role"
        className={darkMode ? 'dark-mode text-light' : ''}
      >
        <ModalHeader
          className={darkMode ? 'bg-space-cadet' : ''}
          toggle={() => setShowPresetModal(prev => !prev)}
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
    </div>
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
