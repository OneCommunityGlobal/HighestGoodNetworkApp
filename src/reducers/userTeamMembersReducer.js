export const userTeamMembersReducer = (teamMembers = null, action) => {
  if (action.type === 'GET_USER_TEAM_MEMBERS') {
    return action.payload;
  }

  return teamMembers;
};
