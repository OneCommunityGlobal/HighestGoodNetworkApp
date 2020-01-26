import jwtDecode from 'jwt-decode'
import httpService from '../services/httpService'
import config from '../config.json'
import { ENDPOINTS } from '../utils/URL'

const { tokenKey } = config

export const loginUser = credentials => dispatch => {
  httpService
    .post(ENDPOINTS.LOGIN, credentials)
    .then(res => {
      if (res.data.new) {
        dispatch(setCurrentUser({ new: true, userId: res.data.userId }))
      } else {
        localStorage.setItem(tokenKey, res.data.token)
        httpService.setjwt(res.data.token)
        console.log(res.data.token)
        const decoded = jwtDecode(res.data.token)
        dispatch(setCurrentUser(decoded))
      }
    })
    .catch(err => {
      if (err.response && err.response.status === 403) {
        const errors = { email: err.response.data.message }
        dispatch(setCurrentUser({ errors }))
      }
    })
}

export const setCurrentUser = decoded => ({
  type: 'SET_CURRENT_USER',
  payload: decoded
})

export const logoutUser = () => dispatch => {
  localStorage.removeItem(tokenKey)
  httpService.setjwt(false)
  dispatch(setCurrentUser(null))
};
  