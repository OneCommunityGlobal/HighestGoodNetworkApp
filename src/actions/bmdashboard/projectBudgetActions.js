import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';

// Plain async helpers (no Redux state): they return the axios response, or the error
// response so callers can branch on status.
const toResponse = err => err.response || { status: 0, data: { message: err.message } };

export const fetchProjectBudget = async projectId =>
  axios.get(ENDPOINTS.BM_PROJECT_BUDGET(projectId)).catch(toResponse);

export const saveProjectBudget = async (projectId, body) =>
  axios.put(ENDPOINTS.BM_PROJECT_BUDGET(projectId), body).catch(toResponse);
