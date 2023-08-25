import * as types from '../constants/userManagement';

const userProfilesInitial = {
  fetching: false,
  fetched: false,
  userProfiles: [],
  status: 404,
};

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const allUserProfilesReducer = (userProfiles = userProfilesInitial, action) => {
  switch (action.type) {
    case types.FETCH_USER_PROFILES_START:
      return { ...userProfiles, fetching: true, status: '200' };

    case types.FETCH_USER_PROFILES_ERROR:
      return { ...userProfiles, fetching: false, status: '404' };

    case types.RECEIVE_ALL_USER_PROFILES:
      return updateObject(userProfiles, {
        userProfiles: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.USER_PROFILE_UPDATE:
      const index = userProfiles.userProfiles.findIndex(user => user._id === action.user._id);
      return updateObject(userProfiles, {
        userProfiles: Object.assign([
          ...userProfiles.userProfiles.slice(0, index),
          action.user,
          ...userProfiles.userProfiles.slice(index + 1),
        ]),
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.USER_PROFILE_DELETE:
      const deletedIndex = userProfiles.userProfiles.findIndex(user => user._id === action.user._id);
      return updateObject(userProfiles, {
        userProfiles: Object.assign([
          ...userProfiles.userProfiles.slice(0, deletedIndex),
          ...userProfiles.userProfiles.slice(deletedIndex + 1),
        ]),
        fetching: false,
        fetched: true,
        status: '200',
      });
    default:
      return userProfiles;
  }
};
