import {GET_PROJECT_BY_FIRSTNAME_AND_LASTNAME} from '../constants/userProfile';

const initialUserProject = {
  userProjects: []
};

export const userProjectsByUserNameReducer = (state = initialUserProject, action )=>{
  switch (action.type) {
    case GET_PROJECT_BY_FIRSTNAME_AND_LASTNAME : 
    return {
      ...state,
      projects: action.payload
    }
    default: return state
  }
}
