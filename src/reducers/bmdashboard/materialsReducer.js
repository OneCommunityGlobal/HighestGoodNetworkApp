import { SET_MATERIALS } from "constants/bmdashboard/materialsConstants"

// const materialsDefaultState = {
//   materials: []
// }

const defaultState = []

export const materialsReducer = (materials = defaultState, action) => {
  if(action.type === SET_MATERIALS) {
    // return {
    //   ...materialsDefaultState,
    //   materials: action.payload
    // }
    return action.payload
  }
  return materials
}