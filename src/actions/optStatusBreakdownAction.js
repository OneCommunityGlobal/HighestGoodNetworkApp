import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { GET_OPT_STATUS_BREAKDOWN } from '../constants/optStatusBreakdownConstants';

export const setOptStatusBreakdown = payload => ({
  type: GET_OPT_STATUS_BREAKDOWN,
  payload,
});

export const fetchOptStatusBreakdown = (startDate = '', endDate = '', role = '') => {
  const url = ENDPOINTS.OPT_STATUS_BREAKDOWN(startDate, endDate, role);

  return async dispatch => {
    try {
      const response = await axios.get(url);
      dispatch(setOptStatusBreakdown(response.data.breakDown));
      return response.data;
    } catch (err) {
      return err?.response?.data || { message: 'Failed to fetch OPT status breakdown' };
    }
  };
};

export default fetchOptStatusBreakdown;
