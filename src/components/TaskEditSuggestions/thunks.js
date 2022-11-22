import { fetchTaskEditSuggestionsBegin, fetchTaskEditSuggestionsError, fetchTaskEditSuggestionsSuccess, rejectTaskEditSuggestionSuccess } from "./actions";
import { ENDPOINTS } from "utils/URL";
import { getTaskEditSuggestionsHTTP, rejectTaskEditSuggestionHTTP } from "./service";

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
    console.log('reject task edit suggestion thunk error\n' + error);
    // dispatch(rejectTaskEditSuggestionError());
  }
};