import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

// const ApiEndpoint = `https://hgn-rest-dev.herokuapp.com/api/dashboard`;
const ApiUri = `${ApiEndpoint}/dashboard`;

// eslint-disable-next-line import/prefer-default-export
export function getLeaderboardData(userId) {
  return httpService.get(`${ApiUri}/leaderboard/${userId}`);
}
