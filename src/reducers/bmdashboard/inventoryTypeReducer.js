import GET_MATERIAL_TYPES, { POST_BUILDING_MATERIAL_INVENTORY_TYPE, POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE, RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE, GET_INV_BY_TYPE, GET_TOOL_TYPES, GET_CONSUMABLE_TYPES } from "constants/bmdashboard/inventoryTypeConstants";

const defaultState = {
  list: [],
  invTypeList: {
    "All": null, "Materials": null, "Consumables": null, "Equipments": null,
    "Reusables": null, "Tools:": null
  },
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
      return {
        ...state
      };
    case GET_TOOL_TYPES:
      state.list = action.payload;
      return {
        ...state
      };
    case GET_CONSUMABLE_TYPES:
      state.list = action.payload;
      return {
        ...state
      };
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
      };
    case GET_INV_BY_TYPE: {
      state.invTypeList[action.payload.type] = [...action.payload.data]
      return { ...state }
    }
    default: {
      return state;
    }
  }
};