import GET_BM_PROJECT_BY_ID from "constants/bmdashboard/projectConstants"

export const bmProjectByIdReducer = (project = null, action) => {
  if(action.type === GET_BM_PROJECT_BY_ID) {
    return action.payload
  }
  return project
}
