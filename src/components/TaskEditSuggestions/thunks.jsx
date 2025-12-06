import { toast } from 'react-toastify';
import {
  fetchTaskEditSuggestionsBegin,
  fetchTaskEditSuggestionsError,
  fetchTaskEditSuggestionsSuccess,
  fetchTaskEditSuggestionCountSuccess,
} from './actions';
import { getTaskEditSuggestionsHTTP, getTaskEditSuggestionCountHTTP } from './service';

export const selectFetchTeamMembersTaskData = state => state.auth.user.userid;
export const selectUpdateTaskData = (state, taskId) =>
  state.tasks.taskItems.find(({ _id }) => _id === taskId);

export const fetchTaskEditSuggestions = () => async dispatch => {
  try {
    dispatch(fetchTaskEditSuggestionsBegin());
    const response = await getTaskEditSuggestionsHTTP();
    dispatch(fetchTaskEditSuggestionsSuccess(response));
  } catch (error) {
    dispatch(fetchTaskEditSuggestionsError());
  }
};

export const fetchTaskEditSuggestionCount = () => async dispatch => {
  try {
    const response = await getTaskEditSuggestionCountHTTP();
    dispatch(fetchTaskEditSuggestionCountSuccess(response.data.count));
  } catch (error) {
    toast.info(`fetch task edit suggestion count thunk error\n${error}`);
  }
};
