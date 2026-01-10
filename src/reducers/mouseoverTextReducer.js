import * as types from '../constants/mouseoverTextConstants';

const initialState = null;

// eslint-disable-next-line default-param-last
export const mouseoverTextReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.GET_MOUSEOVER_TEXT: {
      // Directly return the payload for GET_MOUSEOVER_TEXT
      return action.payload;
    }

    case types.CREATE_MOUSEOVER_TEXT: {
      // Placeholder for creating mouseover text, if needed in the future
      return state;
    }

    case types.UPDATE_MOUSEOVER_TEXT: {
      // Placeholder for updating mouseover text, if needed in the future
      return state;
    }

    default: {
      // Ensure the current state is returned by default
      return state;
    }
  }
};

export default mouseoverTextReducer;
