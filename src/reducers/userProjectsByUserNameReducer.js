import {GET_PROJECT_BY_FIRSTNAME_AND_LASTNAME, USER_NOT_FOUND_ERROR} from '../constants/userProfile';

const initialUserProject = {
  userProjects: [],
  userError: null,
};

export const userProjectsByUserNameReducer = (state = initialUserProject, action )=>{
  switch (action.type) {
    case GET_PROJECT_BY_FIRSTNAME_AND_LASTNAME : 
    return {
      ...state,
      projects: action.payload
    }
    case USER_NOT_FOUND_ERROR : 
    return {
      ...state,
      userError: action.payload
    }
    default: return state
  }
}
