// eslint-disable-next-line default-param-last,import/prefer-default-export
export const userTeamMembersReducer = (teamMembers = null, action) => {
  debugger;
  if (action.type === 'GET_USER_TEAM_MEMBERS') {
    return action.payload;
  }

  return teamMembers;
};
