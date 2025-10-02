import axios from 'axios';
import { GET_TOOL_BY_ID, GET_TOOLS, GET_TOOL_AVAILABILITY } from '../../constants/bmdashboard/toolsConstants';
import { GET_ERRORS } from '../../constants/errors';
import { ENDPOINTS } from '~/utils/URL';

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

export const setToolAvailability = payload => ({
  type: GET_TOOL_AVAILABILITY,
  payload,
});

export const fetchTools = () => {
  const url = ENDPOINTS.BM_TOOLS;
  return async dispatch => {
    axios
      .get(url)
      .then(res => {
        dispatch(setTools(res.data));
      })
      .catch(error => {
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

export const fetchToolAvailability = (toolId = '', projectId = '') => {
  return async dispatch => {
    try {
      const url = ENDPOINTS.BM_TOOL_AVAILABILITY(toolId, projectId);
      const response = await axios.get(url);
      dispatch(setToolAvailability(response.data));
    } catch (error) {
      // console.error('Error fetching tool availability:', error);
      dispatch(setErrors(error));
    }
  };
};
