/* eslint-disable no-case-declarations */
/* eslint-disable default-param-last */
import * as types from '../constants/userManagement';

const userProfilesInitial = {
  fetching: false,
  fetched: false,
  userProfiles: [],
  editable: {
    first: 1,
    last: 1,
    role: 1,
    email: 1,
    weeklycommittedHours: 1,
    startDate: 1,
    endDate: 1,
  },
  pagestats: { pageSize: 10, selectedPage: 1 },
  status: 100,
  updating: false,
  newUserData: [],
};

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

// eslint-disable-next-line default-param-last
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
      const deletedIndex = userProfiles.userProfiles.findIndex(
        user => user._id === action.user._id,
      );
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

export const enableUserInfoEditReducer = (userProfile = userProfilesInitial, action) => {
  switch (action.type) {
    case 'ENABLE_USER_PROFILE_EDIT':
      return updateObject(userProfile, { ...userProfile, editable: action.payload });
    case 'DISABLE_USER_PROFILE_EDIT':
      return updateObject(userProfile, { editable: action.payload });
    case 'START_USER_INFO_UPDATE':
      return { ...userProfile, newUserData: userProfile.newUserData.concat(action.payload) };
    default:
      return userProfile;
  }
};

export const changeUserPageStatusReducer = (userProfile = userProfilesInitial, action) => {
  switch (action.type) {
    case 'CHANGE_USER_PROFILE_PAGE':
      return updateObject(userProfile.pagestats, action.payload);
    default:
      return userProfile;
  }
};
