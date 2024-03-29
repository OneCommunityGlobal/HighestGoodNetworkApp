import axios from "axios";
import {
  SET_REUSABLES
} from "constants/bmdashboard/reusableConstants"
import { GET_ERRORS } from "constants/errors";
import { ENDPOINTS } from "utils/URL";

export const setReusables = payload => {
  return {
    type: SET_REUSABLES,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}

export const fetchAllReusables = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_REUSABLES)
      .then(res => {
        dispatch(setReusables(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const purchaseReusable = async (body) => {
  return axios.post(ENDPOINTS.BM_PURCHASE_REUSABLES, body)
    .then(res => res)
    .catch((err) => {
      if (err.response) return err.response
      if (err.request) return err.request
      return err.message
    })
}
