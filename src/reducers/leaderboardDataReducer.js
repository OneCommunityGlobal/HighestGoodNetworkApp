export const leaderboardDataReducer = (leaderboardData = null, action) => {
  if (action.type === 'GET_LEADERBOARD_DATA') {
    return action.payload;
  }

  return leaderboardData;
};
