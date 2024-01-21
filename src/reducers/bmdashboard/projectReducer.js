import GET_BM_PROJECTS from "constants/bmdashboard/projectConstants"

export const bmProjectReducer = (materials = [], action) => {
  if(action.type === GET_BM_PROJECTS) {
    return action.payload
  }
  return materials
}