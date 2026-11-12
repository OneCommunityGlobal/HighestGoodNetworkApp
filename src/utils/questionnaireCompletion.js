import httpService from '../services/httpService';
import { ENDPOINTS } from './URL';

/**
 * Returns a Set of user ids that have submitted the HGN questionnaire.
 * The ranked endpoint (without filters) lists every questionnaire response.
 */
export const fetchCompletedQuestionnaireUserIds = async () => {
  const response = await httpService.get(ENDPOINTS.HGN_FORM_RANKED);
  const responses = Array.isArray(response?.data) ? response.data : [];
  return new Set(responses.map(r => r.userId?.toString()).filter(Boolean));
};

export default fetchCompletedQuestionnaireUserIds;
