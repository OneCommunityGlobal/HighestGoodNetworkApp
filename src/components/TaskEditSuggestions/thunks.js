import { fetchTaskEditSuggestionsBegin, fetchTaskEditSuggestionsError, fetchTaskEditSuggestionsSuccess } from "./actions";
import { ENDPOINTS } from "utils/URL";
import { getTaskEditSuggestionsHTTP } from "./service";

const selectFetchTeamMembersTaskData = (state) => state.auth.user.userid;
const selectUpdateTaskData = (state, taskId) => state.tasks.taskItems.find(({_id}) => _id === taskId);

export const fetchTaskEditSuggestions = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const userId = selectFetchTeamMembersTaskData(state);
    dispatch(fetchTaskEditSuggestionsBegin());
    const response = await getTaskEditSuggestionsHTTP();
    dispatch(fetchTaskEditSuggestionsSuccess(response.data));
  } catch (error) {
    dispatch(fetchTaskEditSuggestionsError());
  }
};