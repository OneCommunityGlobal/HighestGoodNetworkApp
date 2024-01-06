import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const ApiUri = `${ApiEndpoint}/informations`;

export function getInformations() {
  return httpService.get(`${ApiUri}`);
}
export function addInformation(data) {
  return httpService.post(`${ApiUri}`, data);
}
