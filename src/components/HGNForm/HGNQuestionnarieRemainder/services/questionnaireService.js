import axios from 'axios';

export const getQuestionnaireStatus = async userId => {
  const response = await axios.get('/api/hgnform/questionnaire/status', {
    params: userId ? { userId } : {},
  });

  return response.data;
};
