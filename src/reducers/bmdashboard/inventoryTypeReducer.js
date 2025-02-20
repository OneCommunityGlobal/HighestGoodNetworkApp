
import GET_MATERIAL_TYPES, {
  GET_REUSABLE_TYPES,
  GET_EQUIPMENT_TYPES,
  POST_BUILDING_MATERIAL_INVENTORY_TYPE,
  POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE,
  RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE,
  POST_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  POST_ERROR_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  RESET_POST_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  POST_BUILDING_TOOL_INVENTORY_TYPE,
  POST_ERROR_BUILDING_TOOL_INVENTORY_TYPE,
  RESET_POST_BUILDING_TOOL_INVENTORY_TYPE,
  GET_INV_BY_TYPE,
  GET_TOOL_TYPES,
  GET_CONSUMABLE_TYPES,
} from '../../constants/bmdashboard/inventoryTypeConstants';
import { POST_TOOLS_LOG, POST_ERROR_TOOLS_LOG, RESET_POST_TOOLS_LOG } from '../../constants/bmdashboard/toolsConstants'


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

// eslint-disable-next-line import/prefer-default-export
export const bmInvTypeReducer = (state = defaultState, action) => {

  switch (action.type) {
    case GET_MATERIAL_TYPES:
      state.list = action.payload;
      return {
        ...state
      };
    case POST_BUILDING_CONSUMABLE_INVENTORY_TYPE:
      return {
        ...state,
        postedResult: {
          result: action.payload,
          success: true,
          error: false,
        },
      };
    case GET_REUSABLE_TYPES:
      state.list = action.payload;
      return {
        ...state
      };
    case GET_EQUIPMENT_TYPES:
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
      case POST_ERROR_BUILDING_CONSUMABLE_INVENTORY_TYPE:
        return {
          ...state,
          postedResult: {
            result: action.payload,
            success: false,
            error: true,
          },
        };
      case RESET_POST_BUILDING_CONSUMABLE_INVENTORY_TYPE:
          return {
            ...state,
            postedResult: {
              result: null,
              success: null,
              error: null,
            },
          };
    case POST_BUILDING_TOOL_INVENTORY_TYPE:
      return {
        ...state,
        postedResult: {
          result: action.payload,
          success: true,
          error: false,
        },
      };
    case POST_ERROR_BUILDING_TOOL_INVENTORY_TYPE:
        return {
          ...state,
          postedResult: {
            result: action.payload,
            success: false,
            error: true,
          },
        };
      case RESET_POST_BUILDING_TOOL_INVENTORY_TYPE:
          return {
            ...state,
            postedResult: {
              result: null,
              success: null,
              error: null,
            },
          };
    case GET_INV_BY_TYPE: {
      state.invTypeList[action.payload.type] = [...action.payload.data]
      return { ...state }
    }
    // 
    case POST_TOOLS_LOG:
      return {
        // eslint-disable-next-line no-undef
        ...state,
        postedResult: {
          result: action.payload,
          success: true,
          error: false,
        },
      };
    case POST_ERROR_TOOLS_LOG:
      return {
        // eslint-disable-next-line no-undef
        ...state,
        postedResult: {
          result: action.payload,
          success: false,
          error: true,
        },
      };
    case RESET_POST_TOOLS_LOG:
      return {
        // eslint-disable-next-line no-undef
        ...state,
        postedResult: {
          result: null,
          success: null,
          error: null,
        },
      };
    default: {
      return state;
    }
  }
};