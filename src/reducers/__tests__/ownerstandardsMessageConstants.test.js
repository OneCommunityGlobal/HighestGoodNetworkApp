import * as constants from '../../constants/ownerStandardMessageConstants';

describe('ownerStandardMessageConstants', () => {
  it('should export the correct constants', () => {
    expect(constants.GET_OWNER_STANDARD_MESSAGE).toBe('GET_OWNER_STANDARD_MESSAGE');
    expect(constants.CREATE_OWNER_STANDARD_MESSAGE).toBe('CREATE_OWNER_STANDARD_MESSAGE');
    expect(constants.UPDATE_OWNER_STANDARD_MESSAGE).toBe('UPDATE_OWNER_STANDARD_MESSAGE');
    expect(constants.DELETE_OWNER_STANDARD_MESSAGE).toBe('DELETE_OWNER_STANDARD_MESSAGE');
  });
});
