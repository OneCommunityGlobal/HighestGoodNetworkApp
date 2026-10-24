import { allUserProfilesBasicInfoReducer } from '../allUserProfilesBasicInfoReducer';
import * as types from '../../constants/userManagement';

describe('allUserProfilesBasicInfoReducer', () => {
  // Test 1: Should return the initial state when no action is passed
  it('should return the initial state when no action is passed', () => {
    const initialState = null;
    const action = {}; // No action provided

    const result = allUserProfilesBasicInfoReducer(initialState, action);
    expect(result).toBeNull(); // Expect the state to be null, which is the initial state
  });

  it('should handle FETCH_USER_PROFILE_BASIC_INFO and return the state', () => {
    const action = {
      type: types.FETCH_USER_PROFILE_BASIC_INFO,
    };
    const result = allUserProfilesBasicInfoReducer({}, action);
    expect(result).toMatchObject({
      fetching: true,
      status: '200',
    });
  });

  it('should handle FETCH_USER_PROFILE_BASIC_INFO_ERROR and return the error', () => {
    const action = {
      type: types.FETCH_USER_PROFILE_BASIC_INFO_ERROR,
    };
    const result = allUserProfilesBasicInfoReducer({}, action);
    expect(result).toMatchObject({
      fetching: false,
      status: '404',
    });
  });

  it('should handle RECEIVE_USER_PROFILE_BASIC_INFO on empty initialState', () => {
    const action = {
      type: types.RECEIVE_USER_PROFILE_BASIC_INFO,
      payload: 'profiles',
    };
    const result = allUserProfilesBasicInfoReducer({}, action);
    expect(result).toMatchObject({
      userProfilesBasicInfo: 'profiles',
      fetching: false,
      fetched: true,
      status: '200',
    });
  });

  it('should handle RECEIVE_USER_PROFILE_BASIC_INFO and update existed infor', () => {
    const initialState = {
      fetching: false,
      fetched: false,
      userProfilesBasicInfo: { id: 1, name: 'Test' },
      status: 404,
    };
    const action = {
      type: types.RECEIVE_USER_PROFILE_BASIC_INFO,
      payload: { id: 1, name: 'Updated Test' },
    };
    const result = allUserProfilesBasicInfoReducer(initialState, action);
    expect(result).toMatchObject({
      userProfilesBasicInfo: { id: 1, name: 'Updated Test' },
      fetching: false,
      fetched: true,
      status: '200',
    });
  });

  it('should return the previous state when an unknown action is passed', () => {
    const initialState = {
      fetching: false,
      fetched: false,
      userProfilesBasicInfo: [],
      status: 404,
    };
    const action = {
      type: 'UNKNOWN_ACTION',
      payload: {
        fetching: true,
        fetched: false,
        userProfilesBasicInfo: [1, 2, 3],
        status: 200,
      },
    };
    const result = allUserProfilesBasicInfoReducer(initialState, action);
    expect(result).toEqual(initialState);
  });
});
