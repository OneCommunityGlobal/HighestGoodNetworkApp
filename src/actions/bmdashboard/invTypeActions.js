import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import GET_MATERIAL_TYPES, { GET_CONSUMABLE_TYPES } from "constants/bmdashboard/inventoryTypeConstants";
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

export const fetchConsumableTypes = () => {
  return async dispatch => {
    axios
      .get(ENDPOINTS.BM_CONSUMABLE_TYPES)
      .then(res => {
        dispatch(setConsumableTypes(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
}

export const setConsumableTypes = payload => {
  return {
    type: GET_CONSUMABLE_TYPES,
    payload,
  };
}

export const setInvTypes = payload => {
  return {
    type: GET_MATERIAL_TYPES,
    payload
  }
}

export const setErrors = payload => {
  return { 
    type: GET_ERRORS,
    payload
  }
}