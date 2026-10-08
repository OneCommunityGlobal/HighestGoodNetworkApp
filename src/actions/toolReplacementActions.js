import axios from 'axios';
import {
  TOOL_REPLACEMENT_REQUEST,
  TOOL_REPLACEMENT_SUCCESS,
  TOOL_REPLACEMENT_FAILURE,
} from '../constants/ToolReplacementConstants';
import { ENDPOINTS } from '../utils/URL';

export const fetchToolReplacements = queryParams => async dispatch => {
  dispatch({ type: TOOL_REPLACEMENT_REQUEST });

  try {
    const queryString = queryParams ? `?${queryParams}` : '';
    const response = await axios.get(`${ENDPOINTS.TOOL_REPLACEMENTS}${queryString}`);

    dispatch({
      type: TOOL_REPLACEMENT_SUCCESS,
      payload: Array.isArray(response.data) ? response.data : [],
    });
  } catch (error) {
    dispatch({
      type: TOOL_REPLACEMENT_FAILURE,
      payload: error.response?.data?.error || error.message || 'Failed to fetch tool replacements',
    });
  }
};
