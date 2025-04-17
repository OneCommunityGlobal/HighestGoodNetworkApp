import types from '../constants/userProjects';

const initialState = {
  projects: [],
  wbs: [],
};

// eslint-disable-next-line default-param-last
const userProjectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.GET_USER_PROJECTS:
      return {
        ...state,
        projects: action.payload,
      };
    default:
      return state;
  }
};

export default userProjectsReducer;
