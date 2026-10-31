import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

// ApiEndpoint already includes the `/api` segment, so it must NOT carry a
// trailing slash here — otherwise requests resolve to `/api//project/...`
// (the double-slash bug that made the cost/prediction endpoints 404).
const ApiUri = ApiEndpoint;

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
