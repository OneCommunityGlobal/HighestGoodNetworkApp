import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import { SET_MATERIALS } from "constants/bmdashboard/materialsConstants";
import { GET_ERRORS } from "constants/errors";

export const fetchAllMaterials = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_MATERIALS_LIST)
    .then(res => {
      dispatch(setMaterials(res.data))
    })
    .catch(err => {
      dispatch(setErrors(err))
    })
  } 
}

export const setMaterials = payload => {
  return {
    type: SET_MATERIALS,
    payload
  }
}

export const setErrors = payload => {
  return { 
    type: GET_ERRORS,
    payload
  }
}