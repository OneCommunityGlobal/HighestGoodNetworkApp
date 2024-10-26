import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
// import whatever file I need to pull the information of a given role's permissions
import { getPresetsByRole } from '../../../actions/rolePermissionPresets';

function PermissionChangeModal({ userProfile, oldUserProfile }) {
  // Creating a modal that pops up when someone changes a user's role
  // and the user has custom permissions that differ from the permissions
  // of their old role. It should show the difference between the current permissions of the user
  // and the permissions of the new role, and ask the user to confirm which permissions they want
  // to keep.

  const dispatch = useDispatch();
  const [oldRolePermissions, setOldRolePermissions] = useState([]);
  const [newRolePermissions, setNewRolePermissions] = useState([]);

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

    const fetchNewRolePermissions = async () => {
      if (newRole) {
        const newRolePresets = await dispatch(getPresetsByRole(newRole));
        if (newRolePresets && newRolePresets.presets && newRolePresets.presets[2]) {
          setNewRolePermissions(newRolePresets.presets[2].permissions);
        }
      }
    };

    fetchOldRolePermissions();
    fetchNewRolePermissions();
  }, [dispatch, oldRole, newRole]);

  // difference between old role permissions and user permissions
  // permissions that were added to user (user permissions - old role permissions)
  const customAddedPermissions = currentUserPermissions.filter(permission => !oldRolePermissions.includes(permission));
  // permissions that were removed from user (old role permissions - user permissions)
  const customRemovedPermissions = oldRolePermissions.filter(permission => !currentUserPermissions.includes(permission));
  // permissions that were removed from user but are in new role (newRolePermissions - customRemovedPermissions)
  const newRolePermissionsToAdd = newRolePermissions.filter(permission => customRemovedPermissions.includes(permission));
  // permissions that were added to user but are not in new role (newRolePermissions + customAddedPermissions)
  const newRolePermissionsToRemove = customAddedPermissions.filter(permission => !newRolePermissions.includes(permission));

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
  
  async function testUser() {
    console.log('user: ', user);
    console.log('user permissions: ', user.permissions);
    const userRolePresets = await dispatch(getPresetsByRole(user.role));
    console.log('user role presets: ', userRolePresets);
  }

  useEffect(() => {
    testUser();
  }, [user]);

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="modal-title">Change User Role</h2>
        <button className="close-button" /* onClick={closeModal} */ type="button">
          &times;
        </button>
      </div>
      <div className="modal-body">
        <p>
          You are changing the role of a Special Person with special permissions. This person has
          the following permissions that are different from the {/* {rolename} */} role you are
          changing them to. Please confirm which of these you&apos;d like to keep:
        </p>
        <ul>
          {newRolePermissionsToAdd.map(permission => (
            <li key={permission}>
              <input type="checkbox" id={permission} name={permission} value={permission} />
              <label htmlFor={permission}>{formatPermission(permission)}</label> (Added)
            </li>
          ))}
          {newRolePermissionsToRemove.map(permission => (
            <li key={permission}>
              <input type="checkbox" id={permission} name={permission} value={permission} />
              <label htmlFor={permission}>{formatPermission(permission)}</label> (Removed)
            </li>
          ))}
        </ul>
        <div className="modal-footer">
          <button className="cancel-button" 
          /* onClick={closeModal} */ 
          /* onClick={testUser}  */
          type="button"
          >
            Cancel
          </button>
          <button className="confirm-button" /* onClick={confirmModal} */ type="submit">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default PermissionChangeModal;
