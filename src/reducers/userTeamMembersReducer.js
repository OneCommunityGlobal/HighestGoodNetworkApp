export const userTeamMembersReducer = (teamMembers = null, action) => {
  debugger;
  if (action.type === 'GET_USER_TEAM_MEMBERS') {
    return action.payload;
  }

  return teamMembers;
};
