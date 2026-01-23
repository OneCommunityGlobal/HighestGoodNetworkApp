import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';

import * as types from '../constants/ownerMessageConstants';

// action creator
export const updateOwnerMessageAction = payload => {
  return {
    type: types.UPDATE_OWNER_MESSAGE,
    payload,
  };
};

export const updateOwnerMessageHistoryAction = payload => {
  return {
    type: types.UPDATE_OWNER_MESSAGE_HISTORY,
    payload,
  };
};

// redux thunk functions
export const getOwnerMessage = () => {
  const url = ENDPOINTS.OWNERMESSAGE();
  return async dispatch => {
    try {
      const response = await axios.get(url);
      const { ownerMessage } = response.data;
      dispatch(updateOwnerMessageAction(ownerMessage));
      return response;
    } catch (error) {
      return error.response.data.error;
    }
  };
};

export const updateOwnerMessage = newMessage => {
  const url = ENDPOINTS.OWNERMESSAGE();
  return async dispatch => {
    try {
      const response = await axios.put(url, newMessage);
      const { ownerMessage } = response.data;
      dispatch(updateOwnerMessageAction(ownerMessage));
      // refresh history after update
      dispatch(getOwnerMessageHistory());
      return response;
    } catch (error) {
      return error.response.data.error;
    }
  };
};

export const deleteOwnerMessage = () => {
  const url = ENDPOINTS.OWNERMESSAGE();
  return async dispatch => {
    try {
      const response = await axios.delete(url);
      const { ownerMessage } = response.data;
      dispatch(updateOwnerMessageAction(ownerMessage));
      // refresh history after update
      dispatch(getOwnerMessageHistory());
      return response;
    } catch (error) {
      return error.response.data.error;
    }
  };
};

export const getOwnerMessageHistory = () => {
  const url = ENDPOINTS.OWNER_MESSAGE_HISTORY();
  return async dispatch => {
    try {
      const response = await axios.get(url);
      const ownerMessageHistory = response.data;
      console.log('Owner Message History Data:', ownerMessageHistory);
      dispatch(updateOwnerMessageHistoryAction(ownerMessageHistory));
      return response;
    } catch (error) {
      return error.response.data.error;
    }
  };
};
