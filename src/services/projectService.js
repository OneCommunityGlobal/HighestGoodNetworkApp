import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const ApiUri = `${ApiEndpoint}/projects`;

// eslint-disable-next-line import/prefer-default-export
export function getAllProjects() {
  return httpService.get(`${ApiUri}`);
}
