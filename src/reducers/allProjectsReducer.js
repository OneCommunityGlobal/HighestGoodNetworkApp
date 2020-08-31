import * as types from './../constants/projects'

const allProjectsInital = {
  fetching: false,
  fetched: false,
  projects: [],
  status: 404
}

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties
  };
};

export const allProjectsReducer = (allProjects = allProjectsInital, action) => {

  switch (action.type) {
    case types.FETCH_PROJECTS_START:
      return { ...allProjects, fetching: true, status: "200" }
      break;
    case types.FETCH_PROJECTS_ERROR:
      console.log("Reducers error", action.payload);
      return { ...allProjects, fetching: false, status: action.payload }
      break
    case types.RECEIVE_PROJECTS:
      //console.log("Reducers projects", action.payload);
      return updateObject(allProjects, {
        projects: action.payload,
        fetching: false,
        fetched: true,
        status: "200"
      });
      break;
    case types.ADD_NEW_PROJECT:
      console.log("PAYLOAD ADD", action.payload, action.status)
      if (action.status === 201) {
        return { ...allProjects, projects: [action.payload, ...allProjects.projects] };
      } else {
        return { ...allProjects, status: action.status };
      }
      break;
    case types.DELETE_PROJECT:
      if (action.status === 200) {
        let index = allProjects.projects.findIndex(project => project._id == action.projectId);
        return updateObject(allProjects, {
          projects: Object.assign([...allProjects.projects.slice(0, index), ...allProjects.projects.slice(index + 1)])
        }
        );
      }
      break;
    case types.UPDATE_PROJECT:
      let index = allProjects.projects.findIndex(project => project._id == action.projectId);
      return updateObject(allProjects, {
        projects: Object.assign([...allProjects.projects.slice(0, index), {
          _id: action.projectId,
          isActive: action.isActive,
          projectName: action.projectName
        }, ...allProjects.projects.slice(index + 1)])
      });


  }
  return allProjects
};
