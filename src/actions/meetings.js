// check actions/timeEntries.js
import axios from 'axios';
import moment from 'moment';
import { ENDPOINTS } from '../utils/URL';

export const postMeeting = meeting => {
  const url = ENDPOINTS.MEETING_POST();
  console.log('URL:', url);
  return async dispatch => {
    try {
      console.log('1');
      const res = await axios.post(url, meeting);
      console.log('2');
      return res.status;
    } catch (e) {
      console.log('3');
      return e.response.status;
    }
  };
};