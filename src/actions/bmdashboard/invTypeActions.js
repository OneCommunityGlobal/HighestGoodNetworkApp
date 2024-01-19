import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import GET_MATERIAL_TYPES, { GET_INV_BY_TYPE } from "constants/bmdashboard/inventoryTypeConstants";
import { GET_ERRORS } from "constants/errors";

export const fetchMaterialTypes = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_MATERIAL_TYPES)
      .then(res => {
        dispatch(setInvTypes(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const fetchInvTypeByType = (type) => {
  const url = ENDPOINTS.BM_INVTYPE_TYPE(type);
  return async dispatch => {
    axios.get(url)
      .then(res => {
        dispatch(setInvTypesByType({ type: type, data: res.data }))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const setInvTypes = payload => {
  return {
    type: GET_MATERIAL_TYPES,
    payload
  }
}

export const setInvTypesByType = payload => {

  return {
    type: GET_INV_BY_TYPE,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}