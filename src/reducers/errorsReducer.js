import { GET_ERRORS, CLEAR_ERRORS } from '../constants/errors';

const initialState = {};

// eslint-disable-next-line import/prefer-default-export,default-param-last
export const errorsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ERRORS:
      return action.payload;
    case CLEAR_ERRORS:
      return {};
    default:
      return state;
  }
};
