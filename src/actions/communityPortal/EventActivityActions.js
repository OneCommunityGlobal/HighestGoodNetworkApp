import { ENDPOINTS } from '../../utils/URL';
import { 
  EVENT_FETCH_REQUEST, 
  EVENT_FETCH_REQUEST_SUCCESS, 
  EVENT_FETCH_REQUEST_FAILURE, 

  EVENT_CREATE_REQUEST, 
  EVENT_CREATE_REQUEST_SUCCESS, 
  EVENT_CREATE_REQUEST_FAILURE,

  CALENDAR_EVENT_FETCH_REQUEST,
  CALENDAR_EVENT_FETCH_REQUEST_SUCCESS,
  CALENDAR_EVENT_FETCH_REQUEST_FAILURE
} from "../../constants/communityPortal/EventActivityConstants"

export const fetchEventDetails = (token, queryParams) => async (dispatch) => {
  dispatch({type: EVENT_FETCH_REQUEST});
  
  try {
    const response = await fetch(`${ENDPOINTS.EVENTS}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.error || 'Failed to fetch details of Events');
    }

    dispatch({type: EVENT_FETCH_REQUEST_SUCCESS, payload: data});
  } catch(error) {
    dispatch({type: EVENT_FETCH_REQUEST_FAILURE, payload: error.message});
  }

}

export const createEvent = (token, eventDetails) => async (dispatch) => {
  dispatch({type: EVENT_CREATE_REQUEST});

  try {
    const response = await fetch(`${ENDPOINTS.EVENTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(eventDetails),
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.error || 'Failed to create Event');
    }

    dispatch({type: EVENT_CREATE_REQUEST_SUCCESS, payload: data});
  } catch(error) {
    dispatch({type: EVENT_CREATE_REQUEST_FAILURE, payload: error.message});
  }
}

export const fetchCalendarEventDetails = (token, queryParams) => async (dispatch) => {
  dispatch({type: CALENDAR_EVENT_FETCH_REQUEST});

  try {
    const response = await fetch(`${ENDPOINTS.EVENTS}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.error || 'Failed to fetch details of Events');
    }
    
    dispatch({type: CALENDAR_EVENT_FETCH_REQUEST_SUCCESS, payload: data});
  } catch(error) {
    dispatch({type: CALENDAR_EVENT_FETCH_REQUEST_FAILURE, payload: error.message});
  }

}