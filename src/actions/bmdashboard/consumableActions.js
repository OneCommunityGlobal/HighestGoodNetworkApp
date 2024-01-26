import axios from "axios";
import { SET_CONSUMABLES, RESET_UPDATE_CONSUMABLE_BULK, POST_UPDATE_CONSUMABLE_START_BULK, POST_UPDATE_CONSUMABLE_END_BULK, POST_UPDATE_CONSUMABLE_ERROR_BULK } from "constants/bmdashboard/consumableConstants";
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

export const consumableUpdateStartBulk = () => {
  return {
    type: POST_UPDATE_CONSUMABLE_START_BULK
  }
}

export const consumableUpdateEndBulk = payload => {
  return {
    type: POST_UPDATE_CONSUMABLE_END_BULK,
    payload
  }
}

export const consumableUpdateErrorBulk = payload => {
  return {
    type: POST_UPDATE_CONSUMABLE_ERROR_BULK,
    payload
  }
}

export const resetConsumableUpdateBulk = () => {
  return { type: RESET_UPDATE_CONSUMABLE_BULK }
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


export const postConsumableUpdateBulk = (payload) => {
  return async dispatch => {
    dispatch(consumableUpdateStartBulk())
    axios.post(ENDPOINTS.BM_UPDATE_CONSUMABLE_BULK, payload)
      .then(res => {
        dispatch(consumableUpdateEndBulk(res.data.result))
      })
      .catch((error) => {
        if (error.response) {
          dispatch(consumableUpdateErrorBulk(error.response.data));
        } else if (error.request) {
          dispatch(consumableUpdateErrorBulk(error.request));
        } else {
          dispatch(consumableUpdateErrorBulk(error));
        }
      })
  }
}