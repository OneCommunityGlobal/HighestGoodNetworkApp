import { fetchTaskEditSuggestionsBegin, fetchTaskEditSuggestionsError, fetchTaskEditSuggestionsSuccess, rejectTaskEditSuggestionSuccess, fetchTaskEditSuggestionCountSuccess, createTaskEditSuggestion, updateTaskEditSuggestion } from "./actions";
import { ENDPOINTS } from "utils/URL";
import { getTaskEditSuggestionsHTTP, rejectTaskEditSuggestionHTTP, getTaskEditSuggestionCountHTTP, createOrUpdateTaskEditSuggestionHTTP } from "./service";

const selectFetchTeamMembersTaskData = (state) => state.auth.user.userid;
const selectUpdateTaskData = (state, taskId) => state.tasks.taskItems.find(({_id}) => _id === taskId);

export const fetchTaskEditSuggestions = () => async (dispatch, getState) => {
  try {
    dispatch(fetchTaskEditSuggestionsBegin());
    const response = await getTaskEditSuggestionsHTTP();
    dispatch(fetchTaskEditSuggestionsSuccess(response.data));
  } catch (error) {
    dispatch(fetchTaskEditSuggestionsError());
  }
};

export const rejectTaskEditSuggestion = (taskEditSuggestionId) => async (dispatch, getState) => {
  try {
    // dispatch(rejectTaskEditSuggestionBegin());
    await rejectTaskEditSuggestionHTTP(taskEditSuggestionId);
    dispatch(rejectTaskEditSuggestionSuccess(taskEditSuggestionId));
  } catch (error) {
    console.log('reject task edit suggestion thunk error ' + error);
    // dispatch(rejectTaskEditSuggestionError());
  }
};

export const fetchTaskEditSuggestionCount = () => async (dispatch, getState) => {
  try {
    const response = await getTaskEditSuggestionCountHTTP();
    dispatch(fetchTaskEditSuggestionCountSuccess(response.data.count));
  } catch (error) {
    console.log('fetch task edit suggestion count thunk error ' + error);
  }
}

// TODO: put arguments in first paren
export const createOrUpdateTaskEditSuggestion = (taskId, userId, oldTask, updatedTask) => async (dispatch, getState) => {
  try {
    const response = await createOrUpdateTaskEditSuggestionHTTP(taskId, userId, oldTask, updatedTask);
    if (response.data.lastErrorObject.updatedExisting === true) {
      dispatch(updateTaskEditSuggestion(response.data.value));
    } else if (response.data.lastErrorObject.updatedExisting === false) {
      dispatch(createTaskEditSuggestion(response.data.value));
    }
  } catch (error) {
    console.log('create or update task edit suggestion thunk error ' + error);
  }
}