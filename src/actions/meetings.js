import httpService from '../services/httpService';
import { ENDPOINTS } from '../utils/URL';

export const postMeeting = meeting => {
  const url = ENDPOINTS.MEETING_POST();
  return async dispatch => {
    try {
      const res = await httpService.post(url, meeting);
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Failed to schedule meeting (status ${res.status})`);
      }
      return res.data;
    } catch (e) {
      const responseData = e.response?.data;
      let message =
        (typeof responseData === 'object' && responseData?.message) ||
        (typeof responseData === 'string' && responseData) ||
        e.message ||
        'Failed to schedule meeting. Please try again.';

      if (e.response?.status === 401) {
        message =
          'Unauthorized (401). Log out, clear site data, and log in again while the local backend is running.';
      } else if (e.response?.status === 404) {
        message =
          'Meeting scheduling is not available on this server (POST /api/meetings/new returned 404). ' +
          'Run the backend with PR #1677 (Gopika_Fix_Bell_notification_for_meetings branch) locally, ' +
          'or point REACT_APP_APIENDPOINT to that backend.';
      }

      throw new Error(message);
    }
  };
};
