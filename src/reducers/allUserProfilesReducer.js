import * as types from '../constants/userManagement'

const userProfilesInitial = {
  fetching: false,
  fetched: false,
  userProfiles: [],
  status: 404
}


export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties
  };
};

export const allUserProfilesReducer = (userProfiles = userProfilesInitial, action) => {

  switch (action.type) {
    case types.FETCH_USER_PROFILES_START:
      return { ...userProfiles, fetching: true, status: "200" }

    case types.FETCH_USER_PROFILES_ERROR:
      console.log("Reducers error", action.payload);
      return { ...userProfiles, fetching: false, status: action.payload }

    case types.RECEIVE_USER_PROFILES:
      return updateObject(userProfiles, {
        userProfiles: action.payload,
        fetching: false,
        fetched: true,
        status: "200"
      });

    default:
      return userProfiles
  }
};
