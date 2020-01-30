import * as types  from './../constants/projects'

const allProjectsInital = {
  fetching: false,
  fetched: false,
  projects: [],
  status: "404"
}

export const allProjectsReducer = (allProjects = allProjectsInital, action) => {

  switch (action.type){
    case types.FETCH_PROJECTS_START: 
      return {...allProjects, fetching:true}
      break;
    case types.RECEIVE_PROJECTS: 
      return {...allProjects, 
        fetching:false, 
        fetched: true, 
        projects: action.payload}
        break;
    case types.FETCH_PROJECTS_ERROR: 
      return {...allProjects, fetching: false, status: action.status}
      break
  }
  return allProjects


 /*
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
  return allProjects;*/
};
