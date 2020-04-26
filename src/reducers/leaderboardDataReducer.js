export const leaderboardDataReducer = (leaderBoardData = [], action) => {
	if (action.type === 'GET_LEADERBOARD_DATA') {
		return action.payload
	}

	return leaderBoardData
}
