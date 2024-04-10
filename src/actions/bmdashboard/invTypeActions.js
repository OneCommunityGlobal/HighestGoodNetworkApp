import axios from "axios";

import { ENDPOINTS } from "utils/URL";

import GET_MATERIAL_TYPES, { POST_BUILDING_MATERIAL_INVENTORY_TYPE, POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE, RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE, GET_INV_BY_TYPE, GET_TOOL_TYPES, GET_REUSABLE_TYPES } from "constants/bmdashboard/inventoryTypeConstants";
import { GET_ERRORS } from "constants/errors";

export const fetchMaterialTypes = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_MATERIAL_TYPES)
      .then(res => {
        dispatch(setMaterialTypes(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const fetchReusableTypes = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_REUSABLE_TYPES)
      .then(res => {
        dispatch(setReusableTypes(res.data))
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
export const fetchInvTypeByType = (type) => {
  const url = ENDPOINTS.BM_INVTYPE_TYPE(type);
  return async dispatch => {
    axios.get(url)
      .then(res => {
        dispatch(setInvTypesByType({ type: type, data: res.data }))
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
        dispatch(setPostErrorBuildingInventoryTypeResult(JSON.stringify(err.response.data) || 'Sorry! Some error occurred!'))
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


export const setMaterialTypes = payload => {
  return {
    type: GET_MATERIAL_TYPES,
    payload
  }
}

export const setReusableTypes = payload => {
  return {
    type: GET_REUSABLE_TYPES,
    payload
  }
}

export const setToolTypes = payload => {
  return {
    type: GET_TOOL_TYPES,
    payload,
  };
};
export const setInvTypesByType = payload => {

  return {
    type: GET_INV_BY_TYPE,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}
