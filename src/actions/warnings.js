import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import { getWarningByUserId, postWarningsByUserId } from '../constants/warning';

export const getWarningsByUserId = userId => {
  const url = ENDPOINTS.GET_WARNINGS_BY_USER_ID(userId);

  return async dispatch => {
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
      }
    });
    // console.log('res', res.data);
    await dispatch(getWarningByUserId(res.data));
  };
};

export const postWarningByUserId = warningData => {
  const { userId } = warningData;
  const url = ENDPOINTS.POST_WARNINGS_BY_USER_ID(userId);

  // const data = { userId, iconId, color, dateAssigned };
  // console.log('url ', url);
  return async dispatch => {
    // console.log('posting called');
    const res = await axios.post(url, warningData).catch(error => {
      if (error.status === 401) {
      }
    });

    console.log('res inside of warnigns js', res);

    await dispatch(postWarningsByUserId(res.data));
  };
};
