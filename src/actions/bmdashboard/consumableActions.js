import axios from 'axios';
import { toast } from 'react-toastify';
import { GET_ERRORS } from '../../constants/errors';
import { ENDPOINTS } from '~/utils/URL';
import {
  SET_CONSUMABLES,
  POST_UPDATE_CONSUMABLE_START,
  POST_UPDATE_CONSUMABLE_END,
  POST_UPDATE_CONSUMABLE_ERROR,
  UPDATE_CONSUMABLE_STATUS_START,
  UPDATE_CONSUMABLE_STATUS_END,
  UPDATE_CONSUMABLE_STATUS_ERROR,
} from '../../constants/bmdashboard/consumableConstants';

export const setConsumables = payload => {
  return {
    type: SET_CONSUMABLES,
    payload,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};

export const purchaseConsumable = async body => {
  return axios
    .post(ENDPOINTS.BM_CONSUMABLES_PURCHASE, body)
    .then(res => res)
    .catch(err => {
      if (err.response) return err.response;
      if (err.request) return err.request;
      return err.message;
    });
};

export const consumableUpdateStart = () => {
  return {
    type: POST_UPDATE_CONSUMABLE_START,
  };
};

export const consumableUpdateEnd = payload => {
  return {
    type: POST_UPDATE_CONSUMABLE_END,
    payload,
  };
};

export const consumableUpdateError = payload => {
  return {
    type: POST_UPDATE_CONSUMABLE_ERROR,
    payload,
  };
};

export const fetchAllConsumables = () => {
  return async dispatch => {
    axios
      .get(ENDPOINTS.BM_CONSUMABLES)
      .then(res => {
        dispatch(setConsumables(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
};

export const postConsumableUpdate = payload => {
  return async dispatch => {
    dispatch(consumableUpdateStart());
    axios
      .post(ENDPOINTS.BM_UPDATE_CONSUMABLES, payload)
      .then(res => {
        dispatch(consumableUpdateEnd(res.data));
      })
      .catch(error => {
        dispatch(consumableUpdateError(error.response.data.message));
      });
  };
};

export const consumableStatusUpdateStart = () => ({
  type: UPDATE_CONSUMABLE_STATUS_START,
});

export const consumableStatusUpdateEnd = payload => ({
  type: UPDATE_CONSUMABLE_STATUS_END,
  payload,
});

export const consumableStatusUpdateError = payload => ({
  type: UPDATE_CONSUMABLE_STATUS_ERROR,
  payload,
});

export const approveConsumablePurchase = (purchaseId, quantity) => {
  return async dispatch => {
    dispatch(consumableStatusUpdateStart());
    try {
      const res = await axios.post(ENDPOINTS.BM_UPDATE_CONSUMABLE_STATUS, {
        purchaseId,
        status: 'Approved',
        quantity,
      });
      dispatch(consumableStatusUpdateEnd(res.data));
      toast.success('Purchase Approved', { toastId: 'consumableApproveSuccess' });
      dispatch(fetchAllConsumables());
      return res;
    } catch (error) {
      const errorPayload = error.response ? error.response.data : error.message;
      dispatch(consumableStatusUpdateError(errorPayload));
      toast.error('Failed to approve purchase.', { toastId: 'consumableApproveError' });
      return null;
    }
  };
};

export const rejectConsumablePurchase = purchaseId => {
  return async dispatch => {
    dispatch(consumableStatusUpdateStart());
    try {
      const res = await axios.post(ENDPOINTS.BM_UPDATE_CONSUMABLE_STATUS, {
        purchaseId,
        status: 'Rejected',
      });
      dispatch(consumableStatusUpdateEnd(res.data));
      toast.error('Purchase Rejected', { toastId: 'consumableRejectSuccess' });
      dispatch(fetchAllConsumables());
      return res;
    } catch (error) {
      const errorPayload = error.response ? error.response.data : error.message;
      dispatch(consumableStatusUpdateError(errorPayload));
      toast.error('Failed to reject purchase.', { toastId: 'consumableRejectError' });
      return null;
    }
  };
};
