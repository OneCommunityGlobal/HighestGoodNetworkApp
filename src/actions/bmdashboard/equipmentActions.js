import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import GET_EQUIPMENT_BY_ID from 'constants/bmdashboard/equipmentConstants';
import { GET_ERRORS } from 'constants/errors';

export const fetchEquipmentById = (equipmentId) => {
  const url = ENDPOINTS.BM_EQUIPMENT_BY_ID(equipmentId);
  return async dispatch => {
    axios.get(url)
      .then(res => {
        dispatch(setEquipment(res.data))
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

export const setEquipment = payload => {
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