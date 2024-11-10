import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import whatever file I need to pull the information of a given role's permissions
import { getPresetsByRole } from '../../../actions/rolePermissionPresets';
import { updateUserProfile } from '../../../actions/userProfile';
import { permissionLabels } from '../../PermissionsManagement/PermissionsConst';
import './PermissionChangeModal.css';
import '../../../App.css';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

function PermissionChangeModal({ 
  userProfile, 
  setUserProfile,
  /* oldUserProfile, */ 
  isOpen, 
  closeModal,
  potentialRole,
  oldRolePermissions,
  currentUserPermissions
}) {
  // Creating a modal that pops up when someone changes a user's role
  // and the user has custom permissions that differ from the permissions
  // of their old role. It should show the difference between the current permissions of the user
  // and the permissions of the new role, and ask the user to confirm which permissions they want
  // to keep.

  // const [oldRolePermissions, setOldRolePermissions] = useState([]);
  const [newRolePermissions, setNewRolePermissions] = useState([]);
  const [checkedAddedPermissions, setCheckedAddedPermissions] = useState({});
  const [checkedRemovedPermissions, setCheckedRemovedPermissions] = useState({});

  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  // create variable for user
  const user = userProfile;
  // create variable for old role
  // const oldRole = oldUserProfile?.role;
  // const oldRole = user.role;
  // create variable for new role
  // const newRole = user.role;
  const newRole = potentialRole;
  // const currentUserPermissions = user.permissions.frontPermissions;

  /* useEffect(() => {
    const fetchOldRolePermissions = async () => {
      if (oldRole) {
        const oldRolePresets = await dispatch(getPresetsByRole(oldRole));
        if (oldRolePresets && oldRolePresets.presets && oldRolePresets.presets[2]) {
          setOldRolePermissions(oldRolePresets.presets[2].permissions);
        }
      }
    };

    fetchOldRolePermissions();
  }, [dispatch, oldRole]); */

  useEffect(() => {
    const fetchNewRolePermissions = async () => {
      if (newRole) {
        const newRolePresets = await dispatch(getPresetsByRole(newRole));
        if (newRolePresets && newRolePresets.presets && newRolePresets.presets[2]) {
          setNewRolePermissions(newRolePresets.presets[2].permissions);
        }
      }
    };

    fetchNewRolePermissions();
  }, [dispatch, newRole]);

  // difference between old role permissions and user permissions
  // permissions that were added to user (user permissions - old role permissions)
  // const customAddedPermissions = currentUserPermissions.filter(permission => !oldRolePermissions.includes(permission));
  const customAddedPermissions = useMemo(() => {
    return currentUserPermissions.filter(permission => !oldRolePermissions.includes(permission));
  }, [currentUserPermissions, oldRolePermissions]);
  // permissions that were removed from user (old role permissions - user permissions)
  // const customRemovedPermissions = oldRolePermissions.filter(permission => !currentUserPermissions.includes(permission));
  const customRemovedPermissions = useMemo(() => {
    return oldRolePermissions.filter(permission => !currentUserPermissions.includes(permission));
  }, [oldRolePermissions, currentUserPermissions]);
  // permissions that were removed from user but are in new role (newRolePermissions - customRemovedPermissions)
  // const newRolePermissionsToAdd = newRolePermissions.filter(permission => customRemovedPermissions.includes(permission));
  const newRolePermissionsToAdd = useMemo(() => {
    return newRolePermissions.filter(permission => customRemovedPermissions.includes(permission));
  }, [newRolePermissions, customRemovedPermissions]);
  // permissions that were added to user but are not in new role (newRolePermissions + customAddedPermissions)
  // const newRolePermissionsToRemove = customAddedPermissions.filter(permission => !newRolePermissions.includes(permission));
  const newRolePermissionsToRemove = useMemo(() => {
    return customAddedPermissions.filter(permission => !newRolePermissions.includes(permission));
  }, [customAddedPermissions, newRolePermissions]);

  /* const formatPermission = permission => {
    let formattedPermission = '';
    for (let i = 0; i < permission.length; i++) {
      if (permission[i] === permission[i].toUpperCase()) {
        formattedPermission += ' ';
      }
      formattedPermission += permission[i];
    }
    return formattedPermission.charAt(0).toUpperCase() + formattedPermission.slice(1);
  }; */

  const formatPermission = permission => {
    // find the permission in the permissionLabels array, then subperms array
    for (let label of permissionLabels) {
      for (let subperm of label.subperms) {
        // if the key matches the permission, return the label
        if (subperm.key === permission) {
          return subperm.label;
        }
      }
    }
    // if the permission is not found in the permissionLabels array, return the permission
    return permission;
  };

  useEffect(() => {
    const initialCheckedAddedPermissions = {};
    const initialCheckedRemovedPermissions = {};
    newRolePermissionsToAdd.forEach(permission => {
      initialCheckedAddedPermissions[permission] = true;
    });
    newRolePermissionsToRemove.forEach(permission => {
      initialCheckedRemovedPermissions[permission] = true;
    });
    setCheckedAddedPermissions(initialCheckedAddedPermissions);
    setCheckedRemovedPermissions(initialCheckedRemovedPermissions);
  }, [newRolePermissionsToAdd, newRolePermissionsToRemove]);

  const togglePermission = (permission, type) => {
    if (type === 'added') {
      setCheckedAddedPermissions(prevState => ({
        ...prevState,
        [permission]: !prevState[permission],
      }));
    } else {
      setCheckedRemovedPermissions(prevState => ({
        ...prevState,
        [permission]: !prevState[permission],
      }));
    }
  };

  const confirmModal = () => {
    setUserProfile({
      ...userProfile,
      role: potentialRole,
      permissions: { ...userProfile.permissions, frontPermissions: [] },
    });
    const updatedProfile = {
      ...userProfile,
      role: potentialRole,
    };
    dispatch(updateUserProfile(updatedProfile));
    closeModal();
  };
  
  /* async function testUser() {
    console.log('user: ', user);
    console.log('user permissions: ', user.permissions);
    const userRolePresets = await dispatch(getPresetsByRole(user.role));
    console.log('user role presets: ', userRolePresets);
  }

  useEffect(() => {
    testUser();
  }, [user]); */

  return (
    <div /* className="modal-content" */>
    <Modal isOpen={isOpen} toggle={closeModal} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={closeModal} className={darkMode ? 'bg-space-cadet' : ''}>
        Change User Role
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
      {/* <div className="modal-body"> */}
        <p>
          You are changing the role of a Special Person with special permissions. This person has
          the following permissions that are different from the {potentialRole} role you are
          changing them to. Please confirm which of these you&apos;d like to keep:
        </p>
        <ul className="list">
          {newRolePermissionsToAdd.map(permission => (
            <li key={permission} className={darkMode ? 'bg-yinmn-blue' : ''}>
              <input 
                type="checkbox" 
                id={permission} 
                name={permission} 
                value={permission}
                checked={!!checkedAddedPermissions[permission]}
                onChange={() => togglePermission(permission, 'added')}
                className="custom-checkbox" 
              />
              <label className={darkMode ? "permission-text-dark-mode permission-text" : "permission-text"} htmlFor={permission}>{formatPermission(permission)}</label> (Added)
            </li>
          ))}
          {newRolePermissionsToRemove.map(permission => (
            <li key={permission} className={darkMode ? 'bg-yinmn-blue' : ''}>
              <input 
                type="checkbox" 
                id={permission} 
                name={permission} 
                value={permission} 
                checked={!!checkedRemovedPermissions[permission]}
                onChange={() => togglePermission(permission, 'removed')}
                className="custom-checkbox"
              />
              <label className={darkMode ? "permission-text-dark-mode permission-text" : "permission-text"} htmlFor={permission}>{formatPermission(permission)}</label> (Removed)
            </li>
          ))}
        </ul>
      {/* </div> */}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        {/* <div className="modal-footer"> */}
          <Button color="secondary" onClick={closeModal}>Cancel</Button>
          {/* <button className="modal-cancel-button" 
          onClick={closeModal} 
          type="button"
          >
            Cancel
          </button> */}
          <Button color="primary" onClick={confirmModal}>Confirm</Button>
          {/* <button className="modal-confirm-button" */} {/* onClick={confirmModal} */} {/* type="submit">
            Confirm
          </button> */}
        {/* </div> */}
        </ModalFooter>
      {/* </div> */}
    </Modal>
    </div>
  );
}

export default PermissionChangeModal;
