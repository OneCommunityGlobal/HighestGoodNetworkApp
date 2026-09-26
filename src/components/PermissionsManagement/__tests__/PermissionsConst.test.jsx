import { getAllPermissionKeys, permissionLabelKeyMappingObj } from '../PermissionsConst';

describe('PermissionsConst', () => {
  it('registers postFacebookContent as a canonical frontend permission', () => {
    expect(getAllPermissionKeys()).toContain('postFacebookContent');
    expect(permissionLabelKeyMappingObj.postFacebookContent).toBe('Post Facebook Content');
  });
});
