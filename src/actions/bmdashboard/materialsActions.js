import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import {
  SET_MATERIALS, POST_UPDATE_MATERIAL_START, POST_UPDATE_MATERIAL_END, RESET_UPDATE_MATERIAL,
  POST_UPDATE_MATERIAL_ERROR, POST_UPDATE_MATERIAL_START_BULK, POST_UPDATE_MATERIAL_END_BULK,
  RESET_UPDATE_MATERIAL_BULK, POST_UPDATE_MATERIAL_ERROR_BULK
} from "constants/bmdashboard/materialsConstants";
import { GET_ERRORS } from "constants/errors";

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

export const materialUpdateStartBulk = () => {
  return {
    type: POST_UPDATE_MATERIAL_START_BULK
  }
}

export const materialUpdateEndBulk = payload => {
  return {
    type: POST_UPDATE_MATERIAL_END_BULK,
    payload
  }
}

export const materialUpdateErrorBulk = payload => {
  return {
    type: POST_UPDATE_MATERIAL_ERROR_BULK,
    payload
  }
}

export const resetMaterialUpdateBulk = () => {
  return { type: RESET_UPDATE_MATERIAL_BULK }
}


export const fetchAllMaterials = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_MATERIALS)
      .then(res => {
        console.log('fetchAllMaterials: ', res);
        dispatch(setMaterials(res.data))
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
        dispatch(materialUpdateEnd(res.data))
      })
      .catch((error) => {
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

export const postMaterialUpdateBulk = (payload) => {
  return async dispatch => {
    dispatch(materialUpdateStartBulk())
    axios.post(ENDPOINTS.BM_UPDATE_MATERIAL_BULK, payload)
      .then(res => {
        dispatch(materialUpdateEndBulk(res.data.result))
      })
      .catch((error) => {
        if (error.response) {
          dispatch(materialUpdateErrorBulk(error.response.data));
        } else if (error.request) {
          dispatch(materialUpdateErrorBulk(error.request));
        } else {
          dispatch(materialUpdateErrorBulk(error));
        }
      })
  }
}

export const purchaseMaterial = async (body) => {
  return axios.post(ENDPOINTS.BM_MATERIALS, body)
    .then(res => res)
    .catch((err) => {
      if (err.response) return err.response
      if (err.request) return err.request
      return err.message
    })
}

