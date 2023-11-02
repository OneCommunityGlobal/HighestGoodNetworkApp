import { POST_UPDATE_MATERIAL_START, POST_UPDATE_MATERIAL_END, RESET_UPDATE_MATERIAL } from "constants/bmdashboard/materialsConstants"

const initialState = {
  loading: false,
  result: null
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
        loading: false
      };
    case RESET_UPDATE_MATERIAL:
      return { ...initialState }

    default:
      return state;
  }
};