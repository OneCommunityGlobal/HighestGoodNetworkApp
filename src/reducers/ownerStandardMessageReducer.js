import * as types from "../constants/ownerStandardMessageConstants";

const initialState = null;

export const ownerStandardMessageReducer = (state= initialState, action) => {
  switch(action.type) {
    case types.GET_OWNER_STANDARD_MESSAGE:
      const data = action.payload;
      return data;
    
    case types.CREATE_OWNER_STANDARD_MESSAGE:
      return state;

    case types.UPDATE_OWNER_STANDARD_MESSAGE:
      return state;

    case types.DELETE_OWNER_STANDARD_MESSAGE:
      return state;
      
    default: 
      return state;
  }
}