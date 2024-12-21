import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfileProperty } from '../../../actions/userProfile';
import { permissionLabels } from '../../PermissionsManagement/PermissionsConst';
import './PermissionChangeModal.css';
import '../../../App.css';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { toast } from 'react-toastify';

function PermissionChangeModal({ 
  userProfile, 
  setUserProfile, 
  isOpen, 
  closeModal,
  newRole,
  oldRolePermissions,
  newRolePermissions,
  currentUserPermissions,
  setCurrentUserPermissions,
  permissionLabelPermissions,
  permissionPresets,
  newRolePermissionsToAdd,
  newRolePermissionsToRemove,
  setOldRole,
  getCurrentUserPermissions
}) {
  // Creating a modal that pops up when someone changes a user's role
  // and the user has custom permissions that differ from the permissions
  // of their old role. It should show the difference between the current permissions of the user
  // and the permissions of the new role, and ask the user to confirm which permissions they want
  // to keep.

  const [checkedAddedPermissions, setCheckedAddedPermissions] = useState({});
  const [checkedRemovedPermissions, setCheckedRemovedPermissions] = useState({});

  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const formatPermission = permission => {
    // find the permission in the permissionLabels array, then subperms array
    const findPermissionLabel = (perms) => {
      for (let perm of perms) {
        if (perm.key === permission) {
          return perm.label;
        }
        if (perm.subperms) {
          const label = findPermissionLabel(perm.subperms);
          if (label) {
            return label;
          }
        }
      }
      return null;
    };
  
    const label = findPermissionLabel(permissionLabels);
    return label || permission;
  };

  useEffect(() => {
    if (isOpen) {
      const initialCheckedAddedPermissions = {};
      const initialCheckedRemovedPermissions = {};

      newRolePermissionsToAdd.forEach(permission => {
        initialCheckedRemovedPermissions[permission] = true;
      });
      newRolePermissionsToRemove.forEach(permission => {
        initialCheckedAddedPermissions[permission] = true;
      });
      setCheckedRemovedPermissions(initialCheckedRemovedPermissions);
      setCheckedAddedPermissions(initialCheckedAddedPermissions);
    }
    // console.log('checkedAddedPermissions:', checkedAddedPermissions);
    // console.log('checkedRemovedPermissions:', checkedRemovedPermissions);
  }, [isOpen, newRolePermissionsToAdd, newRolePermissionsToRemove]);

  const togglePermission = useCallback((permission, type) => {
    if (type === 'added') {
      setCheckedAddedPermissions(prevState => {
        const newState = {
          ...prevState,
          [permission]: !prevState[permission],
        };
        console.log('Updated checkedAddedPermissions:', newState);
        return newState;
      });
    } else {
      setCheckedRemovedPermissions(prevState => {
        const newState = {
          ...prevState,
          [permission]: !prevState[permission],
        };
        console.log('Updated checkedRemovedPermissions:', newState);
        return newState;
      });
    }
  }, []);

  useEffect(() => {
    console.log('checkedAddedPermissions:', checkedAddedPermissions);
  }, [checkedAddedPermissions]);

  useEffect(() => {
    console.log('checkedRemovedPermissions:', checkedRemovedPermissions);
  }, [checkedRemovedPermissions]);

  const confirmModal = async () => {
    try {
      const updatedPermissions = [
        // filter newRolePermissions to remove checkedRemovedPermissions permissions that have the value false
        ...newRolePermissions.filter(permission => !checkedRemovedPermissions[permission]),
        // ...newRolePermissionsToRemove.filter(permission => checkedAddedPermissions[permission])
        ...Object.keys(checkedAddedPermissions).filter(permission => checkedAddedPermissions[permission])
      ];
      
      const response = await dispatch(updateUserProfileProperty(userProfile, 'role', newRole));

      if (response === 200) {        
        setUserProfile({ 
          ...userProfile, 
          role: newRole,
          permissions: {
            ...userProfile.permissions,
            // frontPermissions: [
              // for each added permission, add it to the user's permissions if it's checked
              // for each removed permission, remove it from the user's permissions if it has an x mark
            // ]
            frontPermissions: updatedPermissions
          }
        });
        // not sure what happened here...this line should have always been here but i just had to re-add it...
        setOldRole(newRole);
        toast.success('User role successfully updated');
        closeModal();
      }

      // Update currentUserPermissions after role change
      /* const updatedCurrentPermissions = await getCurrentUserPermissions(permissionLabels);
      setCurrentUserPermissions(updatedCurrentPermissions); */
      setCurrentUserPermissions(updatedPermissions);
      console.log('Updated permissions:', updatedPermissions);
      console.log('Updated currentUserPermissions:', currentUserPermissions);

    } catch (error) {
      console.error('Error updating user role: ', error);
      toast.error('Error updating user role');
    }
  };

  return (
    <div>
    <Modal isOpen={isOpen} toggle={closeModal} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={closeModal} className={darkMode ? 'bg-space-cadet' : ''}>
        Change User Role
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p>
          You are changing the role of a Special Person with special permissions. This person has
          the following permissions that are different from the {newRole} role you are
          changing them to. Please confirm which of these you&apos;d like to keep:
        </p>
        <ul className="list">
          {newRolePermissionsToRemove.map(permission => (
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
          {newRolePermissionsToAdd.map(permission => (
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
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="secondary" onClick={closeModal}>Cancel</Button>
          <Button color="primary" onClick={confirmModal}>Confirm</Button>
        </ModalFooter>
    </Modal>
    </div>
  );
}

export default React.memo(PermissionChangeModal);
