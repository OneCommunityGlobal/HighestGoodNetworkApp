export const allUserProfilesReducer = (userProfiles = null, action) => {
  if (action.type === 'GET_ALL_USER_PROFILES') {
    return action.payload;
  }

  return userProfiles;
};
