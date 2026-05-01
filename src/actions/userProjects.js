import axios from 'axios';
import { toast } from 'react-toastify';
import types from '../constants/userProjects';
import { ENDPOINTS } from '~/utils/URL';

export const setUserProjects = data => ({
  type: types.GET_USER_PROJECTS,
  payload: data,
});

export const getUserProjects = userId => {
  const url = ENDPOINTS.USER_PROJECTS(userId);
  return async dispatch => {
    const res = await axios.get(url).catch(err => {
      if (err.status !== 401) {
        toast.info('err.message', err.message);
      }
    });
    if (res) {
      await dispatch(setUserProjects(res.data));
    }
  };
};
