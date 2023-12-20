// eslint-disable-next-line default-param-last
export const leaderboardDataReducer = (leaderBoardData = [], action) => {
  if (action.type === 'GET_LEADERBOARD_DATA') {
    return action.payload;
  }

  return leaderBoardData;
};

// eslint-disable-next-line default-param-last
export const orgDataReducer = (orgData = {}, action) => {
  if (action.type === 'GET_ORG_DATA') {
    return action.payload;
  }

  return orgData;
};
