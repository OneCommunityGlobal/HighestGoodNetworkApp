export const getCurrentUser = token => {
	return {
		type: 'GET_CURRENT_USER',
		payload: token
	}
}
