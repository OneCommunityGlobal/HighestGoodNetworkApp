const initialState = {
  profileData: null,
};

/* eslint-disable-next-line default-param-last */
const userSkillsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER_SKILLS_PROFILE_DATA':
      return {
        ...state,
        profileData: action.payload,
      };
    case 'UPDATE_USER_SKILLS_PROFILE_DATA_FOLLOWUP_FIELDS':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          skillInfo: {
            ...state.profileData.skillInfo,
            followUp: {
              ...state.profileData.skillInfo.followUp,
              ...action.payload,
            },
          },
        },
      };
    case 'UPDATE_USER_SKILLS_YEARS_OF_EXPERIENCE_SUCCESS':
      return {
        ...state,
        profileData: {
          ...state.profileData,
          skillInfo: {
            ...state.profileData.skillInfo,
            general: {
              ...state.profileData.skillInfo.general,
              yearsOfExperience: action.payload.yearsOfExperience,
            },
          },
        },
      };
    default:
      return state;
  }
};

export default userSkillsReducer;
