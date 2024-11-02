import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
// import whatever file I need to pull the information of a given role's permissions
import { getPresetsByRole } from '../../../actions/rolePermissionPresets';
import './PermissionChangeModal.css';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

function PermissionChangeModal({ 
  userProfile, 
  oldUserProfile, 
  isOpen, 
  closeModal 
}) {
  // Creating a modal that pops up when someone changes a user's role
  // and the user has custom permissions that differ from the permissions
  // of their old role. It should show the difference between the current permissions of the user
  // and the permissions of the new role, and ask the user to confirm which permissions they want
  // to keep.

  const dispatch = useDispatch();
  const [oldRolePermissions, setOldRolePermissions] = useState([]);
  const [newRolePermissions, setNewRolePermissions] = useState([]);
  const [checkedAddedPermissions, setCheckedAddedPermissions] = useState({});
  const [checkedRemovedPermissions, setCheckedRemovedPermissions] = useState({});

  const openPermissionModal = () => setPermissionModalOpen(true);
  const closePermissionModal = () => setPermissionModalOpen(false);
  // create variable for user
  const user = userProfile;
  // create variable for old role
  const oldRole = oldUserProfile?.role;
  // create variable for new role
  const newRole = user.role;
  const currentUserPermissions =  user.permissions.frontPermissions;

  useEffect(() => {
    const fetchOldRolePermissions = async () => {
      if (oldRole) {
        const oldRolePresets = await dispatch(getPresetsByRole(oldRole));
        if (oldRolePresets && oldRolePresets.presets && oldRolePresets.presets[2]) {
          setOldRolePermissions(oldRolePresets.presets[2].permissions);
        }
      }
    };

    fetchOldRolePermissions();
  }, [dispatch, oldRole]);

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

  const formatPermission = permission => {
    let formattedPermission = '';
    for (let i = 0; i < permission.length; i++) {
      if (permission[i] === permission[i].toUpperCase()) {
        formattedPermission += ' ';
      }
      formattedPermission += permission[i];
    }
    return formattedPermission.charAt(0).toUpperCase() + formattedPermission.slice(1);
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
    <div className="modal-content">
    <Modal isOpen={isOpen} toggle={closeModal}>
      <ModalHeader toggle={closeModal}>Change User Role</ModalHeader>
      <ModalBody>
      {/* <div className="modal-body"> */}
        <p>
          You are changing the role of a Special Person with special permissions. This person has
          the following permissions that are different from the {newRole} role you are
          changing them to. Please confirm which of these you&apos;d like to keep:
        </p>
        <ul className="list">
          {newRolePermissionsToAdd.map(permission => (
            <li key={permission}>
              <input 
                type="checkbox" 
                id={permission} 
                name={permission} 
                value={permission}
                checked={!!checkedAddedPermissions[permission]}
                onChange={() => togglePermission(permission, 'added')}
                className="custom-checkbox" 
              />
              <label className="permission-text" htmlFor={permission}>{formatPermission(permission)}</label> (Added)
            </li>
          ))}
          {newRolePermissionsToRemove.map(permission => (
            <li key={permission}>
              <input 
                type="checkbox" 
                id={permission} 
                name={permission} 
                value={permission} 
                checked={!!checkedRemovedPermissions[permission]}
                onChange={() => togglePermission(permission, 'removed')}
                className="custom-checkbox"
              />
              <label className="permission-text" htmlFor={permission}>{formatPermission(permission)}</label> (Removed)
            </li>
          ))}
        </ul>
      {/* </div> */}
        </ModalBody>
        <ModalFooter>
        {/* <div className="modal-footer"> */}
          <button className="modal-cancel-button" 
          /* onClick={closeModal} */ 
          /* onClick={testUser}  */
          type="button"
          >
            Cancel
          </button>
          <button className="modal-confirm-button" /* onClick={confirmModal} */ type="submit">
            Confirm
          </button>
        {/* </div> */}
        </ModalFooter>
      {/* </div> */}
    </Modal>
    </div>
  );
}

export default PermissionChangeModal;
