
import httpService from "./httpervice"

//const APIEndPoint = `https://hgn-rest-dev.herokuapp.com/api/userprofile`; 
const APIEndPoint = `${process.env.REACT_APP_APIENDPOINT}/userprofile`;


  export function getUserProfile(userId) 
  {
    return httpService.get(`${APIEndPoint}/${userId}`)
  }
  
  export function editUserProfileData(user, userId)
  {
  }

  export function postUserProfileData(user)
  {
  }