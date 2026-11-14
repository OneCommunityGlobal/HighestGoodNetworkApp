import permissionsList from '../Permissions.json';
import { permissionLabelKeyMappingObj } from '../PermissionsConst';

// every permission key in the list, nested ones included
const collectKeys = list =>
  list.flatMap(item => (item.subperms ? collectKeys(item.subperms) : [item.key]));

describe('Delete User Profile permission on the Permissions Management page', () => {
  const userManagement = permissionsList.find(category => category.label === 'User Management');
  const deletePermission = userManagement?.subperms.find(perm => perm.key === 'deleteUserProfile');

  it('is listed under User Management so it can be given to a role or a person', () => {
    expect(deletePermission).toBeDefined();
    expect(deletePermission.label).toBe('Delete User Profile');
    expect(deletePermission.description).toMatch(/ONLY delete users/);
    // the user list needs See All Users, so the description has to say so
    expect(deletePermission.description).toMatch(/See All Users/);
  });

  it('appears only once in the whole list', () => {
    const matches = collectKeys(permissionsList).filter(key => key === 'deleteUserProfile');
    expect(matches).toHaveLength(1);
  });

  it('shows its label in the permission change log', () => {
    expect(permissionLabelKeyMappingObj.deleteUserProfile).toBe('Delete User Profile');
  });
});
