/* eslint-disable no-use-before-define */
import axios from 'axios';

import { ENDPOINTS } from '~/utils/URL';
import GET_BM_PROJECT_MEMBERS from '~/constants/bmdashboard/projectMemberConstants';
import { GET_ERRORS } from '~/constants/errors';

// Fetches the members of a BM project.
// Resolves to { ok: true, members } on success or { ok: false, error } on
// failure, so the caller can show its own error state and retry instead of
// relying on the global errors store.
export const fetchBMProjectMembers = projectId => {
  return async dispatch => {
    try {
      const res = await axios.get(ENDPOINTS.BM_PROJECT_MEMBERS(projectId));
      const members = res.data?.members ?? [];
      dispatch(setProjectMembers(members));
      return { ok: true, members };
    } catch (error) {
      // Clear members from a previously selected project so they are not
      // shown under the wrong project.
      dispatch(setProjectMembers([]));
      return { ok: false, error };
    }
  };
};

export const setProjectMembers = payload => {
  return {
    type: GET_BM_PROJECT_MEMBERS,
    payload,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};
