import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import GET_BM_PROJECT_MEMBERS from "constants/bmdashboard/projectMemberConstants";
import { GET_ERRORS } from "constants/errors";

export const fetchBMProjectMembers = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_PROJECT_MEMBERS)
    .then(res => {
      dispatch(setProjectMembers(res.data))
    })
    .catch(err => {
      dispatch(setErrors(err))
    })
  } 
}

export const setProjectMembers = payload => {
  return {
    type: GET_BM_PROJECT_MEMBERS,
    payload
  }
}

export const setErrors = payload => {
  return { 
    type: GET_ERRORS,
    payload
  }
}