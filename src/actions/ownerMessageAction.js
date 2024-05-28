import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

import * as types from "../constants/ownerMessageConstants";

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
  }
}

export const updateOwnerMessage = (newMessage) => {
  const url = ENDPOINTS.OWNERMESSAGE();
  return async dispatch => {
    try {
      const response = await axios.put(url, newMessage);
      const { ownerMessage } = response.data;
      dispatch(updateOwnerMessageAction(ownerMessage));
      return response;
    } catch (error) {
      return error.response.data.error;
    }
  }
}

export const deleteOwnerMessage = () => {
  const url = ENDPOINTS.OWNERMESSAGE();
  return async dispatch => {
    try {
      const response = await axios.delete(url);
      const { ownerMessage } = response.data;
      dispatch(updateOwnerMessageAction(ownerMessage))
      return response;
    } catch (error) {
      return error.response.data.error;
    }
  }
}

// action creator
export const updateOwnerMessageAction = payload => {
  return {
    type: types.UPDATE_OWNER_MESSAGE,
    payload,
  };
}
