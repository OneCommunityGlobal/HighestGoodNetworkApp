export const projectMembershipReducer = (members = null, action) => {
  if (action.type === 'GET_PROJECT_MEMBERSHIP') {
    return action.payload;
  }

  return members;
};
