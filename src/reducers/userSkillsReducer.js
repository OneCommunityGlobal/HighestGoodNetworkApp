const initialState = {
  profileData: null,
};

/* eslint-disable-next-line default-param-last */
const userSkillsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_SKILLS_PROFILE_DATA':
      // case 'SET_PROFILE_DATA':
      return {
        ...state,
        profileData: action.payload,
      };
    default:
      return state;
  }
};
/*
case 'UPDATE_WORK_EXPERIENCE':
  return {
    ...state,
    profileData: {
      ...state.profileData,
      workExperience: action.payload,
    },
  };

case 'UPDATE_ADDITIONAL_INFO':
  return {
    ...state,
    profileData: {
      ...state.profileData,
      additionalInfo: action.payload,
    },
  };
*/
export default userSkillsReducer;
