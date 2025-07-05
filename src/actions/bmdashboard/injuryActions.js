import axios from 'axios';
import { GET_INJURY_SEVERITY, GET_ERRORS } from 'constants/bmdashboard/injuryConstants';
import { ENDPOINTS } from '../../utils/URL';

// action creators
export const setInjurySeverity = payload => ({
  type: GET_INJURY_SEVERITY,
  payload,
});

export const setErrors = payload => ({
  type: GET_ERRORS,
  payload,
});

export const fetchInjurySeverity = (filters = {}) => {
  return async dispatch => {
    try {
      const params = {};

      if (filters.projectIds?.length) {
        params.projectIds = filters.projectIds.join(',');
      }
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }
      if (filters.types?.length) {
        params.types = filters.types.join(',');
      }
      if (filters.departments?.length) {
        params.departments = filters.departments.join(',');
      }

      const res = await axios.get(ENDPOINTS.BM_INJURY_SEVERITY, { params });
      dispatch(setInjurySeverity(res.data));
    } catch (err) {
      dispatch(setErrors(err.response?.data || err.message));
    }
  };
};
