import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import GET_BM_PROJECT_MEMBERS, {
  GET_BM_PROJECT_MEMBERS_REQUEST,
  GET_BM_PROJECT_MEMBERS_FAILURE,
} from '~/constants/bmdashboard/projectMemberConstants';

let nextRequestId = 0;
// Scope pending requests to the Redux store, including separate test stores.
const pendingByStore = new WeakMap();

export const setProjectMembers = (payload, projectId, requestId) => ({
  type: GET_BM_PROJECT_MEMBERS,
  payload,
  meta: { projectId, requestId },
});

export const fetchBMProjectMembers = projectId => (dispatch, getState) => {
  let pending = pendingByStore.get(getState);
  if (!pending) {
    pending = new Map();
    pendingByStore.set(getState, pending);
  }

  const existing = pending.get(projectId);
  if (existing) {
    // A switch back to a project with a pending request selects that request.
    dispatch({ type: GET_BM_PROJECT_MEMBERS_REQUEST, meta: existing.meta });
    return existing.promise;
  }

  nextRequestId += 1;
  const meta = { projectId, requestId: nextRequestId };
  dispatch({ type: GET_BM_PROJECT_MEMBERS_REQUEST, meta });
  const request = { meta, promise: null };
  pending.set(projectId, request);
  request.promise = (async () => {
    try {
      const response = await axios.get(ENDPOINTS.BM_PROJECT_MEMBERS(projectId));
      const members = response.data?.members;
      if (!Array.isArray(members)) {
        throw new Error('The server returned invalid project member data.');
      }
      dispatch(setProjectMembers(members, projectId, meta.requestId));
      return { status: members.length ? 'success' : 'empty', members, projectId };
    } catch (error) {
      const message =
        error.response?.data?.message || error.response?.data?.error || error.message;
      const usableMessage =
        typeof message === 'string' && message.trim()
          ? message
          : 'Unable to load project members.';
      dispatch({ type: GET_BM_PROJECT_MEMBERS_FAILURE, payload: usableMessage, meta });
      return { status: 'error', error: usableMessage, projectId };
    } finally {
      pending.delete(projectId);
    }
  })();
  return request.promise;
};
