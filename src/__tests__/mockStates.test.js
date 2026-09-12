// eslint-disable-next-line no-unused-vars
import { getAllPermissionKeys } from "~/components/PermissionsManagement/PermissionsConst";
import { createAuthMocks } from "./mockStates";

describe('Permission tests', () => {
  it('should include specific permission', () => {
    // Define the permissions you want to test
    const permissions = ['permission1', 'permission2'];

    // Create authentication mocks with the specified permissions
    const [authWithPermissions, authWithoutPermissions] = createAuthMocks(permissions);

    // Assert that the permission is included in authWithPermissions
    expect(authWithPermissions.permissions.frontPermissions).toEqual(expect.arrayContaining(permissions));

    // Assert that the permission is not included in authWithoutPermissions
    expect(authWithoutPermissions.permissions.frontPermissions).not.toEqual(expect.arrayContaining(permissions));
  });

  // You can add more test cases for other spermissions if needed
});
