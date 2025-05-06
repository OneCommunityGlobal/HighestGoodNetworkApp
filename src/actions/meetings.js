// check actions/timeEntries.js
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

// eslint-disable-next-line import/prefer-default-export
export const postMeeting = meeting => {
  const url = ENDPOINTS.MEETING_POST();
  return async () => {
    try {
      const res = await axios.post(url, meeting);
      return res.status;
    } catch (e) {
      return e.response.status;
    }
  };
};
