import httpService from './httpervice'

const ApiEndpoint = `${process.env.REACT_APP_APIENDPOINT}/dashboard`;


export function getLeaderboardData(userId)
{
console.log(ApiEndpoint)  
console.log(process.env)  
return httpService.get(`${ApiEndpoint}/leaderboard/${userId}`)

}
