import axios from 'axios';
import { toast } from 'react-toastify';

import { ENDPOINTS } from '~/utils/URL';
import {
  FETCH_BUILDING_MATERIAL_INVENTORY_UNITS,
  POST_BUILDING_MATERIAL_INVENTORY_UNIT,
  RESET_POST_BUILDING_MATERIAL_INVENTORY_UNIT,
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
        // Don't show toast for internal refresh calls
      });
  };
};

export const postBuildingInventoryUnit = payload => {
  return async dispatch => {
    const toastId = `add-unit-${Date.now()}`;
    try {
      await axios.post(ENDPOINTS.BM_INVENTORY_UNITS, payload);
      // Refresh the data after successful addition
      dispatch(fetchInvUnits());
      toast.success('Unit added successfully!', { toastId });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to add unit. Please try again.';
      toast.error(errorMessage, { toastId: `add-unit-error-${Date.now()}` });
    }
  };
};

export const deleteInvUnit = (unitName) => {
  return async dispatch => {
    const toastId = `delete-unit-${Date.now()}`;
    try {
      await axios.delete(ENDPOINTS.BM_INVENTORY_UNITS, { data: { unit: unitName } });
      // Refresh the data after successful deletion
      dispatch(fetchInvUnits());
      toast.success('Unit deleted successfully!', { toastId });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to delete unit. Please try again.';
      toast.error(errorMessage, { toastId: `delete-unit-error-${Date.now()}` });
    }
  };
};
