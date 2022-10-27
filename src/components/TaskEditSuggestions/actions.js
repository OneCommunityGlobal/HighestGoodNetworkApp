import { createAction } from "redux-actions";

export const fetchTaskEditSuggestionsBegin = createAction("FETCH_TASK_EDIT_SUGGESTIONS_BEGIN");
export const fetchTaskEditSuggestionsSuccess = createAction("FETCH_TASK_EDIT_SUGGESTIONS_SUCESS");
export const fetchTaskEditSuggestionsError = createAction("FETCH_TASK_EDIT_SUGGESTIONS_ERROR");