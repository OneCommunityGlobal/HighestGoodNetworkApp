export const projectsByUserReducer = (projects = null, action) => {
  if (action.type === 'GET_PROJECTS_BY_USER') {
    return action.payload;
  }

  return projects;
};
