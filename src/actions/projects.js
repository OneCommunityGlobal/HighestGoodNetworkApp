/*********************************************************************************
 * Action: PROJECTS  
 * Author: Henry Ng - 01/17/20
 ********************************************************************************/

import axios from 'axios' 
import * as types  from './../constants/projects'
import { ENDPOINTS } from '../utils/URL'

/*******************************************
 * ACTION CREATORS 
 *******************************************/

/**
 * Call API to get all projects 
 */
export const fetchAllProjects = () => {
  const url = ENDPOINTS.PROJECTS();
  console.log(url);
  return async dispatch => {
    const res = await axios.get(url)
    // Dispatch the action object 
    dispatch(getAllProjects(res.data, res.status))
  }
  
}


/**
 * Post new project to DB
 * @param {projectName}: name of new project
 * @param {isActive}: the active status of new project
 */
export const postNewProject = (projectName,isActive) =>{
  const url = ENDPOINTS.PROJECTS();
  console.log("Call API: ", url);
  return async dispatch => {
    let status = 200;
    let _id = null;

    try{
      const res = await axios.post(url,{projectName,isActive})
      _id = res.data._id;
      status = res.status;
    
    }catch(err){
      console.log("TRY CATCH ERR",err);
      status = 400;
    }
    
    dispatch(
        addNewProject(
          { 
              "_id": _id,
              "projectName": projectName,
              "isActive": isActive
            
          },
          status
    ));  

  }
}

/**
 * Post new project to DB
 * @param {projectId}: Id of deleted project
 */
export const deleteProject = (projectId) =>{
  const url = ENDPOINTS.PROJECT()+projectId;

  console.log("Delete", projectId);

  return async dispatch => {
    let status = 200;
    let _id = projectId;

    try{
      const res = await axios.delete(url)
      status = res.status;
    
    }catch(err){
      console.log("CAN'T DELETE",err);
      status = 400;
    }

    dispatch(removeProject(projectId,status));  
    
  }
}

/*******************************************
 * PLAIN OBJECT ACTIONS
 *******************************************/


/**
 * Updates the list of projects in store 
 * @param payload 
 */
export const getAllProjects = (payload,status) => {
    return {
        type: types.GET_ALL_PROJECTS,
        payload,
        status
    }
}

export const addNewProject = (payload, status) => {
  return {
      type: types.ADD_NEW_PROJECT,
      payload,
      status
  }
}

export const removeProject = (projectId,status) => {
  return {
      type: types.DELETE_PROJECT,
      projectId,
      status
  }
}
