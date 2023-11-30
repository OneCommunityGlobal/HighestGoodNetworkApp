import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import { SET_USER_PROJECTS } from "constants/bmdashboard/materialsConstants";
import { GET_ERRORS } from "constants/errors";

export const fetchUserActiveBMProjects = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_USER_PROJECTS)
      .then(res => {
        dispatch(setUserProjects(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}


export const setUserProjects = payload => {
  return {
    type: SET_USER_PROJECTS,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}
