import * as types  from './../constants/projects'
export const allProjectsReducer = (allProjects = null, action) => {


  let projectModel = (projects,status) => {
    return {
      "projects":projects, 
      "status":status,
      "size":projects.length,
      "numActive":projects.filter(project => project.isActive).length
    }
  }


  if (action.type === types.GET_ALL_PROJECTS) {
    
    return projectModel(action.payload, action.status);

  }else if (action.type === types.ADD_NEW_PROJECT) {
    
    if(action.status===201){
      allProjects.projects = [action.payload,...allProjects.projects];
    }
    return projectModel(allProjects.projects,action.status);

  }else if(action.type === types.DELETE_PROJECT){
    
    if(action.status===200){
      let index = allProjects.projects.findIndex(project => project._id == action.projectId);
      allProjects.projects = [...allProjects.projects.slice(0,index),...allProjects.projects.slice(index+1)];
    }    
    return projectModel(allProjects.projects,action.status);
  }
  return allProjects;
};
