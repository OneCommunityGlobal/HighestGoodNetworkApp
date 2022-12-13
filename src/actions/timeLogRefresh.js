import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import { SET_TIMELOG_REFRESH } from '../constants/timeLogRefresh';


//refresh time
export const refreshTime = async (userId) => {
  const url = ENDPOINTS.TIME(userId);

  try {
    const res = await axios.get(url);
    return res.status === 200 && !res.data.isWorking ? 9 : res.status;
  } catch (e) {
    return e.response.status;
  }
};

export const timeLogRefresh = (data) => ({
  type: SET_TIMELOG_REFRESH,
  payload: data,
});
