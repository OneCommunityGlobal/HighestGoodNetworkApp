import * as actions from '../constants/inventoryMaterial';

const initialState = {
  materials: [],
  loading: false,
  materialsfetchError: null,
  logMaterialsResult: { success: null, error: null }
};

export const inventoryMaterialsCollectionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.RESET_MATERIALS_BY_PROJ_CHECKINOUT:
      return {
        ...initialState,
        logMaterialsResult: { ...initialState.logMaterialsResult }
      };
    case actions.FETCH_MATERIALS_BY_PROJ_CHECKINOUT_BEGIN:
      return {
        ...state,
        loading: true,
        materialsfetchError: null,
        logMaterialsResult: null
      };

    case actions.FETCH_MATERIALS_BY_PROJ_CHECKINOUT_SUCCESS:
      return {
        ...state,
        loading: false,
        materials: action.payload.result
      };

    case actions.FETCH_MATERIALS_BY_PROJ_CHECKINOUT_ERROR:
      return {
        ...state,
        loading: false,
        materialsfetchError: action.payload.error
      };
    case actions.POSTED_LOG_MATERIALS_RESULT:
      if (action.payload?.status == 200)
        return {
          ...state,
          logMaterialsResult: { success: action.payload.data.result }
        }
      else
        return {
          ...state,
          logMaterialsResult: { error: "Oops! Some error occurred on Log Materials Request : " + action.payload?.response?.statusText }
        }
    default:
      return state;
  }
};
