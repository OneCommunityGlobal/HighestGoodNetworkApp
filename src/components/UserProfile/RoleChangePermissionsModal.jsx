import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Input } from 'reactstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import { boxStyle, boxStyleDark } from '~/styles';
import { permissionLabelKeyMappingObj } from '../PermissionsManagement/PermissionsConst';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';
import PropTypes from 'prop-types';
import styles from './BasicInformationTab/BasicInformationTab.module.css';

/**
 * RoleChangePermissionsModal
 * - Allows admins to switch a user's role and adjust custom permission overrides in one flow
 */
function RoleChangePermissionsModal(props) {
  const {
    isOpen,
    onClose,
    roles = [],
    userProfile,
    loadUserProfile,
    authUser,
    desktopDisplay,
    canAddDeleteEditOwners,
  } = props;
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

  const getRemovedDefaults = roleName => removedDefaultsByRole[roleName] || initialRemovedDefaults;
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
      toast.success('Your changes have been saved, you can verify it in Permissions Management');
      onClose();
    } catch (err) {
      const errorData = `: ${err.response.data}`
      toast.error(`Failed to update role/permissions${err?.response?.data ? errorData : ''}`);
    } finally {
      setSaving(false);
    }
  };

  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  const updateSelectedRole = (newRole) => {
    const selectedRole2 = roles.some(r => r.roleName === newRole)
    if(!selectedRole2) return
    const roleDefaults = roleNameToDefaults[newRole] || [];

    setSelectedRole(newRole);
    setKeptFrontPermissions(keptFrontPermissions.filter(perm => roleDefaults.includes(perm)));
    setKeptRemovedPermissions(keptRemovedPermissions.filter(perm => !roleDefaults.includes(perm)));
  }

  const selectedRoleToDisplay = () => {
    const selectedRole2 = roles.find(r => r.roleName === selectedRole)
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
            .some(perms => {
              return !roleDefaults.includes(perms)
            })
            && 
            <div>
              <br></br>
              <h4>Added Permissions:</h4>
              <span>These pemissions are NOT normally part of this new role, and <strong>will remain added</strong> if you check the boxes and click confirm</span>
            </div>
          }
          {userCustomPermissions
            .filter(perms => {
              return !roleDefaults.includes(perms)
            })
            .map(perm => {
              return(
                <p key={perm} style={{marginLeft: '16px', marginTop: '5px'}} className={darkMode ? styles.darkModeText : ''}>
                <input 
                  type='checkbox' 
                  checked={keptFrontPermissions.includes(perm)} 
                  onChange={() => checked(setKeptFrontPermissions, perm)}
                ></input> {permissionLabelKeyMappingObj?.[perm]}
                </p>
              );
          })}
          {removedDefaults
            .some(perms => {
              return roleDefaults.includes(perms)
            })
            &&
            <div>
              <br></br>
              <h4>Removed Permissions:</h4>
              <span>These pemissions ARE normally part of the new role, and <strong>will remain removed</strong> if you check the boxes and click confirm</span>
            </div>
          }
          {removedDefaults
            .filter(perms => {
              return roleDefaults.includes(perms)
            })
            .map(perm => {
              return(
                <p key={perm} style={{marginLeft: '16px', marginTop: '5px'}} className={darkMode ? styles.darkModeText : ''}>
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
            {canAddDeleteEditOwners && (
              <option value="Owner" style={desktopDisplay ? { marginLeft: '5px' } : {}}>
                Owner
              </option>
            )}
            {(roles || [])
              .map(r => (typeof r === 'string' ? r : r.roleName)) // normalize
              .filter(Boolean)
              .map(roleName => {
                if (roleName === 'Owner') return null; // skip Owner in this list
                return (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                );
            })}
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
  );
}

RoleChangePermissionsModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      roleName: PropTypes.string,
    })
  ),
  userProfile: PropTypes.shape({
    role: PropTypes.string,
    permissions: PropTypes.shape({
      frontPermissions: PropTypes.array,
      removedDefaultPermissions: PropTypes.array,
    }),
    _id: PropTypes.string,
  }).isRequired,
  loadUserProfile: PropTypes.func.isRequired,
  authUser: PropTypes.shape({
    requestId: PropTypes.number,
    requestorRole: PropTypes.string
  }),
  desktopDisplay: PropTypes.bool,
  canAddDeleteEditOwners: PropTypes.bool,
}

export default RoleChangePermissionsModal;