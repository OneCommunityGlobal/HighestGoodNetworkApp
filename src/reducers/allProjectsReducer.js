export const allProjectsReducer = (allProjects = null, action) => {
  if (action.type === 'GET_ALL_PROJECTS') {
    return action.payload
  }

  return allProjects
}
