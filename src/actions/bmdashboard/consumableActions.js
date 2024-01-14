import axios from "axios";
import { SET_CONSUMABLES } from "constants/bmdashboard/consumableConstants";
import { GET_ERRORS } from "constants/errors";
import { ENDPOINTS } from "utils/URL";

export const setConsumables = payload => {
  return {
    type: SET_CONSUMABLES,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}

export const fetchAllConsumables = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_CONSUMABLES)
      .then(res => {
        dispatch(setConsumables(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}