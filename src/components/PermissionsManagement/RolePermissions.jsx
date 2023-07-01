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
    'See Weekly Summary Reports Tab' : 'Make the "Other Links" -> "Reports" button appear/accessible.',
    'See User Management Tab (delete and update users)' : 'Make the "Other Links" -> "User Management" button appear/accessible and be able to create, delete, and update users.',
    'See Badge Management Tab (create badges)' : 'Make the "Other Links" -> "Badge Management" button appear and then have the ability to create, delete, and update badges. ',
    'Delete Badge': 'Gives the user permission to delete a badge on "Other Links" -> "Badge Management"',
    'Modify Badge Amount' : 'Gives the user permission to decrease the count of a badge on the Badge Reports Component',
    'Assign Badges' : 'Gives the user permission to assign badges to others users "User Profile" -> "Assign Badges"',
    'See Popup Management Tab (create and update popups)' : 'Make the "Other Links" -> "Popup Management" button appear and be able to create and update popups.',
    'See Project Management Tab' : 'Make the "Other Links" -> "Projects" button appear and be able to create or delete new projects, edit projects names, add members to projects, upload/import/create new WBSs, etc.',
    'Delete WBS' : 'Gives the user permission to delete any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Minus Red Icon"',
    'Add Task': 'Gives the user permission to add a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Add task button"',
    'Delete Task' : 'Gives the user permission to delete a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Remove"',
    'Edit Task': 'Gives the user permission to edit a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Edit"',
    'Suggest Changes on a task': 'Gives the user permission to suggest changes on a task. "Dashboard" -> "Tasks tab" -> "Click on any task" -> "Suggest button"',
    'Add WBS': 'Gives the user permission to create a new WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Add new WBS Input"',
    'Add Project' : 'Gives the user permission to create any Project. "Other Links" -> "Projects" -> "Add new Project Input"',
    'Delete Project' : 'Gives the user permission to delete any Project. "Other Links" -> "Projects" -> "Delete button" ',
    'Edit Project': 'Gives the user permission to edit the category or the status of any Project. "Other Links" -> "Projects"',
    'Find User in Project' : 'Gives the user permission to find any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Find user input"',
    'Assign User in Project' : 'Gives the user permission to add any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Find user input"',
    'Unassign User in Project' : 'Gives the user permission to remove any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Minus button"',
    'See Teams Management Tab' : 'Make the "Other Links" -> "Teams" button appear and be able to add/delete teams, edit team names, and add/delete members.',
    'Edit/Delete Team' : 'Gives the user permission to Edit or delete a team.',
    'Create Team' : 'Gives the user permission to create a team.',
    'Assign Team to User' : 'Gives the user permission to add any user on any team. "Other Links" -> "Teams" -> "Members" -> "Add Input"',
    'Edit Timelog Information' : 'Gives the user permission to edit any time log entry.',
    'Add Time Entry (Others)' : 'Gives the user permission to add Intangible time entry to others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Add Time entry to (Name of the user) yellow button"',
    'Delete Time Entry (Others)' : 'Gives the user permission to Delete time entry from others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Current Time Log" -> "Trash button on bottom right"',
    'Toggle Tangible Time' : 'Gives the user permission to toggle the Tanglible check when editing a Time entry.',
    'Change Date on Intangible Time Entry' : 'Gives the user permission to edit the date when adding an intangible time entry.',
    'Edit Time Entry' : 'Gives the user permission to edit any time entry on their own time logs tab "Dashboard" -> "Current Time Log" -> "Pencil Icon"',
    'Delete Time Entry' : 'Gives the user permission to delete any time entry on their own time logs tab "Dashboard" -> "Current Time Log" -> "Trash Icon"',
    'Change User Status' : 'Gives the user permission to change the status of any user on the user profile page or User Management Page. "User Profile" -> "Green round button"',
    'Manage Admin Links in User Profile' : 'Gives the user permission to edit the links of any user on the user profile page. "User Profile" -> "Links button"',
    'Edit User Profile' : 'Gives the user permission to edit the information of any user on the user profile page.',
    'See User Profiles in Projects' : 'Gives the user permission to access the profile of an user directly from the projects members page. "Other Links" -> "Projects" -> "Members" -> "Name of any member"',
    'Reset Password (Others)' : 'Gives the user permission to Reset the password of any user.',
    'Timelog Data is Tangible' : 'Gives the user permission to toggle the tanglible check when editing a Time entry of another user.',
    'Toggle Summary Submit Form (Others)' : 'Gives the user permission to change the requirement to the user to submit a summary.',
    'Handle Blue Squares' : 'Gives the user permission to Update/Delete/Edit any blue square.',
    'Only Assign Blue Squares' : 'Gives the user permission to add blue squares to any user.',
    'See Permissions Management Tab' : 'Gives the user permission to access the Permissions Management tab.',
    'Submit Weekly Summary For Others' : 'Gives the user permission to submit weekly summary for another user',
    'Change the Bio Announcement Status' : 'GIves the user permission to change the annoucement status'
  }

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
        {props.permissionsList.map(permission => (
          <li className="user-role-tab__permissions" key={permission}>
            <p style={{ color: permissions.includes(permission) ? 'green' : 'red' }}>
              {permission}
            </p>
            {permissions.includes(permission) ? (
              <div>
                <i
                  data-toggle="tooltip"
                  data-placement="center"
                  title="Click for more information"
                  style={{ fontSize: 24, cursor: 'pointer' }}
                  aria-hidden="true"
                  className="fa fa-info-circle"
                  onClick={() => {
                    handleModalOpen(permission);
                  }}
                /> &nbsp;&nbsp;
                <Button
                  color="danger"
                  onClick={() => {
                    onRemovePermission(permission), setChanged(true);
                  }}
                  disabled={props?.userRole !== 'Owner' ? true : false}
                  style={boxStyle}
                >
                  Delete
                </Button>
              </div>
            ) : (
              <div>
                <i
                  data-toggle="tooltip"
                  data-placement="center"
                  title="Click for more information"
                  style={{ fontSize: 24, cursor: 'pointer' }}
                  aria-hidden="true"
                  className="fa fa-info-circle"
                  onClick={() => {
                    handleModalOpen(permission);
                  }} 
                /> &nbsp;&nbsp;
                <Button
                  color="success"
                  onClick={() => {
                    onAddPermission(permission), setChanged(true);
                  }}
                  disabled={props?.userRole !== 'Owner' ? true : false}
                  style={boxStyle}
                >
                  Add
                </Button>
              </div>
            )}
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
          <Button onClick={toggleDeleteRoleModal} style={boxStyle}>Cancel</Button>
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
