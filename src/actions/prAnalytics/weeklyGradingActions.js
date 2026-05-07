import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

export const getWeeklyGrading = (teamCode, date) => async dispatch => {
  try {
    const params = { team: teamCode };
    if (date) params.date = date;

    const response = await axios.get(ENDPOINTS.WEEKLY_GRADING, { params });
    return response.data;
  } catch (error) {
    dispatch({ type: 'SET_ERROR', error: error.message });
    throw error;
  }
};

export const saveWeeklyGrading = (teamCode, date, gradings) => async dispatch => {
  try {
    const response = await axios.post(ENDPOINTS.WEEKLY_GRADING_SAVE, {
      teamCode,
      date,
      gradings,
    });
    return response.data;
  } catch (error) {
    dispatch({ type: 'SET_ERROR', error: error.message });
    throw error;
  }
};