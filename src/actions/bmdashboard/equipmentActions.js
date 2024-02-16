import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import { SET_EQUIPMENTS } from "constants/bmdashboard/equipmentsConstants";
import { GET_ERRORS } from "constants/errors";

export const addEquipmentType = async (body) => {
  return axios.post(`${ENDPOINTS.BM_INVTYPE_ROOT}/equipment`, body)
    .then(res => res)
    .catch((err) => {
      if (err.response) return err.response
      if (err.request) return err.request
      return err.message
    })
}

export const setEquipments = payload => {
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

export const fetchAllEquipments = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_EQUIPMENTS)
      .then(res => {
        dispatch(setEquipments(res.data))
        console.log("Equipment is", res);
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}