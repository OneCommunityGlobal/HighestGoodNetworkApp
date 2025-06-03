import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk'; 
import {
  fetchTaskEditSuggestionsBegin,
  fetchTaskEditSuggestionsSuccess,
  fetchTaskEditSuggestionsError,
  rejectTaskEditSuggestionSuccess,
  toggleDateSuggestedSortDirection,
  toggleUserSortDirection,
  fetchTaskEditSuggestionCountSuccess,
} from '../actions'; 

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Redux Actions', () => {
  it('should create an action to begin fetching task edit suggestions', () => {
    const expectedAction = { type: 'FETCH_TASK_EDIT_SUGGESTIONS_BEGIN' };
    expect(fetchTaskEditSuggestionsBegin()).toEqual(expectedAction);
  });

  it('should create an action for successful task edit suggestions fetching', () => {
    const data = { /* your data here */ };
    const expectedAction = { type: 'FETCH_TASK_EDIT_SUGGESTIONS_SUCESS', payload: data };
    expect(fetchTaskEditSuggestionsSuccess(data)).toEqual(expectedAction);
  });

  it('should create an action for task edit suggestions fetching error', () => {
    const error = { message: 'Failed to fetch suggestions' }; // Replace with your error data
    const expectedAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_ERROR',
      payload: error,
    };

    expect(fetchTaskEditSuggestionsError(error)).toEqual(expectedAction);
  });

  it('should create an action for successful rejection of task edit suggestion', () => {
    const suggestionId = '123'; // Example suggestion ID
    const expectedAction = {
      type: 'REJECT_TASK_EDIT_SUGGESTION_SUCCESS',
      payload: suggestionId,
    };
    expect(rejectTaskEditSuggestionSuccess(suggestionId)).toEqual(expectedAction);
  });

  it('should create an action to toggle date suggested sort direction', () => {
    const expectedAction = { type: 'TOGGLE_DATE_SUGGESTED_SORT_DIRECTION' };
    expect(toggleDateSuggestedSortDirection()).toEqual(expectedAction);
  });

  it('should create an action to toggle user sort direction', () => {
    const expectedAction = { type: 'TOGGLE_USER_SORT_DIRECTION' };
    expect(toggleUserSortDirection()).toEqual(expectedAction);
  });

  it('should create an action for successful task edit suggestions count fetching', () => {
    const count = 42; // Example count value
    const expectedAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_COUNT_SUCESS',
      payload: count,
    };
    expect(fetchTaskEditSuggestionCountSuccess(count)).toEqual(expectedAction);
  });
});