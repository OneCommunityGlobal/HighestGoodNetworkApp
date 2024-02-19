import axios from "axios";
import { SET_CONSUMABLES, POST_UPDATE_CONSUMABLE_START, POST_UPDATE_CONSUMABLE_END, POST_UPDATE_CONSUMABLE_ERROR  } from "constants/bmdashboard/consumableConstants";
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

export const consumableUpdateStart = () => {
  console.log("materialUpdateStart called in Mat'l actions")
  return {
    type: POST_UPDATE_CONSUMABLE_START,
  }
}

export const consumableUpdateEnd = (payload) => {
  console.log("consumablesUpdateEnd called in Mat'l actions, payload: ", payload);
  return {
    type: POST_UPDATE_CONSUMABLE_END,
    payload
  }
}

export const consumableUpdateError = payload => {
  return {
    type: POST_UPDATE_CONSUMABLE_ERROR,
    payload
  }
}

export const fetchAllConsumables = () => {
  console.log("consumableActions.js fetchAllConsumables called")
  return async dispatch => {
    axios.get(ENDPOINTS.BM_CONSUMABLES)
      .then(res => {
        console.log("successul fetch. data: ", res.data)
        dispatch(setConsumables(res.data))
      })
      .catch(err => {
        console.log("error fetch. err: ", err)
        dispatch(setErrors(err))
      })
  }
}


export const postConsumableUpdate = (payload) => {
  console.log("postConsumableUpdate in consumableActions called. payload: ", payload)
  // console.log("will make a post req with the above payload to: ", ENDPOINTS.BM_UPDATE_MATERIAL)
  return async dispatch => {
    dispatch(consumableUpdateStart());
    console.log("stuff after    dispatch consumablesUpdateStart")
    axios.post(ENDPOINTS.BM_UPDATE_CONSUMABLES, payload)
      .then(res => {
        console.log("post result: ", res.data);
        dispatch(consumableUpdateEnd(res.data))
      })
      .catch((error) => {
        console.log("post error: ",error);
        if (error.response) {
          console.log("error.response");
          dispatch(consumableUpdateError(error.response.data));
        } else if (error.request) {
          console.log("error.request");
          dispatch(consumableUpdateError(error.request));
        } else {
          console.log("error else");
          dispatch(consumableUpdateError(error));
        }
      })
  }
}
