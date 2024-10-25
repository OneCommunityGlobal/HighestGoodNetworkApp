// eslint-disable-next-line default-param-last
export function leaderboardDataReducer(leaderBoardData = [], action) {
  if (action.type === 'GET_LEADERBOARD_DATA') {
    return action.payload;
  }

  return leaderBoardData;
}

// eslint-disable-next-line default-param-last
export function orgDataReducer(orgData = {}, action) {
  if (action.type === 'GET_ORG_DATA') {
    return action.payload;
  }

  return orgData;
}
