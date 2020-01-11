export const usernameReducer = (username = null, action) => {
  if (action.type === 'GET_USERNAME') {
    return action.payload
  }

  return username
}
