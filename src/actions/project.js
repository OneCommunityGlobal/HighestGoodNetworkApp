import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import { GET_PROJECT_BY_ID } from '../constants/project';

export const getProjectDetail = projectId => {
  const url = ENDPOINTS.PROJECT_BY_ID(projectId);
  return async dispatch => {
    let loggedOut = false;
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
        loggedOut = true;
      }
    });
    if (!loggedOut) {
      await dispatch(setProjectDetail(res.data));
    }
  };
};

export const setProjectDetail = data => ({
  type: GET_PROJECT_BY_ID,
  payload: data,
});
