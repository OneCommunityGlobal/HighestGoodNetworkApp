import httpService from './httpService'

const ApiEndpoint = `${process.env.REACT_APP_APIENDPOINT}/projects`; 


export function getAllProjects()
{   
    return httpService.get(`${ApiEndpoint}`)
}