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
import { updateRole, getAllRoles } from '../../actions/role';
import PermissionList from './PermissionList';
import permissionLabel from './PermissionsConst';
import hasPermission from '../../utils/permissions';
import styles from './RolePermissions.module.css';
// import { roleOperationLabels } from './PermissionsConst';

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

  const userProfile = useSelector(state => state.userProfile);

  const [infoRoleModal, setinfoRoleModal] = useState(false);
  const [modalContent, setContent] = useState(null);

  const handleModalOpen = description => {
    let content = '';
    if (description === 'save') {
      content = (
        <div className={styles['modal-info-content']}>
          <p>Here you can create new presets and save your changes</p>
          <ul>
            <li>
              {' '}
              <b> Create New Presets: </b> Click this button to save the current settings as a new
              preset that can be accessed with the “Load Presets” button.{' '}
            </li>
            <li>
              {' '}
              <b> Save: </b> Click this button to save any changes you’ve made.{' '}
            </li>
          </ul>
        </div>
      );
    } else if (description === 'delete') {
      content = (
        <div className={styles['modal-info-content']}>
          <p>Here you can load saved presets and delete the current role.</p>
          <ul>
            <li>
              <b>Load Presets:</b> Click this button to see all previously saved presets. From
              there, you can choose one to load and replace the current set of permissions. Remember
              to “Save” if you do this.
            </li>
            <li>
              <b>Delete Role:</b> Click this button to delete the current Role.{' '}
              <b>WARNING: This action cannot be undone.</b>
            </li>
          </ul>
        </div>
      );
    }
    setContent(content);
    setinfoRoleModal(true);
  };

  const toggleInfoRoleModal = () => {
    setinfoRoleModal(!infoRoleModal);
  };

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

  // const handleModalOpen = value => {
  //   if (value === 'save') {
  //     setShowRoleSaveOperationModal(true);
  //   } else if (value === 'delete') {
  //     setShowRoleDelteOperationModal(true);
  //   } else {
  //     setShowRoleSaveOperationModal(false);
  //     setShowRoleDelteOperationModal(false);
  //   }
  // };

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
        <Alert color="warning" className={styles['user-role-tab__alert']}>
          You have unsaved changes! Please click <strong>Save</strong> button to save changes!
        </Alert>
      ) : null}
      <header>
        <div className={styles['user-role-tab__name-container']}>
          <div className={styles['name-container__role-name']}>
            <h1 className={styles['user-role-tab__h1']} style={darkMode ? { color: '#fff' } : {}}>
              {' '}
              Role Name: {roleName}
            </h1>
            {canEditRole && (
              <FontAwesomeIcon
                icon={faEdit}
                size="lg"
                className={`${styles['user-role-tab__icon']} ${styles['edit-icon']} ${
                  darkMode ? styles['text-light'] : ''
                }`}
                data-testid="edit-role-icon"
                onClick={toggleEditRoleNameModal}
              />
            )}
          </div>
          {canEditRole && (
            <div style={{ flexDirection: 'row', display: 'flex' }}>
              <div className={styles['name-container__btn_columns']}>
                <div className={styles['name-container__btns']}>
                  <Button
                    className={`${styles['btn_save']} ${styles['responsive-font-size']}`}
                    color="success"
                    onClick={handleSaveNewPreset}
                    style={boxStyling}
                  >
                    Create New Preset
                  </Button>
                  <div>
                    <Button
                      className={`${styles['btn_save']} ${styles['responsive-font-size']} ${styles['mr-2']}`}
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
                </div>
                <div className={styles['name-container__btns']}>
                  <Button
                    className={`${styles['responsive-font-size']} ${styles['btn_save']}`}
                    color="primary"
                    onClick={() => {
                      setShowPresetModal(!showPresetModal);
                    }}
                    style={boxStyling}
                  >
                    Load Presets
                  </Button>
                  <div>
                    <Button
                      className={`${styles['responsive-font-size']} ${styles['btn_save']} ${styles['mr-2']}`}
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
            className={darkMode ? styles['dark-mode'] : styles['text-light']}
            isOpen={editRoleNameModal}
            toggle={toggleEditRoleNameModal}
          >
            <ModalHeader className={darkMode ? styles['bg-space-cadet'] : ''}>
              Edit Role Name
            </ModalHeader>
            <ModalBody className={darkMode ? styles['bg-yinmn-blue'] : ''}>
              <label htmlFor="editRoleName" className={darkMode ? styles['text-light'] : ''}>
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
        <h2 className={styles['user-role-tab__h2']}>Permission List</h2>
      </header>
      <ul className={styles['user-role-tab__permissionList']}>
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

      <Modal
        className={darkMode ? 'dark-mode text-light' : ''}
        isOpen={deleteRoleModal}
        toggle={toggleDeleteRoleModal}
      >
        <ModalHeader className={darkMode ? styles['bg-space-cadet'] : ''}>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            size="lg"
            className={`${styles['user-role-tab__icon']} ${styles['warning-icon']}`}
          />
          Delete {roleName} Role
        </ModalHeader>
        <ModalBody className={darkMode ? styles['bg-yinmn-blue'] : ''}>
          Are you sure you want to delete <strong>{roleName}</strong> role?
        </ModalBody>
        <ModalFooter className={darkMode ? styles['bg-yinmn-blue'] : ''}>
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
        className={darkMode ? `${styles['dark-mode']} ${styles['text-light']}` : ''}
      >
        <ModalHeader
          className={darkMode ? styles['bg-space-cadet'] : ''}
          toggle={() => {
            setShowPresetModal(previous => !previous);
          }}
          cssModule={{ 'modal-title': 'w-100 text-center my-auto' }}
        >
          Role Presets
        </ModalHeader>
        <ModalBody
          className={darkMode ? styles['bg-yinmn-blue'] : ''}
          id="modal-body_new-role--padding"
        >
          <PermissionsPresetsModal
            roleId={props.roleId}
            roleName={props.role}
            onApply={perms => setPermissions(perms)}
          />
        </ModalBody>
      </Modal>
      <Modal
        isOpen={infoRoleModal}
        toggle={toggleInfoRoleModal}
        id="#modal2-body_new-role--padding"
        className={darkMode ? `${styles['text-light']} ${styles['dark-mode']}` : ''}
      >
        <ModalHeader toggle={toggleInfoRoleModal}>Role Info</ModalHeader>
        <ModalBody>{modalContent}</ModalBody>
        <ModalFooter>
          <Button onClick={toggleInfoRoleModal} color="secondary" className={styles['float-left']}>
            {' '}
            Ok{' '}
          </Button>
        </ModalFooter>
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
