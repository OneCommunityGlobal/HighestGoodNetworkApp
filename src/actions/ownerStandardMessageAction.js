import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

import * as types from "../constants/ownerStandardMessageConstants";

export const getOwnerStandardMessageAction = payload => {
  return {
    type: types.GET_OWNER_STANDARD_MESSAGE,
    payload,
  };
}

export const getOwnerStandardMessage = () => async dispatch => {
  const { data } = await axios.get(ENDPOINTS.OWNERSTANDARDMESSAGE());
  return dispatch(getOwnerStandardMessageAction(data));
}

export const createOwnerStandardMessageAction = payload => {
  return {
    type: types.CREATE_OWNER_STANDARD_MESSAGE,
    payload,
  };
}

export const createOwnerStandardMessage = ownerStandardMessage => async dispatch => {
  await axios.post(ENDPOINTS.OWNERSTANDARDMESSAGE(), ownerStandardMessage)
  return dispatch(createOwnerStandardMessageAction(ownerStandardMessage))
}

export const updateOwnerStandardMessageAction = payload => {
  return {
    type: types.UPDATE_OWNER_STANDARD_MESSAGE,
    payload,
  };
}

export const updateOwnerStandardMessage = (ownerStandardMessageId, ownerStandardMessage) => {
  return async dispatch => {
    await axios.put(ENDPOINTS.OWNERSTANDARDMESSAGE_BY_ID(ownerStandardMessageId), ownerStandardMessage)
    .then(dispatch(updateOwnerStandardMessageAction(ownerStandardMessage)));
  }
}

export const deleteOwnerStandardMessageAction = payload => {
  return {
    type: types.DELETE_OWNER_STANDARD_MESSAGE,
    payload,
  };
}

export const deleteOwnerStandardMessage = () => async dispatch => {
    await axios.delete(ENDPOINTS.OWNERSTANDARDMESSAGE())
    .then(dispatch(deleteOwnerStandardMessageAction()));
}