import axios from 'axios';
import { GET_USER_PROJECTS } from '../constants/userProjects';
import { ENDPOINTS } from '../utils/URL';

export const getUserProjects = userId => {
  const url = ENDPOINTS.USER_PROJECTS(userId);
  return async dispatch => {
    const res = await axios.get(url).catch(err => {
      if (err.status !== 401) {
        console.log('err.message', err.message);
      }
    });
    if (res) {
      await dispatch(setUserProjects(res.data));
    }
  };
};

export const setUserProjects = data => ({
  type: GET_USER_PROJECTS,
  payload: data,
});

