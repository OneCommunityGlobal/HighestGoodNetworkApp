import {
  GET_EQUIPMENT_BY_ID,
  SET_EQUIPMENTS,
  UPDATE_EQUIPMENT_START,
  UPDATE_EQUIPMENT_SUCCESS,
  UPDATE_EQUIPMENT_ERROR,
} from '~/constants/bmdashboard/equipmentConstants';

const defaultState = {
  equipmentslist: [],
  singleEquipment: {},
  updateEquipment: {
    loading: false,
    error: null,
  },
};

// eslint-disable-next-line default-param-last
export const equipmentReducer = (state = defaultState, action) => {
  switch (action.type) {
    case GET_EQUIPMENT_BY_ID:
      return {
        ...state,
        singleEquipment: action.payload,
      };
    case SET_EQUIPMENTS:
      return {
        ...state,
        equipmentslist: action.payload,
      };
    case UPDATE_EQUIPMENT_START:
      return {
        ...state,
        updateEquipment: { loading: true, error: null },
      };
    case UPDATE_EQUIPMENT_SUCCESS:
      return {
        ...state,
        singleEquipment: action.payload,
        updateEquipment: { loading: false, error: null },
      };
    case UPDATE_EQUIPMENT_ERROR:
      return {
        ...state,
        updateEquipment: { loading: false, error: action.payload },
      };
    default:
      return state;
  }
};

export default equipmentReducer;
