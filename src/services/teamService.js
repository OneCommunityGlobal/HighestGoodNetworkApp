import httpService from './httpService';
import { ENDPOINTS, ApiEndpoint } from '../utils/URL';

const ApiUri = `${ApiEndpoint}/team`;

export function getAllTeams() {
  return httpService.get(`${ApiUri}`);
}

export function getTeamUsers(teamId) {
  return httpService.get(ENDPOINTS.TEAM_USERS(teamId));
}
