import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import GET_MATERIAL_TYPES from "constants/bmdashboard/inventoryTypeConstants";
import { GET_TOOL_TYPES } from 'constants/bmdashboard/inventoryTypeConstants';
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

export const fetchToolTypes = () => {
  return async dispatch => {
    axios
      .get(ENDPOINTS.BM_TOOL_TYPES)
      .then(res => {
        dispatch(setToolTypes(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
};

export const setInvTypes = payload => {
  return {
    type: GET_MATERIAL_TYPES,
    payload
  }
}

export const setToolTypes = payload => {
  return {
    type: GET_TOOL_TYPES,
    payload,
  };
};

export const setErrors = payload => {
  return { 
    type: GET_ERRORS,
    payload
  }
}
