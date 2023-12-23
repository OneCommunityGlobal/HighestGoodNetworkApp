import GET_MATERIAL_TYPES, { POST_BUILDING_MATERIAL_INVENTORY_TYPE, POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE, RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE } from "constants/bmdashboard/inventoryTypeConstants";

const defaultState = {
  list: [],
  postedResult: {
    result: null,
    error: null,
    success: null
  }
}

export const bmInvTypeReducer = (state = defaultState, action) => {

  switch (action.type) {
    case GET_MATERIAL_TYPES:
      state.list = action.payload;
      return { ...state }
    case POST_BUILDING_MATERIAL_INVENTORY_TYPE:
      return {
        ...state,
        postedResult: {
          result: action.payload,
          success: true,
          error: false
        }
      };
    case POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE:
      return {
        ...state,
        postedResult: {
          result: action.payload,
          success: false,
          error: true
        }
      };
    case RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE:
      return {
        ...state,
        postedResult: {
          result: null,
          success: null,
          error: null
        }
      }
    default:
      {
        return state;
      }
  }
}