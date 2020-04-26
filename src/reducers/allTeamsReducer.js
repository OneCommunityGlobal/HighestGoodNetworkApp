export const allTeamsReducer = (allTeams = null, action) => {
  if (action.type === 'GET_ALL_TEAMS') {
    return action.payload;
  }

  return allTeams;
};
