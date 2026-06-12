import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Input } from 'reactstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
// import PermissionList from '~/components/PermissionsManagement/PermissionList';
import { boxStyle, boxStyleDark } from '~/styles';
// import permissions from '../PermissionsManagement/Permissions.json';
import { permissionLabelKeyMappingObj } from '../PermissionsManagement/PermissionsConst';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';

/**
 * RoleChangePermissionsModal
 * - Allows admins to switch a user's role and adjust custom permission overrides in one flow
 */
export default function RoleChangePermissionsModal({
  isOpen,
  onClose,
  roles = [],
  userProfile,
  loadUserProfile,
  authUser
}) {

  const darkMode = useSelector(state => state.theme.darkMode);

  const roleNameToDefaults = useMemo(() => {
    const map = {};
    roles.forEach(r => {
      map[r.roleName] = r.permissions || [];
    });
    return map;
  }, [roles]);

  const initialSelectedRole = userProfile?.role || '';
  const initialCustomPerms = userProfile?.permissions?.frontPermissions || [];
  const initialRemovedDefaults = userProfile?.permissions?.removedDefaultPermissions || [];

  const [selectedRole, setSelectedRole] = useState(initialSelectedRole);
  const [userCustomPermissions, setUserCustomPermissions] = useState(initialCustomPerms);
  const [removedDefaultsByRole, setRemovedDefaultsByRole] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedRole(initialSelectedRole);
    setUserCustomPermissions(initialCustomPerms);
    setRemovedDefaultsByRole(prev => ({
      ...prev,
      [initialSelectedRole]: initialRemovedDefaults,
    }));
  }, [isOpen]);

  // function buildPermissionMap(permissions, map = {}) {
  //   for(const permission of permissions) {
  //     if(permission.key) {
  //       map[permission.key] = permission.label;
  //     }

  //     if(permission.subperms) {
  //       buildPermissionMap(permission.subperms, map);
  //     }
  //   }

  //   return map
  // }

  const getRemovedDefaults = roleName => removedDefaultsByRole[roleName] || initialRemovedDefaults;
  // const setRemovedDefaultsForRole = roleName => updater => {
  //   setRemovedDefaultsByRole(current => {
  //     const currentList = current[roleName] || initialRemovedDefaults;
  //     const nextList = typeof updater === 'function' ? updater(currentList) : updater;
  //     return { ...current, [roleName]: nextList };
  //   });
  // };
  const [keptFrontPermissions, setKeptFrontPermissions] = useState([]);
  const [keptRemovedPermissions, setKeptRemovedPermissions] = useState([]);

  const checked = (permissions, permission) => {
    permissions(permissionArray => 
      permissionArray.includes(permission)
        ? permissionArray.filter(perm => perm !== permission)
        : [...permissionArray, permission]
    );
  }

  const handleConfirm = async () => {
    try {
      setSaving(true);
      const userId = userProfile?._id;
      if (!userId) {
        toast.error('Missing user id');
        setSaving(false);
        return;
      }

      // Build updated profile payload
      const updated = {
        ...userProfile,
        role: selectedRole,
        permissions: {
          frontPermissions: keptFrontPermissions,
          removedDefaultPermissions: keptRemovedPermissions,
          defaultPermissions: roleNameToDefaults[selectedRole],
        },
      };

      const url = ENDPOINTS.USER_PROFILE(userId);
      await axios.put(url, updated);

      const permissionURL = `${ENDPOINTS.PERMISSION_MANAGEMENT_UPDATE()}/user/${userId}`;
      const requestor = authUser;

      // Ensures a change log with reason and user's modified permissions when their role is changed
      const permissionData = {
        reason: `Role Changed to **${selectedRole}**.`,
        permissions: updated.permissions,
        requestor: requestor,
      };

      await axios.patch(permissionURL, permissionData)

      loadUserProfile();
      toast.success('Role and permissions updated');
      onClose();
    } catch (err) {
      toast.error(`Failed to update role/permissions${err?.response?.data ? `: ${err.response.data}` : ''}`);
    } finally {
      setSaving(false);
    }
  };

  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  const updateSelectedRole = (newRole) => {
    const selectedRole2 = roles.filter(r => r.roleName === newRole)[0]
    if(!selectedRole2) return
    const roleDefaults = roleNameToDefaults[newRole] || [];

    setSelectedRole(newRole);
    setKeptFrontPermissions(keptFrontPermissions.filter(perm => roleDefaults.includes(perm)));
    setKeptRemovedPermissions(keptRemovedPermissions.filter(perm => !roleDefaults.includes(perm)));
  }

  const selectedRoleToDisplay = () => {
    const selectedRole2 = roles.filter(r => r.roleName === selectedRole)[0]
    if(!selectedRole2) return
    const roleDefaults = roleNameToDefaults[selectedRole2.roleName] || [];
    const removedDefaults = getRemovedDefaults(selectedRole2.roleName)
    return (
      <div key={selectedRole2.roleName} style={{ border: '1px solid #ccc', borderRadius: 4, marginBottom: 8 }}>
        <div style={{ padding: '8px 12px' }}>
          {userProfile?.role === selectedRole && <h4>User&apos;s Current Role</h4>}
          {userProfile?.role !== selectedRole && <h5>Changing User&apos;s Role from {userProfile?.role} to {selectedRole}</h5>}
          <div style={{ display: 'flex' }}>
            <div style={{padding: '10px 0'}}>
              These permissions were modified and do not match the new role&apos;s. 
              Which of these permissions do you wish to keep?
            </div>
          </div>
          {userCustomPermissions
            .filter(perms => {
              return !roleDefaults.includes(perms)
            }).length > 0
            && <h4>Added Permissions:</h4>}
          {userCustomPermissions
            .filter(perms => {
              return !roleDefaults.includes(perms)
            })
            .map(perm => {
              return(
                <p key={perm} style={{marginLeft: '16px'}}>
                <input 
                  type='checkbox' 
                  checked={keptFrontPermissions.includes(perm)} 
                  onChange={() => checked(setKeptFrontPermissions, perm)}
                ></input> {permissionLabelKeyMappingObj?.[perm]}
                </p>
              );
          })}
          {removedDefaults
            .filter(perms => {
              return roleDefaults.includes(perms)
            }).length > 0 
            && <h4>Removed Permissions:</h4>}
          {removedDefaults
            .filter(perms => {
              return roleDefaults.includes(perms)
            })
            .map(perm => {
              return(
                <p key={perm} style={{marginLeft: '16px'}}>
                <input 
                  type='checkbox' 
                  checked={keptRemovedPermissions.includes(perm)} 
                  onChange={() => checked(setKeptRemovedPermissions, perm)}
                ></input> {permissionLabelKeyMappingObj?.[perm]}
                </p>
              );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} toggle={onClose} className={darkMode ? 'dark-mode text-light' : ''} size="lg">
        <ModalHeader toggle={onClose} style={{}} className={darkMode ? 'bg-space-cadet' : ''}>
          <div style={{display: 'flex', gap: '10px'}}>
            Manage Role & Permissions
            <EditableInfoModal
              role={authUser.requestorRole}
              areaName={'roleChangeInfo'}
              areaTitle="Role Change"
              fontSize={20}
              darkMode={darkMode}
            />
          </div>
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="roleSelect" className={darkMode ? 'text-light' : ''}>
              Role
            </label>
            <Input
              type="select"
              id="roleSelect"
              value={selectedRole}
              onChange={e => updateSelectedRole(e.target.value)}
              className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
            > 
              {roles.map(r => (
                <option key={r.roleName} value={r.roleName}>
                  {r.roleName}
                </option>
              ))}
            </Input>
          </div>

          <div>
            {isOpen && selectedRoleToDisplay()}
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button onClick={onClose} style={boxStyling} disabled={saving}>
            Cancel
          </Button>
          <Button color="success" onClick={handleConfirm} style={boxStyling} disabled={saving || userProfile?.role === selectedRole}>
            {saving ? 'Saving...' : 'Confirm'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}


