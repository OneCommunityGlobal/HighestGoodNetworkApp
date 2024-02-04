export const GET_LEADERBOARD_DATA = 'GET_LEADERBOARD_DATA';

export const GET_ORG_DATA = 'GET_ORG_DATA';

export const getLeaderBoardData = data => ({
  type: GET_LEADERBOARD_DATA,
  payload: data,
});

export const getOrgData = data => ({
  type: GET_ORG_DATA,
  payload: data,
});
