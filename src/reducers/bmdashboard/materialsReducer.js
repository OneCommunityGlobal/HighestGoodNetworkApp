import { SET_MATERIALS } from "constants/bmdashboard/materialsConstants"

const defaultState = []

export const materialsReducer = (materials = defaultState, action) => {
  if(action.type === SET_MATERIALS) {
    return action.payload
  }
  return materials
}