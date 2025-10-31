import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Input } from 'reactstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import PermissionList from '~/components/PermissionsManagement/PermissionList';
import { boxStyle, boxStyleDark } from '~/styles';

/**
 * RoleChangePermissionsModal
 * - Allows admins to switch a user's role and adjust custom permission overrides in one flow
 * - Reuses PermissionList to manage adds/removes relative to role defaults
 */
export default function RoleChangePermissionsModal({
  isOpen,
  onClose,
  roles = [],
  userProfile,
  setUserProfile,
  loadUserProfile,
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
  // Track removed-default-perms per role so admins can pre-configure before switching
  const [removedDefaultsByRole, setRemovedDefaultsByRole] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedRole(initialSelectedRole);
    setUserCustomPermissions(initialCustomPerms);
    setRemovedDefaultsByRole(prev => ({
      ...prev,
      [initialSelectedRole]: initialRemovedDefaults,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const getRemovedDefaults = roleName => removedDefaultsByRole[roleName] || [];
  const setRemovedDefaultsForRole = roleName => updater => {
    setRemovedDefaultsByRole(current => {
      const currentList = current[roleName] || [];
      const nextList = typeof updater === 'function' ? updater(currentList) : updater;
      return { ...current, [roleName]: nextList };
    });
  };

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
          frontPermissions: userCustomPermissions,
          removedDefaultPermissions: getRemovedDefaults(selectedRole),
        },
      };

      const url = ENDPOINTS.USER_PROFILE(userId);
      await axios.put(url, updated);

      // Optimistically update local state and optionally refresh
      setUserProfile(updated);
      if (typeof loadUserProfile === 'function') {
        try {
          await loadUserProfile();
        } catch (_) {
          // non-blocking refresh
        }
      }
      toast.success('Role and permissions updated');
      onClose();
    } catch (err) {
      toast.error(`Failed to update role/permissions${err?.response?.data ? `: ${err.response.data}` : ''}`);
    } finally {
      setSaving(false);
    }
  };

  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  // Simple accordion state per role
  const [openPanels, setOpenPanels] = useState({});
  const togglePanel = roleName => {
    setOpenPanels(prev => ({ ...prev, [roleName]: !prev[roleName] }));
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} className={darkMode ? 'dark-mode text-light' : ''} size="lg">
      <ModalHeader toggle={onClose} className={darkMode ? 'bg-space-cadet' : ''}>
        Manage Role & Permissions
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
            onChange={e => setSelectedRole(e.target.value)}
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
          <h5 className={darkMode ? 'text-light' : ''} style={{ marginBottom: 8 }}>
            Permissions by Role
          </h5>
          <div>
            {roles.map(r => {
              const roleDefaults = roleNameToDefaults[r.roleName] || [];
              const isSelected = r.roleName === selectedRole;
              const removedDefaults = isSelected ? getRemovedDefaults(r.roleName) : [];
              const isOpen = !!openPanels[r.roleName];
              return (
                <div key={r.roleName} style={{ border: '1px solid #ccc', borderRadius: 4, marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={() => togglePanel(r.roleName)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: darkMode ? '#1b2a41' : '#f7f7f7',
                      color: darkMode ? '#fff' : '#000',
                      border: 'none',
                      borderRadius: '4px 4px 0 0',
                      cursor: 'pointer',
                    }}
                  >
                    {r.roleName} {r.roleName === selectedRole ? '(selected)' : ''}
                    <span style={{ float: 'right' }}>{isOpen ? '▾' : '▸'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '8px 12px' }}>
                      <PermissionList
                        rolePermissions={userCustomPermissions}
                        immutablePermissions={isSelected ? roleDefaults : []}
                        editable
                        setPermissions={setUserCustomPermissions}
                        removedDefaultPermissions={removedDefaults}
                        setRemovedDefaultPermissions={setRemovedDefaultsForRole(r.roleName)}
                        darkMode={darkMode}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button onClick={onClose} style={boxStyling} disabled={saving}>
          Cancel
        </Button>
        <Button color="success" onClick={handleConfirm} style={boxStyling} disabled={saving}>
          {saving ? 'Saving...' : 'Confirm'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}


