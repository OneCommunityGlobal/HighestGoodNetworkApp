import { ENDPOINTS } from '../../utils/URL';
import {
  EVENT_CREATE_REQUEST,
  EVENT_CREATE_REQUEST_SUCCESS,
  EVENT_CREATE_REQUEST_FAILURE,
} from '../../constants/communityPortal/EventActivityConstants';

const getAuthHeaders = token => ({
  'Content-Type': 'application/json',
  Authorization: token,
});

export const createEvent = (token, eventDetails) => async dispatch => {
  dispatch({ type: EVENT_CREATE_REQUEST });
  try {
    const response = await fetch(ENDPOINTS.EVENTS, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(eventDetails),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create Event');
    }
    dispatch({ type: EVENT_CREATE_REQUEST_SUCCESS, payload: data });
    return { success: true, event: data };
  } catch (error) {
    dispatch({ type: EVENT_CREATE_REQUEST_FAILURE, payload: error.message });
    return { success: false, error: error.message };
  }
};
