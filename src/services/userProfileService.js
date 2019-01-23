
import httpService from "./httpervice"

const APIEndPoint = `${process.env.REACT_APP_APIENDPOINT}/userprofile`;


  export function getUserProfile(userId) 
  {
    return httpService.get(`${APIEndPoint}/${userId}`)
  }
  
  export function editUserProfileData(userId, data)
  {
    return httpService.put(`${APIEndPoint}/${userId}`,data);
  }
  

  export function postUserProfileData(data)
  {
    return httpService.post(APIEndPoint, data)
  }



  export function updatePassword(userId, newpassworddata) {

    return httpService.patch(`${APIEndPoint}/${userId}/updatePassword`,newpassworddata);


  }