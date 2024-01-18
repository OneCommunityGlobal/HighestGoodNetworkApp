import {GET_MATERIAL_TYPES , GET_TOOL_TYPES , GET_CONSUMABLE_TYPES} from "constants/bmdashboard/inventoryTypeConstants";

export const bmInvTypeReducer = (types = [], action) => {
  if(action.type === GET_MATERIAL_TYPES || action.type === GET_TOOL_TYPES|| action.type === GET_CONSUMABLE_TYPES) {
    return action.payload
  }
  return types
}