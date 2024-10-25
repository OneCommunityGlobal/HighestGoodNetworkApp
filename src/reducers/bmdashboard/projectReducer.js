import GET_BM_PROJECTS from "constants/bmdashboard/projectConstants";

// eslint-disable-next-line default-param-last
export default function bmProjectReducer(materials = [], action) {
  if (action.type === GET_BM_PROJECTS) {
    return action.payload;
  }
  return materials;
}
