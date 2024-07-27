import { ENDPOINTS } from 'utils/URL';
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

const selectFetchTeamMembersTaskData = state => state.auth.user.userid;
const selectUpdateTaskData = (state, taskId) =>
  state.tasks.taskItems.find(({ _id }) => _id === taskId);

export const fetchTaskEditSuggestions = () => async (dispatch, getState) => {
  try {
    dispatch(fetchTaskEditSuggestionsBegin());
    const response = await getTaskEditSuggestionsHTTP();
    dispatch(fetchTaskEditSuggestionsSuccess(response));
  } catch (error) {
    dispatch(fetchTaskEditSuggestionsError());
  }
};

export const fetchTaskEditSuggestionCount = () => async (dispatch, getState) => {
  try {
    const response = await getTaskEditSuggestionCountHTTP();
    dispatch(fetchTaskEditSuggestionCountSuccess(response.data.count));
  } catch (error) {
    console.log(`fetch task edit suggestion count thunk error\n${  error}`);
  }
};
