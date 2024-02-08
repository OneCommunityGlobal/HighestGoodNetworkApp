import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import {
  getWarningByUserId,
  postWarningsByUserId,
  deleteWarningByUserId,
  getCurrentWarnings as getCurrentWarningsAction,
  postNewWarning as postNewWarningAction,
  deleteWarningDescription as deleteWarningDescriptionAction,
} from '../constants/warning';

export const getWarningsByUserId = userId => {
  const url = ENDPOINTS.GET_WARNINGS_BY_USER_ID(userId);

  return async dispatch => {
    try {
      const res = await axios.get(url);
      const response = await dispatch(getWarningByUserId(res.data.warnings));
      return response.payload;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { error: error.response.data.message };
      } else {
        return { error: error.message };
      }
    }
  };
};

export const getCurrentWarnings = () => {
  const url = ENDPOINTS.GET_CURRENT_WARNINGS();

  return async dispatch => {
    try {
      const res = await axios.get(url);

      const response = await dispatch(getCurrentWarningsAction(res.data));

      return response.payload.currentWarningDescriptions;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { error: error.response.data.message };
      } else {
        return { error: error.message };
      }
    }
  };
};
export const postNewWarning = newWarning => {
  const url = ENDPOINTS.POST_NEW_WARNING();

  return async dispatch => {
    try {
      // post needs to send an object with a key of newWarning
      const res = await axios.post(url, { newWarning });
      const response = await dispatch(postNewWarningAction(res.data));

      return response.payload.newWarnings;
    } catch (error) {
      console.log('error', error);
    }
  };
};
export const deleteWarningDescription = warningDescriptionId => {
  const url = ENDPOINTS.DELETE_WARNING_DESCRIPTION(warningDescriptionId);

  return async dispatch => {
    try {
      const res = await axios.delete(url, { data: { warningDescriptionId } });
      const response = await dispatch(deleteWarningDescriptionAction(res.data));

      console.log('response', response);
      return response.payload;
    } catch (error) {
      console.log(error);
    }
  };
};

export const postWarningByUserId = warningData => {
  const { userId } = warningData;

  const url = ENDPOINTS.POST_WARNINGS_BY_USER_ID(userId);

  return async dispatch => {
    try {
      const res = await axios.post(url, warningData);
      const response = await dispatch(postWarningsByUserId(res.data));
      return response.payload.warnings;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { error: 'Error occured when posting' };
      } else {
        return { error: 'Something else went wrong' };
      }
    }
  };
};

export const deleteWarningsById = (warningId, personId) => {
  const url = ENDPOINTS.DELETE_WARNINGS_BY_USER_ID(personId);

  return async dispatch => {
    try {
      const res = await axios.delete(url, { data: { warningId } });
      const response = await dispatch(deleteWarningByUserId(res.data));
      return response.payload.warnings;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { error: error.response.data.message };
      } else {
        return { error: 'Something else went wrong' };
      }
    }
  };
};
