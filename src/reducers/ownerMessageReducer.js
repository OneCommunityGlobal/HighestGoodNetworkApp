import * as types from "../constants/ownerMessageConstants";

const initialState = {
  message: '',
  standardMessage: '',
};

export const ownerMessageReducer = (state = initialState, action) => {
  switch(action.type) {
    case types.UPDATE_OWNER_MESSAGE:
      return action.payload;
      
    default: 
      return state;
  }
}