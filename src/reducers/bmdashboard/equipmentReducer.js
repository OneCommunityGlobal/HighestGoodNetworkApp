import { GET_EQUIPMENT_BY_ID, SET_EQUIPMENTS } from "constants/bmdashboard/equipmentConstants";

const defaultState = []

export const equipmentReducer = (state = defaultState, action) => {
  switch (action.type) {
    case GET_EQUIPMENT_BY_ID:
    case SET_EQUIPMENTS:
      return action.payload;
    default:
      return state; // Return the current state for unknown actions
  }
};