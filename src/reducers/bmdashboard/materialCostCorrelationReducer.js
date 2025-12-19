import {
  FETCH_MATERIAL_COST_CORRELATION_REQUEST,
  FETCH_MATERIAL_COST_CORRELATION_SUCCESS,
  FETCH_MATERIAL_COST_CORRELATION_FAILURE,
  SET_MATERIAL_COST_CORRELATION_PROJECT_FILTER,
  SET_MATERIAL_COST_CORRELATION_MATERIAL_TYPE_FILTER,
  SET_MATERIAL_COST_CORRELATION_DATE_RANGE_FILTER,
  RESET_MATERIAL_COST_CORRELATION_FILTERS,
} from '../../constants/bmdashboard/materialCostCorrelationConstants';

const initialState = {
  loading: false,
  data: [],
  meta: null,
  error: null,
  filters: {
    selectedProjects: [],
    selectedMaterialTypes: [],
    startDate: null,
    endDate: null,
  },
};

// eslint-disable-next-line default-param-last
const materialCostCorrelationReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MATERIAL_COST_CORRELATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_MATERIAL_COST_CORRELATION_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload.data || [],
        meta: action.payload.meta || null,
        error: null,
      };

    case FETCH_MATERIAL_COST_CORRELATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        data: [],
        meta: null,
      };

    case SET_MATERIAL_COST_CORRELATION_PROJECT_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          selectedProjects: action.payload,
        },
      };

    case SET_MATERIAL_COST_CORRELATION_MATERIAL_TYPE_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          selectedMaterialTypes: action.payload,
        },
      };

    case SET_MATERIAL_COST_CORRELATION_DATE_RANGE_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          startDate: action.payload.startDate,
          endDate: action.payload.endDate,
        },
      };

    case RESET_MATERIAL_COST_CORRELATION_FILTERS:
      return {
        ...state,
        filters: {
          selectedProjects: [],
          selectedMaterialTypes: [],
          startDate: null,
          endDate: null,
        },
      };

    default:
      return state;
  }
};

export default materialCostCorrelationReducer;
