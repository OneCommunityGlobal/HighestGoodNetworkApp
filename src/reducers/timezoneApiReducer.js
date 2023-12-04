import * as types from '../constants/timezoneApiConstants';

const timeZoneAPIInitial = {
  fetching: false,
  fetched: false,
  userAPILocation: '',
  status: 404,
};

export const timeZoneAPIReducer = (timeZoneAPI = timeZoneAPIInitial, action) => {
  switch (action.type) {
    case types.FETCH_TIMEZONE_LOCATION:
      return {
        ...timeZoneAPI,
        fetching: true,
        status: 200,
      };

    case types.FETCH_TIMEZONE_LOCATION_ERROR:
      return {
        ...timeZoneAPI,
        fetching: false,
        fetchError: action.payload.error,
        status: 404,
      };

    case types.RECEIVE_TIMEZONE_LOCATION:
      return {
        ...timeZoneAPI,
        userAPILocation: action.payload.userAPILocation,
        fetching: false,
        fetched: true,
        status: 200,
      };
    default:
      return timeZoneAPI;
  }
};
