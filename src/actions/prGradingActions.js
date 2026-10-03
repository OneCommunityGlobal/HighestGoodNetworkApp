import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';

export const fetchWeeklyGrading = (team, weekStart) => async () => {
  try {
    const params = new URLSearchParams();
    if (team) params.append('team', team);
    if (weekStart) params.append('weekStart', weekStart);
    const query = params.toString();
    const url = query ? `${ENDPOINTS.WEEKLY_GRADING}?${query}` : ENDPOINTS.WEEKLY_GRADING;
    const response = await axios.get(url);
    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, status: err.response?.status };
  }
};

export const saveWeeklyGrading = payload => async () => {
  try {
    const response = await axios.post(ENDPOINTS.WEEKLY_GRADING_SAVE, payload);
    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, status: err.response?.status };
  }
};

export const fetchPRGradingConfig = () => async () => {
  try {
    const response = await axios.get(ENDPOINTS.PR_GRADING_CONFIG);
    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, status: err.response?.status };
  }
};

export const deleteWeeklyGradingReviewer = (team, reviewer, weekStart) => async () => {
  try {
    const params = new URLSearchParams({ team, reviewer, weekStart });
    await axios.delete(`${ENDPOINTS.WEEKLY_GRADING_DELETE_REVIEWER}?${params.toString()}`);
    return { success: true };
  } catch (err) {
    return { success: false, status: err.response?.status };
  }
};

export const syncPRGradingReviewers = () => async () => {
  try {
    const response = await axios.post(ENDPOINTS.PR_GRADING_SYNC_REVIEWERS, {});
    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, status: err.response?.status };
  }
};
