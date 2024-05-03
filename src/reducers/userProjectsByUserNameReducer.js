import {GET_PROJECT_BY_FIRSTNAME_AND_LASTNAME} from '../constants/userProfile';

const initialUserName = {
  projects: []
};

export const userProjectsByUserNameReducer = (state = initialUserName, action )=>{
  switch (action.type) {
    case GET_PROJECT_BY_FIRSTNAME_AND_LASTNAME : 
    console.log("This got inside the Reducer")
    return {
      ...state,
      projects: action.payload
    }
    default: return state
  }
}
