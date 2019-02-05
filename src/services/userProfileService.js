
import httpService from "./httpService"

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


  export function updatePassword(userId, newpassworddata) {

    return httpService.patch(`${APIEndPoint}/${userId}/updatePassword`,newpassworddata);


  }