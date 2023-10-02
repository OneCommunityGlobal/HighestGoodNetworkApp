import { SET_MATERIALS } from "constants/bmdashboard/materialsConstants"

const materialsDefaultState = {
  materials: []
}

export const materialsReducer = (materials = materialsDefaultState, action) => {
  if(action.type === SET_MATERIALS) {
    return {
      ...materialsDefaultState,
      materials: action.payload
    }
  }
  return materials
}