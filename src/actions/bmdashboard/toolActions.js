import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import GET_TOOL_BY_ID from 'constants/bmdashboard/toolsConstants';
import { GET_ERRORS } from 'constants/errors';


export const fetchToolById = (toolId) => {
  const url = ENDPOINTS.BM_TOOL_BY_ID(toolId);
  return async dispatch => {
    axios.get(url)
      .then(res => {
        dispatch(setTool(res.data))
      })
      .catch(error => {
      dispatch(setErrors(error))
    })
  }
}

export const setTool = payload => {
  return {
    type: GET_TOOL_BY_ID,
    payload
  }
}

export const setErrors = payload => {
  return { 
    type: GET_ERRORS,
    payload
  }
}
