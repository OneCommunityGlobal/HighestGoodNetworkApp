import { GET_EQUIPMENT_BY_ID, SET_EQUIPMENTS } from "constants/bmdashboard/equipmentConstants";

const defaultState = {
  equipmentslist: [],
  singleEquipment: {}
}

export const equipmentReducer = (equipments = defaultState, action) => {
  switch (action.type) {
    case GET_EQUIPMENT_BY_ID:
      {
        equipments.equipmentslist = action.payload;
        return {
          ...equipments
        }
      }
    case SET_EQUIPMENTS:
      {
        equipments.equipmentslist = action.payload;
        return {
          ...equipments
        }
      }

    default:
      return equipments; // Return the current state for unknown actions
  }
};