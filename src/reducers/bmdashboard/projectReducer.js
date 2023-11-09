import { SET_BM_PROJECTS } from "constants/bmdashboard/projectConstants"

const defaultState = []

export const projectReducer = (projects = defaultState, action) => {
  if(action.type === SET_BM_PROJECTS) {
    return action.payload
  }
  return projects
}