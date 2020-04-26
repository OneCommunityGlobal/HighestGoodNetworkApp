export const projectByIdReducer = (project = null, action) => {
  if (action.type === 'GET_PROJECT_BY_ID') {
    return action.payload;
  }

  return project;
};
