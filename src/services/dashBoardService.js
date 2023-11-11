import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

// const ApiEndpoint = `https://hgn-rest-dev.herokuapp.com/api/dashboard`;
const ApiUri = `${ApiEndpoint}/dashboard`;

export function getLeaderboardData(userId) {
  return httpService.get(`${ApiUri}/leaderboard/${userId}`);
}
