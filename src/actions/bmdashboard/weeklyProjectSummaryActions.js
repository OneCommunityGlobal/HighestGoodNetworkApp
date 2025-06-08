import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { GET_ERRORS } from '../../constants/errors';

import {
  SET_PROJECT_FILTER,
  SET_DATE_RANGE_FILTER,
  SET_COMPARISON_PERIOD_FILTER,
  GET_PROJECTS,
  GET_COST_BREAKDOWN,
} from '../../constants/bmdashboard/weeklyProjectSummaryConstants';

export const setProjectFilter = project => ({
  type: SET_PROJECT_FILTER,
  payload: project,
});

export const setDateRangeFilter = dateRange => ({
  type: SET_DATE_RANGE_FILTER,
  payload: dateRange,
});

export const setComparisonPeriodFilter = comparisonPeriod => ({
  type: SET_COMPARISON_PERIOD_FILTER,
  payload: comparisonPeriod,
});

// Action creator
export const setCostBreakdown = payload => {
  return {
    type: GET_COST_BREAKDOWN,
    payload,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};

export const setProjects = payload => {
  return {
    type: GET_PROJECTS,
    payload,
  };
};

export const fetchProjects = () => {
  return async dispatch => {
    axios
      .get(ENDPOINTS.PROJECTS)
      .then(res => {
        dispatch(setProjects(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
};

export const fetchPlannedCostBreakdown = () => {
  return async dispatch => {
    axios
      .get(ENDPOINTS.BM_COST_BREAKDOWN_BY_PROJECT)
      .then(res => dispatch(setCostBreakdown(res.data)))
      .catch(err => dispatch(setErrors(err)));
  };
};
