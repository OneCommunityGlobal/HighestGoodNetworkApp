// eslint-disable-next-line default-param-last
const userProjectMembersReducer = (projectMembers = null, action) => {
  if (action.type === 'GET_USER_PROJECT_MEMBERS') {
    return action.payload;
  }

  return projectMembers;
};

export default userProjectMembersReducer;
