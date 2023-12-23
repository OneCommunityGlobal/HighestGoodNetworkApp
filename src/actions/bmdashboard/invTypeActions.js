import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import GET_MATERIAL_TYPES, { POST_BUILDING_MATERIAL_INVENTORY_TYPE, POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE, RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE } from "constants/bmdashboard/inventoryTypeConstants";
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

export const postBuildingInventoryType = (payload) => {
  return async dispatch => {
    axios.post(ENDPOINTS.BM_MATERIAL_TYPE, payload)
      .then(res => {
        dispatch(setPostBuildingInventoryTypeResult(res.data))
      })
      .catch(err => {
        dispatch(setPostErrorBuildingInventoryTypeResult('Sorry! Some error occurred!'))
      })
  }
}

export const setPostBuildingInventoryTypeResult = (payload) => {
  return {
    type: POST_BUILDING_MATERIAL_INVENTORY_TYPE,
    payload
  }
}

export const setPostErrorBuildingInventoryTypeResult = (payload) => {
  return {
    type: POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE,
    payload
  }
}

export const resetPostBuildingInventoryTypeResult = () => {
  return {
    type: RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE
  }
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