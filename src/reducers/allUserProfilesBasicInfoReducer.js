import * as types from '../constants/userManagement';

const userProfilesBasicInfoInitial = {
    fetching: false,
    fetched: false,
    userProfilesBasicInfo: [],
    status: 404,
  };

  export const updateObject = (oldObject, updatedProperties) => {
    return {
      ...oldObject,
      ...updatedProperties,
    };
  };

  export const allUserProfilesBasicInfoReducer = (userProfilesBasicInfo = userProfilesBasicInfoInitial, action) => {
    switch (action.type) {
      case types.FETCH_USER_PROFILE_BASIC_INFO:
        return { ...userProfilesBasicInfo, fetching: true, status: '200' };
  
      case types.FETCH_USER_PROFILE_BASIC_INFO_ERROR:
        return { ...userProfilesBasicInfo, fetching: false, status: '404' };
  
      case types.RECEIVE_USER_PROFILE_BASIC_INFO:
        return updateObject(userProfilesBasicInfo, {
          userProfilesBasicInfo: action.payload,
          fetching: false,
          fetched: true,
          status: '200',
        });
        default:
      return userProfilesBasicInfo;
    }
  };
  

  