
import httpService from "./httpervice"

const APIEndPoint = `${process.env.REACT_APP_APIENDPOINT}/userprofile`

  export function getUserProfile(userId) {

    return httpService.get(`${APIEndPoint}/${userId}`)

  }
  