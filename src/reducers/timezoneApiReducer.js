import * as types from '../constants/timezoneApiConstants';

const timeZoneAPIInitial = {
  fetching: false,
  fetched: false,
  userAPIKey: '',
  status: 404,
};

// eslint-disable-next-line import/prefer-default-export,default-param-last
export const timeZoneAPIReducer = (timeZoneAPI = timeZoneAPIInitial, action) => {
  switch (action.type) {
    case types.FETCH_TIMEZONE_KEY:
      return {
        ...timeZoneAPI,
        fetching: true,
        status: '200',
      };

    case types.FETCH_TIMEZONE_KEY_ERROR:
      return {
        ...timeZoneAPI,
        fetching: false,
        fetchError: action.payload.error,
        status: '404',
      };

    case types.RECEIVE_TIMEZONE_KEY:
      return {
        ...timeZoneAPI,
        userAPIKey: action.payload.userAPIKey,
        fetching: false,
        fetched: true,
        status: '200',
      };

    default:
      return timeZoneAPI;
  }
};
