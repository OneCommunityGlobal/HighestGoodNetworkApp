import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import { getWarningByUserId } from '../constants/warning';

export const getWarningsByUserId = userId => {
  const url = ENDPOINTS.GET_WARNINGS(userId);

  console.log('URL', url);
  return async dispatch => {
    console.log('dispatch', dispatch);
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
      }
    });
    console.log('res', res.data);
    await dispatch(getWarningByUserId(res.data));
  };
};
