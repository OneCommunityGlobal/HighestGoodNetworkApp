import GET_BM_PROJECT_MEMBERS, {
  GET_BM_PROJECT_MEMBERS_REQUEST,
  GET_BM_PROJECT_MEMBERS_FAILURE,
} from '~/constants/bmdashboard/projectMemberConstants';

const initialState = {
  members: [],
  projectId: null,
  requestId: null,
  status: 'idle',
  error: null,
  byProject: {},
};

// eslint-disable-next-line default-param-last
export const bmProjectMemberReducer = (state = initialState, action) => {
  const { projectId, requestId } = action.meta || {};
  switch (action.type) {
    case GET_BM_PROJECT_MEMBERS_REQUEST: {
      const entry = {
        members: state.byProject[projectId]?.members || [],
        status: 'loading',
        error: null,
        requestId,
      };
      return {
        ...state,
        ...entry,
        projectId,
        byProject: { ...state.byProject, [projectId]: entry },
      };
    }
    case GET_BM_PROJECT_MEMBERS:
    case GET_BM_PROJECT_MEMBERS_FAILURE: {
      const previous = state.byProject[projectId];
      // Ignore superseded requests, including older retries for the same project.
      if (!previous || previous.requestId !== requestId) return state;
      const failed = action.type === GET_BM_PROJECT_MEMBERS_FAILURE;
      const entry = {
        ...previous,
        members: failed ? previous.members : action.payload,
        status: failed ? 'error' : action.payload.length ? 'success' : 'empty',
        error: failed ? action.payload : null,
      };
      return {
        ...state,
        ...(state.projectId === projectId && state.requestId === requestId ? entry : {}),
        byProject: { ...state.byProject, [projectId]: entry },
      };
    }
    default:
      return state;
  }
};

export default bmProjectMemberReducer;
