import axios from 'axios';
import { GET_ERRORS } from '../../constants/errors';
import { ENDPOINTS } from '../../utils/URL';
import {
  SET_CONSUMABLES,
  POST_UPDATE_CONSUMABLE_START,
  POST_UPDATE_CONSUMABLE_END,
  POST_UPDATE_CONSUMABLE_ERROR,
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

export const consumableUpdateStart = () => {
  return {
    type: POST_UPDATE_CONSUMABLE_START,
  }
}

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
