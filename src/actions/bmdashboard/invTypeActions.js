import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import GET_MATERIAL_TYPES, {
  POST_BUILDING_MATERIAL_INVENTORY_TYPE,
  POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE,
  RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE,
  GET_INV_BY_TYPE,
  DELETE_BUILDING_INVENTORY_TYPE,
  RESET_DELETE_BUILDING_INVENTORY_TYPE,
  DELETE_ERROR_BUILDING_INVENTORY_TYPE,
  UPDATE_BUILDING_INVENTORY_TYPE,
  RESET_UPDATE_BUILDING_INVENTORY_TYPE,
  UPDATE_ERROR_BUILDING_INVENTORY_TYPE
, GET_TOOL_TYPES } from "constants/bmdashboard/inventoryTypeConstants";
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

export const deleteBuildingInventoryType = (payload) => {
  const {category, id} = payload
  return async dispatch => {
    axios.delete(`${ENDPOINTS.BM_INVTYPE_ROOT}/${category}/${id}`)
      .then(res => {
        dispatch(setDeleteInvTypeResult(res.data))
        // update inventory types with updated list received from the request
        dispatch(setInvTypesByType({ type: category, data: res.data }))
      })
      .catch(err => {
        dispatch(setDeleteInvTypeError(err))
      })
  }
}

export const updateBuildingInventoryType = (payload) => {
  const {category, id, name, description} = payload
  return async dispatch => {
    axios.put(`${ENDPOINTS.BM_INVTYPE_ROOT}/${category}/${id}`, {name, description})
      .then(res => {
        dispatch(setUpdateInvTypeResult(res.data))
        // update inventory types with updated list received from the request
        dispatch(setInvTypesByType({ type: category, data: res.data }))
      })
      .catch(err => {
        dispatch(setUpdateInvTypeError(err))
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

export const setDeleteInvTypeResult = (payload) => {
  return {
    type: DELETE_BUILDING_INVENTORY_TYPE,
    payload
  }
}

export const setDeleteInvTypeError = (payload) => {
  return {
    type: DELETE_ERROR_BUILDING_INVENTORY_TYPE,
    payload
  }
}

export const resetDeleteInvTypeResult = () => {
  return {
    type: RESET_DELETE_BUILDING_INVENTORY_TYPE
  }
}

export const setUpdateInvTypeResult = (payload) => {
  return {
    type: UPDATE_BUILDING_INVENTORY_TYPE,
    payload
  }
}

export const setUpdateInvTypeError = (payload) => {
  return {
    type: UPDATE_ERROR_BUILDING_INVENTORY_TYPE,
    payload
  }
}

export const resetUpdateInvTypeResult = () => {
  return {
    type: RESET_UPDATE_BUILDING_INVENTORY_TYPE
  }
}

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
