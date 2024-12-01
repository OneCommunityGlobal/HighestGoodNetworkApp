// check actions/timeEntries.js
import axios from 'axios';
import moment from 'moment';
import { ENDPOINTS } from '../utils/URL';

export const postMeeting = meeting => {
  const url = ENDPOINTS.MEETING_POST();
  return async dispatch => {
    try {
      const res = await axios.post(url, meeting);
      return res.status;
    } catch (e) {
      return e.response.status;
    }
  };
};