import jwtDecode from 'jwt-decode';

export const currentUserReducer = (user = {}, action) => {
  if (action.type === 'GET_CURRENT_USER') {
    try {
      const token = action.payload;
      return jwtDecode(token);
    } catch (err) {
      return user;
    }
  }

  if (action.type === 'SET_CURRENT_USER') {
    return action.payload;
  }

  return user;
};
