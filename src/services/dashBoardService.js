import httpService from './httpervice'

const ApiEndpoint = `${process.env.REACT_APP_APIENDPOINT}/dashboard`;
console.log(ApiEndpoint)  
console.log(process.env) 

export function getLeaderboardData(userId)
{
 
return httpService.get(`${ApiEndpoint}/leaderboard/${userId}`)

}
