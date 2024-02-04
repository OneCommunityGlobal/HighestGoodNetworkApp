export const teamMembershipReducer = (members = null, action) => {
  if (action.type === 'GET_TEAM_MEMBERSHIP') {
    return action.payload;
  }

  return members;
};
