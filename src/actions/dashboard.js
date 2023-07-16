import httpService from '../services/httpService';
import { ENDPOINTS } from '../utils/URL';
import axios from 'axios';
import { getDashboardLayLoad as getDashboardDataPayLoad } from '../constants/dashBoardActions'

export const getDashboardData = () => {
  console.log('getDashboard');
  const url = ENDPOINTS.DASHBOARD;
  console.log('URL', url);
  return async dispatch => {
    const res = await axios.get(url)
    await dispatch(getDashboardLayLoad(res.data));
  };
};

export const updateDashboardData = (userId) => {
  console.log(ENDPOINTS.DASHBOARD + '/' + userId);
  const updateDashboardData = axios.put(ENDPOINTS.DASHBOARD + '/' + userId);
  return async dispatch => {
    updateDashboardData.then(res => {
      dispatch(res);
      console.log(res);
    });
  };
};
