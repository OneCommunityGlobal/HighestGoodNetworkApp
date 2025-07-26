import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { GET_ERRORS } from 'constants/errors';
import { GET_OPT_STATUS_BREAKDOWN } from 'constants/optStatusBreakdownConstants';

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
      dispatch(setOptStatusBreakdown(response.data));
    } catch (error) {
      console.error("Error fetching OPT status breakdown:", error);
    }
  };
};
// export const fetchOptStatusBreakdown = () => {
//   const url = ENDPOINTS.OPT_STATUS_BREAKDOWN;
//   return async dispatch => {
//     axios
//       .get(url)
//       .then(response => {
//         dispatch(setOptStatusBreakdown(response.data));
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   };
// };
//alisha

export default fetchOptStatusBreakdown;