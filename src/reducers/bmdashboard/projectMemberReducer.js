import GET_BM_PROJECT_MEMBERS from "constants/bmdashboard/projectMemberConstants"

export const bmProjectMemberReducer = (materials = [], action) => {
  if(action.type === GET_BM_PROJECT_MEMBERS) {
    return action.payload
  }
  return materials
}