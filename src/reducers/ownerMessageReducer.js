import * as types from '../constants/ownerMessageConstants';

const initialState = null;

// eslint-disable-next-line import/prefer-default-export,default-param-last
export const ownerMessageReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.GET_OWNER_MESSAGE: {
      const data = action.payload;
      return data;
    }

    case types.CREATE_OWNER_MESSAGE:
      return state;

    case types.UPDATE_OWNER_MESSAGE:
      return state;

    case types.DELETE_OWNER_MESSAGE:
      return state;

    default:
      return state;
  }
};
