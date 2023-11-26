import { SET_TOOLS } from "constants/bmdashboard/toolsConstants"

const defaultState = []

export const toolsReducer = (tools = defaultState, action) => {
  if(action.type === SET_TOOLS) {
    return action.payload
  }
  return tools
}