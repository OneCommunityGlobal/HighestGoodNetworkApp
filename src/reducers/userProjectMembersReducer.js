// eslint-disable-next-line default-param-last
export default function userProjectMembersReducer(projectMembers = null, action) {
  if (action.type === 'GET_USER_PROJECT_MEMBERS') {
    return action.payload;
  }

  return projectMembers;
}
