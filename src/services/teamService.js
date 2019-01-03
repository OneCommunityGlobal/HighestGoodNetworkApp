import httpService from './httpervice'

const ApiEndpoint = `${process.env.REACT_APP_APIENDPOINT}/team`; 


export function getAllTeams()
{   
    return httpService.get(`${ApiEndpoint}`)
}
