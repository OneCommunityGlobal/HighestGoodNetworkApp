import { ENDPOINTS } from '../utils/URL';
import { SET_TIMELOG_REFRESH } from '../constants/timeLogRefresh';
import axios from 'axios';

export const getTimeData = (userId) => {
  const url = ENDPOINTS.TIME(userId);
  return async (dispatch) => {
    try {
      const res = await axios.get(url);
      if (res.status === 200) {
        dispatch(setTimer({ isWorking: res.data.isWorking, seconds: res.data.seconds }));
      } else {
        dispatch(setTimer({ isWorking: false, seconds: 0 }));
      }
    } catch (e) {
      dispatch(setTimer({ isWorking: false, seconds: 0 }));
    }
  };
};

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
