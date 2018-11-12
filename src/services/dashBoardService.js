import httpService from './httpervice'

const ApiEndpoint = `https://hgn-rest-dev.herokuapp.com/api/dashboard`;
//const ApiEndpoint = `${process.env.REACT_APP_APIENDPOINT}/dashboard`; 


export function getLeaderboardData(userId)
{   
    return httpService.get(`${ApiEndpoint}/leaderboard/${userId}`)
}
