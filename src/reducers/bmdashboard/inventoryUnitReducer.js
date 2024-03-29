import {
  FETCH_BUILDING_MATERIAL_INVENTORY_UNITS,
  POST_BUILDING_MATERIAL_INVENTORY_UNIT, RESET_POST_BUILDING_MATERIAL_INVENTORY_UNIT
} from "constants/bmdashboard/inventoryTypeConstants";

const defaultState = {
  list: [],
  postedResult: {
    result: null,
    error: null,
    success: null
  }
}

export const bmInvUnitReducer = (state = defaultState, action) => {

  switch (action.type) {
    case FETCH_BUILDING_MATERIAL_INVENTORY_UNITS:
      state.list = action.payload;
      return { ...state }
    case POST_BUILDING_MATERIAL_INVENTORY_UNIT:
      return {
        ...state,
        postedResult: {
          result: action.payload,
          success: true,
          error: false
        }
      };
    case RESET_POST_BUILDING_MATERIAL_INVENTORY_UNIT:
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