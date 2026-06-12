import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

export const getWeeklyGrading = (teamCode, date, token) => async dispatch => {
  try {
    const params = { team: teamCode };
    if (date) params.date = date;

    const response = await axios.get(ENDPOINTS.WEEKLY_GRADING, {
      params,
      headers: { Authorization: `${token}` },
    });
    return response.data;
  } catch (error) {
    dispatch({ type: 'SET_ERROR', error: error.message });
    throw error;
  }
};

export const saveWeeklyGrading = (teamCode, date, gradings, token) => async dispatch => {
  try {
    const response = await axios.post(
      ENDPOINTS.WEEKLY_GRADING_SAVE,
      { teamCode, date, gradings },
      { headers: { Authorization: `${token}` } },
    );
    return response.data;
  } catch (error) {
    dispatch({ type: 'SET_ERROR', error: error.message });
    throw error;
  }
};