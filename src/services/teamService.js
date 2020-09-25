import httpService from './httpService';
import { ENDPOINTS } from '../utils/URL';

const ApiEndpoint = `${process.env.REACT_APP_APIENDPOINT}/team`;


export function getAllTeams() {
  return httpService.get(`${ApiEndpoint}`);
}

export function getTeamUsers(teamId) {
  // return httpService.get(`${ApiEndpoint}/${teamId}/users`);
  return httpService.get(ENDPOINTS.TEAM_USERS(teamId));
}
