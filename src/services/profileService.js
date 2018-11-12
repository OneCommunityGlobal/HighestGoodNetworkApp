
import httpService from "./httpervice"

//const APIEndPoint = `${process.env.REACT_APP_APIENDPOINT}/userprofile`;
const APIEndPoint = `https://hgn-rest-dev.herokuapp.com/api/userprofile`; 


  export function getUserProfile(userId) 
  {
    return httpService.get(`${APIEndPoint}/${userId}`)
  }
  
  export function getUserData(userId)
  {   
  }

  export function editUserProfileData(user, userId)
  {
  }

  export function postUserProfileData(user)
  {
  }