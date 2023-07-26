export const leaderboardDataReducer = (state = [], action) => {
  if (action.type === 'GET_LEADERBOARD_DATA') {
    return action.payload;
  }

  return state;
};

export const orgDataReducer = (orgData = {}, action) => {
  if (action.type === 'GET_ORG_DATA') {
    return action.payload;
  }

  return orgData;
};
