import * as types from '../constants/ownerMessageConstants';

const initialState = {
  message: '',
  standardMessage: '',
  history: [],
};

// eslint-disable-next-line default-param-last
export const ownerMessageReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.UPDATE_OWNER_MESSAGE:
      return {
        ...state,
        message: action.payload.message,
        standardMessage: action.payload.standardMessage,
      };

    case types.UPDATE_OWNER_MESSAGE_HISTORY:
      return {
        ...state,
        history: action.payload,
      };

    default:
      return state;
  }
};

export default ownerMessageReducer;
