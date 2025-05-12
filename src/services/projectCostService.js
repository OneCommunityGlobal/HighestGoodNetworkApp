import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const ApiUri = `${ApiEndpoint}/`;

const getProjectCosts = (projectId) => httpService.get(`${ApiUri}/project/${projectId}/costs`);
const getProjectPredictions = (projectId) => httpService.get(`${ApiUri}/project/${projectId}/predictions`);

export default {
  getProjectCosts,
  getProjectPredictions
}; 