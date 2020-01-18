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
  return async dispatch => {
    const res = await axios.get(url)
    // Dispatch the action object 
    await dispatch(getAllProjects(res.data))
  }
}

/*******************************************
 * PLAIN OBJECT ACTIONS
 *******************************************/


/**
 * Updates the list of projects in store 
 * @param payload 
 */
export const getAllProjects = (payload) => {
    return {
        type: types.GET_ALL_PROJECTS,
        payload
    }
}