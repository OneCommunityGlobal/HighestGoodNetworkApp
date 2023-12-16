// eslint-disable-next-line default-param-last,import/prefer-default-export
export const userTeamMembersReducer = (teamMembers = null, action) => {
  // eslint-disable-next-line no-debugger
  debugger;
  if (action.type === 'GET_USER_TEAM_MEMBERS') {
    return action.payload;
  }

  return teamMembers;
};
