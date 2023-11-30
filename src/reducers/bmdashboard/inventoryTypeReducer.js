import GET_MATERIAL_TYPES from "constants/bmdashboard/inventoryTypeConstants";

export const bmInvTypeReducer = (types = [], action) => {
  if(action.type === GET_MATERIAL_TYPES) {
    return action.payload
  }
  return types
}