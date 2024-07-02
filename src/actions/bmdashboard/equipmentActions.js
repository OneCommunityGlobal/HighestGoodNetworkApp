import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import GET_EQUIPMENT_BY_ID, {SET_EQUIPMENTS} from 'constants/bmdashboard/equipmentConstants';
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

export const fetchAllEQUIPMENTS = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_EQUIPMENTS)
      .then(res => {
        dispatch(setEquipments(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const setEquipments = payload => {
  return {
    type: SET_EQUIPMENTS,
    payload
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
    type: SET_EQUIPMENTS,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}

export const purchaseEquipment = async (body) => {
  return axios.post(ENDPOINTS.BM_EQUIPMENT_PURCHASE, body)
    .then(res => res)
    .catch((err) => {
      if (err.response) return err.response
      if (err.request) return err.request
      return err.message
    })
}