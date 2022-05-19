import axios from 'axios';
import { SET_TIMER } from '../constants/timer';
import { ENDPOINTS } from '../utils/URL';

export const getTimerData = userId => {
  const url = ENDPOINTS.TIMER(userId);
  return async dispatch => {
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

export const startTimer = async (userId, seconds) => {
  const url = ENDPOINTS.TIMER(userId);

  try {
    const resGet = await axios.get(url);
    if (resGet.status === 200 && resGet.data.isWorking) {
      return 9;
    }
    const res = await axios.put(url, {
      pausedAt: seconds,
      isWorking: true,
    });
    return res.status;
  } catch (e) {
    return e.response.status;
  }
};

export const updateTimer = async userId => {
  const url = ENDPOINTS.TIMER(userId);

  try {
    const res = await axios.get(url);
    return res.status === 200 && !res.data.isWorking ? 9 : res.status;
  } catch (e) {
    return e.response.status;
  }
};

export const pauseTimer = async (userId, seconds) => {
  const url = ENDPOINTS.TIMER(userId);

  try {
    const res = await axios.put(url, {
      pausedAt: seconds,
      isWorking: false,
    });
    return res.status;
  } catch (e) {
    return e.response.status;
  }
};

export const stopTimer = userId => {
  const url = ENDPOINTS.TIMER(userId);

  return async dispatch => {
    try {
      const res = await axios.put(url, {
        pausedAt: 0,
        isWorking: false,
      });
      dispatch(setTimer({ isWorking: false, seconds: 0 }));
      return res.status;
    } catch (e) {
      return e.response.status;
    }
  };
};

export const setTimer = data => ({
  type: SET_TIMER,
  payload: data,
});
