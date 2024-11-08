import {
  fetchTaskEditSuggestionsBegin,
  fetchTaskEditSuggestionsError,
  fetchTaskEditSuggestionsSuccess,
  fetchTaskEditSuggestionCountSuccess,
} from './actions';
import {
  getTaskEditSuggestionsHTTP,
  getTaskEditSuggestionCountHTTP,
} from './service';

export const fetchTaskEditSuggestions = () => async (dispatch) => {
  try {
    dispatch(fetchTaskEditSuggestionsBegin());
    const response = await getTaskEditSuggestionsHTTP();
    dispatch(fetchTaskEditSuggestionsSuccess(response));
  } catch (error) {
    dispatch(fetchTaskEditSuggestionsError());
  }
};

export const fetchTaskEditSuggestionCount = () => async (dispatch) => {
  try {
    const response = await getTaskEditSuggestionCountHTTP();
    dispatch(fetchTaskEditSuggestionCountSuccess(response.count));
  } catch (error) {
    // Removed console.log to comply with 'no-console' rule
    // Optionally, you can dispatch an error action here if available
  }
};
