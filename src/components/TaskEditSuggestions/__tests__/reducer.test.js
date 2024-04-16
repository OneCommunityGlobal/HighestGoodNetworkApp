import { taskEditSuggestionsReducer, initialState } from "../reducer";

describe('taskEditSuggestionsReducer', () => {
  // test for inital state
  it('should return the initial state', () => {
    expect(taskEditSuggestionsReducer(undefined,{})).toEqual({
      count:0,
      dateSuggestedSortDirection: 'desc',
      isLoading: false,
      taskEditSuggestions: [],
      userSortDirection: null
    });
  });
// test for FETCH_TASK_EDIT_SUGGESTIONS_BEGIN
  it('handles FETCH_TASK_EDIT_SUGGESTIONS_BEGIN action', () => {
    const startAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_BEGIN'

    };
    expect(taskEditSuggestionsReducer(undefined, startAction)).toEqual({ 
      isLoading: true,
      taskEditSuggestions:[],
      userSortDirection: null,
      dateSuggestedSortDirection: 'desc',
      count:0
     });
  });

  //test for FETCH_TASK_EDIT_SUGGESTIONS_SUCESS
  it('handles FETCH_TASK_EDIT_SUGGESTIONS_SUCESS action', () => {
    const mockAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_SUCESS',
      payload: [{ _id: '1', dateSuggested: '2023-01-01', user: 'UserA' }, { _id: '2', dateSuggested: '2023-01-02', user: 'UserB'}],
    };
    const expectedState = {
      dateSuggestedSortDirection: 'desc',
      userSortDirection: null,
      isLoading: false,
      count: 2,
      taskEditSuggestions: mockAction.payload.sort((a, b) => b.dateSuggested.localeCompare(a.dateSuggested)),
    };
    expect(taskEditSuggestionsReducer(initialState, mockAction)).toEqual(expectedState);
  });

  //test for FETCH_TASK_EDIT_SUGGESTIONS_ERROR
  it('handles FETCH_TASK_EDIT_SUGGESTIONS_ERROR action', () => {
    const errorAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_ERROR'
    };
    expect(taskEditSuggestionsReducer(undefined, errorAction)).toEqual({
      dateSuggestedSortDirection: 'desc',
      userSortDirection: null,
      taskEditSuggestions:[],
      count: 0,
      isLoading: false,
    });
  });

  // test for REJECT_TASK_EDIT_SUGGESTION_SUCCESS
  it('handles REJECT_TASK_EDIT_SUGGESTION_SUCCESS action', () => {
    const rejectAction = {
      type: 'REJECT_TASK_EDIT_SUGGESTION_SUCCESS',
      payload: '1' // Assuming _id: 1 is the id to be rejected
    };
    const currentState = {
      dateSuggestedSortDirection: 'desc',
      isLoading: false,
      userSortDirection: null,
      taskEditSuggestions: [{ _id: '1', user: 'UserA' }, { _id: '2', user: 'UserB' }],
      count: 2,
    };
    expect(taskEditSuggestionsReducer(currentState, rejectAction)).toEqual({
      ...currentState,
      taskEditSuggestions: [{ _id: '2', user: 'UserB' }],
      count: 1
    });
  });

  // test for FETCH_TASK_EDIT_SUGGESTIONS_COUNT_SUCESS
  it('handles FETCH_TASK_EDIT_SUGGESTIONS_COUNT_SUCESS action', () => {
    const countAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_COUNT_SUCESS',
      payload: 5
    };
    expect(taskEditSuggestionsReducer(initialState, countAction)).toEqual({
      dateSuggestedSortDirection: 'desc',
      isLoading: false,
      taskEditSuggestions: [],
      userSortDirection: null,
      count: 5
    });
  });

  //test for TOGGLE_DATE_SUGGESTED_SORT_DIRECTION
  it('should handle TOGGLE_DATE_SUGGESTED_SORT_DIRECTION',()=>{ 
    const currentState = {
      taskEditSuggestions: [{_id: '1', dateSuggested: '2023-01-02' }, { _id: '2', dateSuggested: '2023-01-01' }],
      dateSuggestedSortDirection: 'asc'
    };
    const toggleDateAction={
      type:'TOGGLE_DATE_SUGGESTED_SORT_DIRECTION' 
    };
    expect(taskEditSuggestionsReducer(currentState,toggleDateAction)).toEqual({ 
      ...currentState, 
      dateSuggestedSortDirection: 'desc',
      taskEditSuggestions: currentState.taskEditSuggestions.sort((a, b) => b.dateSuggested.localeCompare(a.dateSuggested)),
      userSortDirection: null
    });
  });

  // Test for TOGGLE_USER_SORT_DIRECTION
  it('should handle TOGGLE_USER_SORT_DIRECTION',()=>{ 
    const currentState ={
      isLoading: false,
      userSortDirection: null,
      taskEditSuggestions: [{_id: '1', user: 'UserA'}, {_id: '2', user: 'UserB' }], 
      userSortDirection: 'asc'
    };
    const toggleUserAction={
      type:'TOGGLE_USER_SORT_DIRECTION'
    };
    expect(taskEditSuggestionsReducer(currentState, toggleUserAction)).toEqual({ 
      ...currentState,
      userSortDirection: 'desc',
      taskEditSuggestions: currentState.taskEditSuggestions.sort((a, b) => b.user.localeCompare(a.user)), 
      dateSuggestedSortDirection: null
    });
  }); 
});