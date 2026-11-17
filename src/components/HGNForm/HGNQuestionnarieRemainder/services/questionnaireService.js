import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';

export const getQuestionnaireStatus = async userId => {
  const response = await axios.get(ENDPOINTS.QUESTIONNAIRE_STATUS, {
    params: userId ? { userId } : {},
  });

  return response.data;
};
