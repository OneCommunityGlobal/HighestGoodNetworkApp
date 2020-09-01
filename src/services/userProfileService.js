import httpService from './httpService'
const APIEndPoint = `${process.env.REACT_APP_APIENDPOINT}/userProfile`

export const resetPassword = (userId, newpassworddata) => {
  return httpService.patch(`${APIEndPoint}/${userId}/resetPassword`, newpassworddata)
}

