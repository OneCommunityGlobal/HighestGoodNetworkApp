import { clearUserProfile } from '../index';


describe('clearUserProfile action', () => {
  it('should create an action to clear user profile', () => {
    const expectedAction = {
      type: 'CLEAR_USER_PROFILE',
    };
    expect(clearUserProfile()).toEqual(expectedAction);
  });
});
