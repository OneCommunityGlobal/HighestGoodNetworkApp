import { createAuthMocks} from './mockStates';
import { getAllPermissionKeys } from '../components/PermissionsManagement/PermissionsConst.js';

describe('createAuthMocks Functionality', () => {
  it('correctly creates auth objects with and without specified permissions', () => {
    // Specify a subset of permissions for testing
    const testPermissions = ['editUser', 'viewReports'];

    // Get all permissions
    const allPermissions = getAllPermissionKeys();

    // Use createAuthMocks to create auth objects
    const [authWithSpecified, authWithOthers] = createAuthMocks(testPermissions);

    // Test that authWithSpecified contains only the specified permissions
    testPermissions.forEach(permission => {
      expect(authWithSpecified.permissions.frontPermissions).toContain(permission);
    });

    // Test that authWithSpecified does not contain permissions not specified
    const notSpecifiedPermissions = allPermissions.filter(perm => !testPermissions.includes(perm));
    notSpecifiedPermissions.forEach(permission => {
      expect(authWithSpecified.permissions.frontPermissions).not.toContain(permission);
    });

    // Test that authWithOthers does not contain any of the specified permissions
    testPermissions.forEach(permission => {
      expect(authWithOthers.permissions.frontPermissions).not.toContain(permission);
    });

    // Test that authWithOthers contains permissions not specified in testPermissions
    notSpecifiedPermissions.forEach(permission => {
      expect(authWithOthers.permissions.frontPermissions).toContain(permission);
    });
  });
});
