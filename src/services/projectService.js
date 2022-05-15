import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const ApiUri = `${ApiEndpoint}/projects`;

export function getAllProjects() {
  return httpService.get(`${ApiUri}`);
}
