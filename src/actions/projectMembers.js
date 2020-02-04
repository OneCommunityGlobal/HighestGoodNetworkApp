/*********************************************************************************
 * Action: MEMBER MEMBERSHIP  
 * Author: Henry Ng - 02/03/20
 ********************************************************************************/
import axios from 'axios'
import * as types from './../constants/projectMembership'
import { ENDPOINTS } from '../utils/URL'

/*******************************************
 * ACTION CREATORS 
 *******************************************/

/**
 * Call API to get all members 
 */
export const fetchAllMembers = (projectId) => {

  const request = axios.get(ENDPOINTS.PROJECT_MEMBER(projectId));

  console.log(ENDPOINTS.PROJECT_MEMBER());
  console.log(request);

  return async dispatch => {
    await dispatch(setMemberStart());
    request.then(res => {
      console.log("RES", res);
      dispatch(setMembers(res.data));
    }).catch((err) => {
      console.log("Error", err);
      dispatch(setMembersError(err));
    })
  }
}


/*******************************************
 * PLAIN OBJ ACTIONS 
 *******************************************/

/**
* Set a flag that fetching Members  
*/
export const setMemberStart = () => {
  return {
    type: types.FETCH_MEMBERS_START,
  }
}


/**
 * set Members in store 
 * @param payload : Members [] 
 */
export const setMembers = (members) => {
  return {
    type: types.RECEIVE_MEMBERS,
    members
  }
}

/**
 * Error when setting project 
 * @param payload : error status code 
 */
export const setMembersError = (err) => {
  return {
    type: types.FETCH_MEMBERS_ERROR,
    err
  }
}