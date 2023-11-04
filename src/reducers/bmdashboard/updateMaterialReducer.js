import {
  POST_UPDATE_MATERIAL_START, POST_UPDATE_MATERIAL_END,
  RESET_UPDATE_MATERIAL, POST_UPDATE_MATERIAL_ERROR
}
  from "constants/bmdashboard/materialsConstants"

const initialState = {
  loading: false,
  result: null,
  error: undefined
};

export const bmUpdateMaterialsReducer = (state = initialState, action) => {
  switch (action.type) {
    case POST_UPDATE_MATERIAL_START:
      return {
        loading: true
      };
    case POST_UPDATE_MATERIAL_END:
      return {
        result: action.payload,
        loading: false,
        error: false
      };
    case POST_UPDATE_MATERIAL_ERROR:
      return {
        result: action.payload,
        loading: false,
        error: true
      };
    case RESET_UPDATE_MATERIAL:
      return { ...initialState }

    default:
      return state;
  }
};