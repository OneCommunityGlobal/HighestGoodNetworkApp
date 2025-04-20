import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import {
  FETCH_BUILDING_MATERIAL_INVENTORY_UNITS,
  POST_BUILDING_MATERIAL_INVENTORY_UNIT, RESET_POST_BUILDING_MATERIAL_INVENTORY_UNIT
} from "constants/bmdashboard/inventoryTypeConstants"; import { GET_ERRORS } from "constants/errors";

export const fetchInvUnits = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_INVENTORY_UNITS)
      .then(res => {
        dispatch(setInvUnits(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const postBuildingInventoryUnit = (payload) => {
  return async dispatch => {
    axios.post(ENDPOINTS.BM_INVENTORY_UNITS, payload)
      .then(res => {
        dispatch(setPostInvUnitResult(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const setPostInvUnitResult = (payload) => {
  return {
    type: POST_BUILDING_MATERIAL_INVENTORY_UNIT,
    payload
  }
}

export const resetPostInvUnitResult = () => {
  return {
    type: RESET_POST_BUILDING_MATERIAL_INVENTORY_UNIT
  }
}

export const setInvUnits = payload => {
  return {
    type: FETCH_BUILDING_MATERIAL_INVENTORY_UNITS,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}