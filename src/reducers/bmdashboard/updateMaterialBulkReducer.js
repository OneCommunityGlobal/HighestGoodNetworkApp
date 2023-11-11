import {
  POST_UPDATE_MATERIAL_START_BULK, POST_UPDATE_MATERIAL_END_BULK,
  RESET_UPDATE_MATERIAL_BULK, POST_UPDATE_MATERIAL_ERROR_BULK
}
  from "constants/bmdashboard/materialsConstants"

const initialState = {
  loading: false,
  result: null,
  error: undefined
};

export const bmUpdateMaterialsBulkReducer = (state = initialState, action) => {
  switch (action.type) {
    case POST_UPDATE_MATERIAL_START_BULK:
      return {
        loading: true
      };
    case POST_UPDATE_MATERIAL_END_BULK:
      return {
        result: action.payload,
        loading: false,
        error: false
      };
    case POST_UPDATE_MATERIAL_ERROR_BULK:
      return {
        result: action.payload,
        loading: false,
        error: true
      };
    case RESET_UPDATE_MATERIAL_BULK:
      return { ...initialState }

    default:
      return state;
  }
};