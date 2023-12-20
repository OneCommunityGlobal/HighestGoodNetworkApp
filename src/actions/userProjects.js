import axios from 'axios';
import { GET_USER_PROJECTS, GET_USER_WBS } from '../constants/userProjects';
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

export const getUserWBSs = userId => {
  const url = ENDPOINTS.WBS_USER(userId);
  return async dispatch => {
    const res = await axios.get(url);
    if (res.status === 200) {
      await dispatch(setUserWBSs(res.data));
    }
  };
};


export const setUserProjects = data => ({
  type: GET_USER_PROJECTS,
  payload: data,
});

export const setUserWBSs = data => ({
  type: GET_USER_WBS,
  payload: data,
});
