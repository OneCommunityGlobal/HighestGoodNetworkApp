import axios from 'axios'
import * as types  from './../constants/projects'
import { ENDPOINTS } from '../utils/URL'

export const fetchAllProjects = () => {
  const url = ENDPOINTS.PROJECTS();
  return async dispatch => {
    const res = await axios.get(url)
    await dispatch(getAllProjects(res.data))
  }
}


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