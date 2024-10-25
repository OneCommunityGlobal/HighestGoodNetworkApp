import {
  GET_EQUIPMENT_BY_ID,
  SET_EQUIPMENTS,
} from 'constants/bmdashboard/equipmentConstants';

const defaultState = {
  equipmentslist: [],
  singleEquipment: {},
};

// eslint-disable-next-line default-param-last
export default function equipmentReducer(state = defaultState, action) {
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
    default:
      return state;
  }
}
