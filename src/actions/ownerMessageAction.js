import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

import * as types from "../constants/ownerMessageConstants";

export const getOwnerMessageAction = payload => {
  return {
    type: types.GET_OWNER_MESSAGE,
    payload,
  };
}

export const getOwnerMessage = () => async dispatch => {
  const { data } = await axios.get(ENDPOINTS.OWNERMESSAGE());
  return dispatch(getOwnerMessageAction(data));
}

export const createOwnerMessageAction = payload => {
  return {
    type: types.CREATE_OWNER_MESSAGE,
    payload,
  };
}

export const createOwnerMessage = ownerMessage => async dispatch => {
  await axios.post(ENDPOINTS.OWNERMESSAGE(), ownerMessage)
  return dispatch(createOwnerMessageAction(ownerMessage))
}

export const updateOwnerMessageAction = payload => {
  return {
    type: types.UPDATE_OWNER_MESSAGE,
    payload,
  };
}

export const updateOwnerMessage = (ownerMessageId, ownerMessage) => {
  return async dispatch => {
    await axios.put(ENDPOINTS.OWNERMESSAGE_BY_ID(ownerMessageId), ownerMessage)
    .then(dispatch(updateOwnerMessageAction(ownerMessage)));
  }
}

export const deleteOwnerMessageAction = payload => {
  return {
    type: types.DELETE_OWNER_MESSAGE,
    payload,
  };
}

export const deleteOwnerMessage = () => async dispatch => {
    await axios.delete(ENDPOINTS.OWNERMESSAGE())
    .then(dispatch(deleteOwnerMessageAction()));
}