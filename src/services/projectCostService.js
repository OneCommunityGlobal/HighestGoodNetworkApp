import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const ApiUri = `${ApiEndpoint}/`;

const getProjectCosts = projectId => {
  return httpService.get(`${ApiUri}/project/${projectId}/costs`);
};

const getProjectPredictions = projectId => {
  return httpService.get(`${ApiUri}/project/${projectId}/predictions`);
};

export default {
  getProjectCosts,
  getProjectPredictions,
};
