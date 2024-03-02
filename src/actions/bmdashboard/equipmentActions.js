import axios from "axios";

import { ENDPOINTS } from "utils/URL";

export const fetchEquipmentById = (equipmentId) => {
  const url = ENDPOINTS.BM_EQUIPMENT_BY_ID(equipmentId);
  return async dispatch => {
    axios.get(url)
      .then(res => {
        dispatch(setTool(res.data))
      })
      .catch(error => {
        dispatch(setErrors(error))
      })
  }
}

export const addEquipmentType = async (body) => {
  return axios.post(`${ENDPOINTS.BM_INVTYPE_ROOT}/equipment`, body)
    .then(res => res)
    .catch((err) => {
      if (err.response) return err.response
      if (err.request) return err.request
      return err.message
    })
}

export const setTool = payload => {
  return {
    type: GET_EQUIPMENT_BY_ID,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}