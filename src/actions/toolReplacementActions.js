import { TOOL_REPLCEMENT_REQUEST,  TOOL_REPLACEMENT_SUCCESS, TOOL_REPLACEMENT_FAILURE } from '../constants/ToolReplacementConstants';
import { ENDPOINTS } from '../utils/URL';

export const fetchToolReplacements = (queryParams, token) => async(dispatch) =>{
    dispatch({ type: TOOL_REPLCEMENT_REQUEST });

    try {
      const response = await fetch(`${ENDPOINTS.TOOL_REPLACEMENTS}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tool replacements');
      }

      dispatch({
        type: TOOL_REPLACEMENT_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: TOOL_REPLACEMENT_FAILURE,
        payload: error.message,
      });
    }
}