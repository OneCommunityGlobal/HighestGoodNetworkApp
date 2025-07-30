import httpService from './httpService';
import { ENDPOINTS } from '../utils/URL';

const ApiUri = ENDPOINTS.APPLICANT_VOLUNTEER_RATIO;

export function getAllApplicantVolunteerRatios() {
  return httpService.get(ApiUri);
}

export function getApplicantVolunteerRatioById(id) {
  return httpService.get(`${ApiUri}/${id}`);
}

export function createApplicantVolunteerRatio(data) {
  return httpService.post(ApiUri, data);
}

export function updateApplicantVolunteerRatio(id, data) {
  return httpService.put(`${ApiUri}/${id}`, data);
}

export function deleteApplicantVolunteerRatio(id) {
  return httpService.delete(`${ApiUri}/${id}`);
}
