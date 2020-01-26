import _ from "lodash";

const initialState = {
  isAuthenticated: false,
  user: {}
}

export const authReducer = (auth = initialState, action) => {
  if (action.type === 'SET_CURRENT_USER') {
    if (!action.payload){
      return initialState
    }
    else if (action.payload.new){
      return {
        isAuthenticated: false,
        user: action.payload,
      }
    }
    else {
      return {
        isAuthenticated: !_.isEmpty(action.payload),
        user: action.payload,
      }
    }
  }

  return auth;
};
