import { ENDPOINTS } from 'utils/URL';
import {
  fetchTaskEditSuggestionsBegin,
  fetchTaskEditSuggestionsError,
  fetchTaskEditSuggestionsSuccess,
  rejectTaskEditSuggestionSuccess,
  fetchTaskEditSuggestionCountSuccess,
} from './actions';
import {
  getTaskEditSuggestionsHTTP,
  rejectTaskEditSuggestionHTTP,
  getTaskEditSuggestionCountHTTP,
} from './service';

const selectFetchTeamMembersTaskData = state => state.auth.user.userid;
const selectUpdateTaskData = (state, taskId) =>
  state.tasks.taskItems.find(({ _id }) => _id === taskId);

export const fetchTaskEditSuggestions = () => async (dispatch, getState) => {
  try {
    dispatch(fetchTaskEditSuggestionsBegin());
    const response = await getTaskEditSuggestionsHTTP();
    dispatch(fetchTaskEditSuggestionsSuccess(response.data));
  } catch (error) {
    dispatch(fetchTaskEditSuggestionsError());
  }
};

export const rejectTaskEditSuggestion = taskEditSuggestionId => async (dispatch, getState) => {
  try {
    await rejectTaskEditSuggestionHTTP(taskEditSuggestionId);
    dispatch(rejectTaskEditSuggestionSuccess(taskEditSuggestionId));
  } catch (error) {
    console.log(`reject task edit suggestion thunk error\n${  error}`);
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
