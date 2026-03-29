import axios from 'axios';

import { ENDPOINTS } from '~/utils/URL';
import {
  FETCH_BUILDING_MATERIAL_INVENTORY_UNITS,
  POST_BUILDING_MATERIAL_INVENTORY_UNIT,
  RESET_POST_BUILDING_MATERIAL_INVENTORY_UNIT,
  DELETE_INVENTORY_UNIT_SUCCESS,
  DELETE_INVENTORY_UNIT_ERROR,
} from '../../constants/bmdashboard/inventoryTypeConstants';
import { GET_ERRORS } from '../../constants/errors';

export const setPostInvUnitResult = payload => {
  return {
    type: POST_BUILDING_MATERIAL_INVENTORY_UNIT,
    payload,
  };
};

export const resetPostInvUnitResult = () => {
  return {
    type: RESET_POST_BUILDING_MATERIAL_INVENTORY_UNIT,
  };
};

export const setInvUnits = payload => {
  return {
    type: FETCH_BUILDING_MATERIAL_INVENTORY_UNITS,
    payload,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};

export const fetchInvUnits = () => {
  return async dispatch => {
    axios
      .get(ENDPOINTS.BM_INVENTORY_UNITS)
      .then(res => {
        dispatch(setInvUnits(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
};

export const postBuildingInventoryUnit = payload => {
  return async dispatch => {
    axios
      .post(ENDPOINTS.BM_INVENTORY_UNITS, payload)
      .then(res => {
        dispatch(setPostInvUnitResult(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
};

/**
 * Add a new inventory unit
 * @param {Object} payload - { unit }
 */
export const addInventoryUnit = payload => {
  return async dispatch => {
    try {
      const res = await axios.post(ENDPOINTS.BM_INVENTORY_UNITS, payload);
      dispatch(setPostInvUnitResult(res.data));
      // Refresh the units list
      dispatch(fetchInvUnits());
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to add unit';
      dispatch(setErrors(err));
      return { success: false, error: errorMsg };
    }
  };
};

/**
 * Delete an inventory unit
 * @param {string} unitId - The ID of the unit to delete
 */
export const deleteInventoryUnit = unitId => {
  return async dispatch => {
    try {
      await axios.delete(ENDPOINTS.BM_INVENTORY_UNIT_BY_ID(unitId));
      dispatch({ type: DELETE_INVENTORY_UNIT_SUCCESS, payload: unitId });
      // Refresh the units list
      dispatch(fetchInvUnits());
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to delete unit';
      dispatch({ type: DELETE_INVENTORY_UNIT_ERROR, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};
