import * as types  from './../constants/projects'
export const allProjectsReducer = (allProjects = null, action) => {


  var projectModel = () => {
    console.log('REDUCER STATUS',allProjects.status);

    return {
      "projects":allProjects.projects, 
      "status":action.status
    }
  }


  if (action.type === types.GET_ALL_PROJECTS) {
    //console.log('RUN ALL PROJECT',action.status);
    allProjects.projects = action.payload;
    return projectModel();

  }else if (action.type === types.ADD_NEW_PROJECT) {
    allProjects.status = action.status;
    if(action.status === 201){
      console.log("====>", "new pro")
      allProjects.projects.unshift(action.payload);
    }
    allProjects.projects = allProjects.projects;

    return allProjects;

  }else if(action.type === types.DELETE_PROJECT){
    
    if(action.status===200){
      let index = allProjects.projects.findIndex(project => project._id == action.projectId);
      allProjects.projects = Object.assign([...allProjects.projects.slice(0,index),...allProjects.projects.slice(index+1)]);
    }    
    return projectModel(allProjects.projects,action.status);

  }
  return allProjects;
};
