import jwtDecode from 'jwt-decode';
import _ from "lodash";

const initialState = {
  isAuthenticated: false,
  user: {},
  errors: null,
}

export const authReducer = (auth = initialState, action) => {
  if (action.type === 'GET_CURRENT_USER') {
    try {
      const token = action.payload;
      return jwtDecode(token);
    } catch (err) {
      return auth;
    }
  }

  if (action.type === 'SET_CURRENT_USER') {
    if (!action.payload){
      return initialState
    }
    else if (action.payload.errors){
      return {
        ...auth,
        ...action.payload
      }
    }
    else if (action.payload.new){
      return {
        ...auth,
        errors: null,
        user: action.payload,
      }
    }
    else {
      return {
        isAuthenticated: !_.isEmpty(action.payload),
        user: action.payload,
        errors: null
      }
    }
  }

  return auth;
};
