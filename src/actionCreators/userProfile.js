export const GET_USER_PROFILE = 'GET_USER_PROFILE'
export const CLEAR_USER_PROFILE = 'CLEAR_USER_PROFILE'

export const getUserProfile = data => ({
  type: GET_USER_PROFILE,
  payload: data
})
