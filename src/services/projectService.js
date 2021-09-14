import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

export function getAllProjects() {
  return httpService.get(`${ApiEndpoint}/projects`);
}
