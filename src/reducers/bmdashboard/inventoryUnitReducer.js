import {
  FETCH_BUILDING_MATERIAL_INVENTORY_UNITS,
  POST_BUILDING_MATERIAL_INVENTORY_UNIT,
  RESET_POST_BUILDING_MATERIAL_INVENTORY_UNIT,
} from 'constants/bmdashboard/inventoryTypeConstants';

const defaultState = {
  list: [],
  postedResult: {
    result: null,
    error: null,
    success: null,
  },
};

// eslint-disable-next-line default-param-last
export default function bmInvUnitReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_BUILDING_MATERIAL_INVENTORY_UNITS:
      return {
        ...state,
        list: action.payload,
      };
    case POST_BUILDING_MATERIAL_INVENTORY_UNIT:
      return {
        ...state,
        postedResult: {
          result: action.payload,
          success: true,
          error: false,
        },
      };
    case RESET_POST_BUILDING_MATERIAL_INVENTORY_UNIT:
      return {
        ...state,
        postedResult: {
          result: null,
          success: null,
          error: null,
        },
      };
    default:
      return state;
  }
}
