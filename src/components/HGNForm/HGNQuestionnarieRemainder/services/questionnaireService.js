import axios from 'axios';

export const getQuestionnaireStatus = async () => {
  const response = await axios.get('/api/hgnform/questionnaire/status');
  return response.data;
};
