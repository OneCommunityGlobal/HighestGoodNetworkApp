import axios from 'axios';
import GET_TOOL_BY_ID, { GET_TOOLS } from '../../constants/bmdashboard/toolsConstants';
import { GET_ERRORS } from '../../constants/errors';
import { ENDPOINTS } from '../../utils/URL';

export const fetchTools = () => {
  const url = ENDPOINTS.BM_TOOLS;
  return async dispatch => {
    axios
      .get(url)
      .then(res => {
        // eslint-disable-next-line no-use-before-define
        dispatch(setTools(res.data));
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log('err: ', error.response.data.message);
        // eslint-disable-next-line no-use-before-define
        dispatch(setErrors(error));
      });
  };
};

export const fetchToolById = toolId => {
  const url = ENDPOINTS.BM_TOOL_BY_ID(toolId);
  return async dispatch => {
    axios
      .get(url)
      .then(res => {
        dispatch(setTool(res.data));
      })
      .catch(error => {
        dispatch(setErrors(error));
      });
  };
};

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
    type: GET_TOOLS,
    payload,
  };
};

export const setTool = payload => {
  return {
    type: GET_TOOL_BY_ID,
    payload,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};
