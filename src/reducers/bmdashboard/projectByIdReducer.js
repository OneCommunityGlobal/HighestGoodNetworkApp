import GET_BM_PROJECT_BY_ID from "constants/bmdashboard/projectConstants";

// eslint-disable-next-line default-param-last
export default function bmProjectByIdReducer(project = null, action) {
  if (action.type === GET_BM_PROJECT_BY_ID) {
    return action.payload;
  }
  return project;
}
