import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

// const ApiEndpoint = `https://hgn-rest-dev.herokuapp.com/api/dashboard`;
const ApiUri = `${ApiEndpoint}/dashboard`;

const getLeaderboardData = userId => httpService.get(`${ApiUri}/leaderboard/${userId}`);

export default getLeaderboardData;
