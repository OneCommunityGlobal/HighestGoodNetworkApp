import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

import * as types from './../constants/mouseoverTextConstants';

export const getMouseoverTextAction = payload => {
  return {
    type: types.GET_MOUSEOVER_TEXT,
    payload,
  };
};

export const getMouseoverText = () => async dispatch => {
  try {
    const { data } = await axios.get(ENDPOINTS.MOUSEOVERTEXT());
    // console.log('Fetched mouseoverText data:', data); // Verify the fetched data
    return dispatch(getMouseoverTextAction(data));
  } catch (error) {
    console.log('Error fetching mouseoverText:', error);
  }
};

export const createMouseoverTextAction = payload => {
  return {
    type: types.CREATE_MOUSEOVER_TEXT,
    payload,
  };
};

export const createMouseoverText = mouseoverText => async dispatch => {
  await axios.post(ENDPOINTS.MOUSEOVERTEXT(), mouseoverText);
  return dispatch(createMouseoverTextAction(mouseoverText));
};

export const updateMouseoverTextAction = payload => {
  return {
    type: types.UPDATE_MOUSEOVER_TEXT,
    payload,
  };
};

export const updateMouseoverText = (mouseoverTextId, mouseoverText) => {
  return async dispatch => {
    await axios
      .put(ENDPOINTS.MOUSEOVERTEXT_BY_ID(mouseoverTextId), mouseoverText)
      .then(dispatch(updateMouseoverTextAction(mouseoverText)));
  };
};
