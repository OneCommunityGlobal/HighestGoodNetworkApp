import * as types  from './../constants/projects'
export const allProjectsReducer = (allProjects = null, action) => {

  if (action.type === types.GET_ALL_PROJECTS) {
    return {"projects":action.payload, "status":action.status};
  }else if (action.type === types.ADD_NEW_PROJECT) {
    console.log("Status from reducer ",action.status);
    if(action.status===201){
      allProjects.projects = [action.payload,...allProjects.projects];
    }
    return {"projects":allProjects.projects , "status":action.status};
  }else if(action.type === types.DELETE_PROJECT){
    if(action.status===200){
      let index = allProjects.projects.findIndex(project => project._id == action.projectId);
      allProjects.projects = [...allProjects.projects.slice(0,index),...allProjects.projects.slice(index+1)];
    }
    return {"projects":allProjects.projects , "status":action.status};

  }
  return allProjects;
};
