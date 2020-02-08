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
* Call API to find a user profile
*/
export const findUserProfiles = (keyword) => {

  console.log(ENDPOINTS.USER_PROFILES(), keyword);
  const request = axios.get(ENDPOINTS.USER_PROFILES());
  console.log(request);

  return async dispatch => {
    await dispatch(findUsersStart());
    request.then(res => {
      console.log("FOUND USER ", res);
      if (keyword.trim() !== "") {
        let users = res.data.filter(user => (user.firstName + " " + user.lastName).toLowerCase().includes(keyword.toLowerCase()))
        dispatch(foundUsers(users));
      } else {
        dispatch(foundUsers([]));
      }
    }).catch((err) => {
      console.log("Error", err);
      dispatch(findUsersError(err));
    })
  }
}

/**
 * Call API to get all members 
 */
export const fetchAllMembers = (projectId) => {

  const request = axios.get(ENDPOINTS.PROJECT_MEMBER(projectId));

  console.log(ENDPOINTS.PROJECT_MEMBER());
  console.log(request);

  return async dispatch => {
    await dispatch(setMemberStart());
    await dispatch(foundUsers([]));
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



/**
* Set a flag that finding Members  
*/
export const findUsersStart = () => {
  console.log("find user start");

  return {
    type: types.FIND_USERS_START,
  }
}


/**
 * set Users in store 
 * @param payload : Users [] 
 */
export const foundUsers = (users) => {
  console.log("foundUsers");
  return {
    type: types.FOUND_USERS,
    users
  }
}

/**
 * Error when setting project 
 * @param payload : error status code 
 */
export const findUsersError = (err) => {
  return {
    type: types.FIND_USERS_ERROR,
    err
  }
}