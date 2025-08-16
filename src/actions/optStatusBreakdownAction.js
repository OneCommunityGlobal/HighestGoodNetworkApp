/* eslint-disable no-console */
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { GET_ERRORS } from '../constants/errors';
import { GET_OPT_STATUS_BREAKDOWN } from '../constants/optStatusBreakdownConstants';

export const setOptStatusBreakdown = payload => {
  return {
    type: GET_OPT_STATUS_BREAKDOWN,
    payload
  };
};
export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  };
}
export const fetchOptStatusBreakdown = (startDate = "", endDate = "", role = "") => {
  const url = ENDPOINTS.OPT_STATUS_BREAKDOWN(startDate, endDate, role);
  return async dispatch => {
    try {
      const response = await axios.get(url);
      dispatch(setOptStatusBreakdown(response.data.breakDown));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching OPT status breakdown:", error);
    }
  };
};

export default fetchOptStatusBreakdown;