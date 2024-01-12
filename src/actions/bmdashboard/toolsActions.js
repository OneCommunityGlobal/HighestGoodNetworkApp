import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { SET_TOOLS } from 'constants/bmdashboard/toolsConstants';
import { GET_ERRORS } from 'constants/errors';

export const purchaseTools = async body => {
  return axios
    .post(ENDPOINTS.BM_TOOLS_PURCHASE, body)
    .then(res => res)
    .catch(err => {
      if (err.response) return err.response;
      if (err.request) return err.request;
      return err.message;
    });
};

export const setTools = payload => {
  return {
    type: SET_TOOLS,
    payload,
  };
};
export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};
