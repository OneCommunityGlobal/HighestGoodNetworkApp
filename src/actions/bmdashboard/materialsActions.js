import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import { SET_MATERIALS, SET_USER_PROJECTS, POST_UPDATE_MATERIAL_START, POST_UPDATE_MATERIAL_END, RESET_UPDATE_MATERIAL, POST_UPDATE_MATERIAL_ERROR } from "constants/bmdashboard/materialsConstants";
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

export const postMaterialUpdate = (payload) => {
  return async dispatch => {
    dispatch(materialUpdateStart())
    axios.post(ENDPOINTS.BM_UPDATE_MATERIAL, payload)
      .then(res => {
        console.log(res.data)
        dispatch(materialUpdateEnd(res.data))
      })
      .catch(function (error) {
        if (error.response) {
          dispatch(materialUpdateError(error.response.data));
        } else if (error.request) {
          dispatch(materialUpdateError(error.request));
        } else {
          dispatch(materialUpdateError(error));
        }
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

export const setUserProjects = payload => {
  return {
    type: SET_USER_PROJECTS,
    payload
  }
}

export const materialUpdateStart = () => {
  return {
    type: POST_UPDATE_MATERIAL_START
  }
}

export const materialUpdateEnd = payload => {
  return {
    type: POST_UPDATE_MATERIAL_END,
    payload
  }
}

export const materialUpdateError = payload => {
  return {
    type: POST_UPDATE_MATERIAL_ERROR,
    payload
  }
}

export const resetMaterialUpdate = () => {
  return { type: RESET_UPDATE_MATERIAL }
}