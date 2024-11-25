import axios from "axios";
import {
  SET_REUSABLES, POST_UPDATE_REUSABLE_START, POST_UPDATE_REUSABLE_END, RESET_UPDATE_REUSABLE,
  POST_UPDATE_REUSABLE_ERROR, POST_UPDATE_REUSABLE_START_BULK, POST_UPDATE_REUSABLE_END_BULK,
  RESET_UPDATE_REUSABLE_BULK, POST_UPDATE_REUSABLE_ERROR_BULK
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

export const reusableUpdateStart = () => {
  return {
    type: POST_UPDATE_REUSABLE_START
  }
}

export const reusableUpdateEnd = payload => {
  return {
    type: POST_UPDATE_REUSABLE_END,
    payload
  }
}

export const reusableUpdateError = payload => {
  return {
    type: POST_UPDATE_REUSABLE_ERROR,
    payload
  }
}


export const reusableUpdateStartBulk = () => {
  return {
    type: POST_UPDATE_REUSABLE_START_BULK
  }
}

export const reusableUpdateEndBulk = payload => {
  return {
    type: POST_UPDATE_REUSABLE_END_BULK,
    payload
  }
}

export const reusableUpdateErrorBulk = payload => {
  return {
    type: POST_UPDATE_REUSABLE_ERROR_BULK,
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


export const postReusableUpdate = (payload) => {
  return async dispatch => {
    dispatch(reusableUpdateStart())
    axios.post(ENDPOINTS.BM_UPDATE_REUSABLE, payload)
      .then(res => {
        dispatch(reusableUpdateEnd(res.data))
      })
      .catch((error) => {
        if (error.response) {
          dispatch(reusableUpdateError(error.response.data));
        } else if (error.request) {
          dispatch(reusableUpdateError(error.request));
        } else {
          dispatch(reusableUpdateError(error));
        }
      })
  }
}

export const postReusableUpdateBulk = (payload) => {
  return async dispatch => {
    dispatch(reusableUpdateStartBulk())
    axios.post(ENDPOINTS.BM_UPDATE_REUSABLE_BULK, payload)
      .then(res => {
        dispatch(reusableUpdateEndBulk(res.data.result))
      })
      .catch((error) => {
        if (error.response) {
          dispatch(reusableUpdateErrorBulk(error.response.data));
        } else if (error.request) {
          dispatch(reusableUpdateErrorBulk(error.request));
        } else {
          dispatch(reusableUpdateErrorBulk(error));
        }
      })
  }
}



export const resetReusableUpdate = () => {
  return { type: RESET_UPDATE_REUSABLE }
}


export const resetReusableUpdateBulk = () => {
  return { type: RESET_UPDATE_REUSABLE_BULK }
}