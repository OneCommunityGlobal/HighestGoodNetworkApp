import { allUserProfilesReducer } from '../allUserProfilesReducer';
import * as types from '../../constants/userManagement';

const fetched = (data) => {
  return {
    ...data,
    fetching: false,
    fetched: true,
    status: '200',
  };
};

describe('User Profiles Reducer', () => {
  it('start fetch', () => {
    const result = allUserProfilesReducer(
      {},
      {
        type: types.FETCH_USER_PROFILES_START,
      },
    );
    expect(result).toMatchObject({
      fetching: true,
      status: '200',
    });
  });

  it('fetch error', () => {
    const result = allUserProfilesReducer(
      {},
      {
        type: types.FETCH_USER_PROFILES_ERROR,
      },
    );
    expect(result).toMatchObject({
      fetching: false,
      status: '404',
    });
  });

  it('get', () => {
    const result = allUserProfilesReducer(
      {},
      {
        type: types.RECEIVE_ALL_USER_PROFILES,
        payload: 'profiles',
      },
    );
    expect(result).toMatchObject(
      fetched({
        userProfiles: 'profiles',
      }),
    );
  });

  it('update', () => {
    const result = allUserProfilesReducer(
      {
        userProfiles: [{ _id: 0 }, { _id: 42 }, { _id: 1 }],
      },
      {
        type: types.USER_PROFILE_UPDATE,
        user: { _id: 42, name: 'neo' },
      },
    );
    expect(result).toMatchObject(
      fetched({
        userProfiles: [{ _id: 0 }, { _id: 42, name: 'neo' }, { _id: 1 }],
      }),
    );
  });

  it('delete', () => {
    const result = allUserProfilesReducer(
      {
        userProfiles: [{ _id: 0 }, { _id: 42 }, { _id: 1 }],
      },
      {
        type: types.USER_PROFILE_DELETE,
        user: { _id: 42 },
      },
    );
    expect(result).toMatchObject(
      fetched({
        userProfiles: [{ _id: 0 }, { _id: 1 }],
      }),
    );
  });
});
