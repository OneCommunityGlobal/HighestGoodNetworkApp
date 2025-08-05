import { createAction } from 'redux-actions';

export const fetchTaskEditSuggestionsBegin = createAction('FETCH_TASK_EDIT_SUGGESTIONS_BEGIN');
export const fetchTaskEditSuggestionsSuccess = createAction('FETCH_TASK_EDIT_SUGGESTIONS_SUCESS');
export const fetchTaskEditSuggestionsError = createAction('FETCH_TASK_EDIT_SUGGESTIONS_ERROR');

export const rejectTaskEditSuggestionSuccess = createAction('REJECT_TASK_EDIT_SUGGESTION_SUCCESS');

export const toggleDateSuggestedSortDirection = createAction(
  'TOGGLE_DATE_SUGGESTED_SORT_DIRECTION',
);
export const toggleUserSortDirection = createAction('TOGGLE_USER_SORT_DIRECTION');

export const fetchTaskEditSuggestionCountSuccess = createAction(
  'FETCH_TASK_EDIT_SUGGESTIONS_COUNT_SUCESS',
);
