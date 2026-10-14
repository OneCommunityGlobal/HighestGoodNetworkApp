import {
  GET_PROJECTS_WITH_LOCATION,
  GET_PROJECT_LOCATION_DETAILS,
} from '../../actions/bmdashboard/projectLocationActions';

const initialState = {
  projects: [],
  projectDetails: null,
  loading: true,
};

// eslint-disable-next-line default-param-last
export default function projectLocationReducer(state = initialState, action) {
  switch (action.type) {
    case GET_PROJECTS_WITH_LOCATION:
      return {
        ...state,
        projects: action.payload,
        loading: false,
      };
    case GET_PROJECT_LOCATION_DETAILS:
      return {
        ...state,
        projectDetails: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}
