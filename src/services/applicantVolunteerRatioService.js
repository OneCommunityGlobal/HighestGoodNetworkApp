import httpService from './httpService';
import { ENDPOINTS } from '../utils/URL';

const ApiUri = ENDPOINTS.APPLICANT_VOLUNTEER_RATIO;

export function getAllApplicantVolunteerRatios(filters = {}) {
  const { roles, startDate, endDate } = filters;
  const params = new URLSearchParams();

  if (roles) params.append('roles', roles);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = queryString ? `${ApiUri}/analytics?${queryString}` : `${ApiUri}/analytics`;

  return httpService.get(url);
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
