import {
  GET_MAP_ORGS,
  GET_MAP_ORG_DETAILS,
} from '../../constants/bmdashboard/orgLocationConstants';

const initialState = {
  projects: [],
  projectDetails: null,
  loading: true,
};
// eslint-disable-next-line default-param-last
export default function orgLocationReducer(state = initialState, action) {
  switch (action.type) {
    case GET_MAP_ORGS:
      return {
        ...state,
        projects: action.payload,
        loading: false,
      };
    case GET_MAP_ORG_DETAILS:
      return {
        ...state,
        projectDetails: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}
