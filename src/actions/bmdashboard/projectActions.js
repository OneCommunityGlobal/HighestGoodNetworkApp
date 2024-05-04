import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import GET_BM_PROJECTS from "constants/bmdashboard/projectConstants";
import { GET_ERRORS } from "constants/errors";

export const fetchBMProjects = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_PROJECTS)
    .then(res => {
      dispatch(setProjects(res.data))
    })
    .catch(err => {
      dispatch(setErrors(err))
    })
  } 
}

export const setProjects = payload => {
  return {
    type: GET_BM_PROJECTS,
    payload
  }
}

export const setErrors = payload => {
  return { 
    type: GET_ERRORS,
    payload
  }
}