// Updated Import Statement: Use default import instead of named import
import taskEditSuggestionsReducer from "../reducer";

describe('taskEditSuggestionsReducer', () => {
  // Define initialState within the test file
  const initialState = {
    count: 0,
    dateSuggestedSortDirection: 'desc',
    isLoading: false,
    taskEditSuggestions: [],
    userSortDirection: null
  };

  // Test for initial state
  it('should return the initial state', () => {
    expect(taskEditSuggestionsReducer(undefined, {})).toEqual(initialState);
  });

  // Test for FETCH_TASK_EDIT_SUGGESTIONS_BEGIN
  it('handles FETCH_TASK_EDIT_SUGGESTIONS_BEGIN action', () => {
    const startAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_BEGIN'
    };
    const expectedState = { 
      ...initialState,
      isLoading: true
    };
    expect(taskEditSuggestionsReducer(initialState, startAction)).toEqual(expectedState);
  });

  // Test for FETCH_TASK_EDIT_SUGGESTIONS_SUCCESS
  it('handles FETCH_TASK_EDIT_SUGGESTIONS_SUCCESS action', () => {
    const mockAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_SUCCESS',
      payload: [
        { _id: '1', dateSuggested: '2023-01-01', user: 'UserA' },
        { _id: '2', dateSuggested: '2023-01-02', user: 'UserB' }
      ],
    };
    const expectedState = {
      ...initialState,
      isLoading: false,
      count: 2,
      taskEditSuggestions: mockAction.payload.sort((a, b) => b.dateSuggested.localeCompare(a.dateSuggested)),
    };
    expect(taskEditSuggestionsReducer(initialState, mockAction)).toEqual(expectedState);
  });

  // Test for FETCH_TASK_EDIT_SUGGESTIONS_ERROR
  it('handles FETCH_TASK_EDIT_SUGGESTIONS_ERROR action', () => {
    const errorAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_ERROR'
    };
    const expectedState = {
      ...initialState,
      isLoading: false
    };
    expect(taskEditSuggestionsReducer(initialState, errorAction)).toEqual(expectedState);
  });

  // Test for REJECT_TASK_EDIT_SUGGESTION_SUCCESS
  it('handles REJECT_TASK_EDIT_SUGGESTION_SUCCESS action', () => {
    const rejectAction = {
      type: 'REJECT_TASK_EDIT_SUGGESTION_SUCCESS',
      payload: '1' // Assuming _id: '1' is the id to be rejected
    };
    const currentState = {
      ...initialState,
      isLoading: false,
      taskEditSuggestions: [
        { _id: '1', user: 'UserA' },
        { _id: '2', user: 'UserB' }
      ],
      count: 2,
    };
    const expectedState = {
      ...currentState,
      taskEditSuggestions: currentState.taskEditSuggestions.filter(suggestion => suggestion._id !== rejectAction.payload),
      count: 1
    };
    expect(taskEditSuggestionsReducer(currentState, rejectAction)).toEqual(expectedState);
  });

  // Test for FETCH_TASK_EDIT_SUGGESTIONS_COUNT_SUCCESS
  it('handles FETCH_TASK_EDIT_SUGGESTIONS_COUNT_SUCCESS action', () => {
    const countAction = {
      type: 'FETCH_TASK_EDIT_SUGGESTIONS_COUNT_SUCCESS',
      payload: 5
    };
    const expectedState = {
      ...initialState,
      count: 5
    };
    expect(taskEditSuggestionsReducer(initialState, countAction)).toEqual(expectedState);
  });

  // Test for TOGGLE_DATE_SUGGESTED_SORT_DIRECTION
  it('should handle TOGGLE_DATE_SUGGESTED_SORT_DIRECTION', () => { 
    const currentState = {
      ...initialState,
      taskEditSuggestions: [
        { _id: '1', dateSuggested: '2023-01-02' },
        { _id: '2', dateSuggested: '2023-01-01' }
      ],
      dateSuggestedSortDirection: 'asc'
    };
    const toggleDateAction = {
      type: 'TOGGLE_DATE_SUGGESTED_SORT_DIRECTION' 
    };
    const expectedState = { 
      ...currentState, 
      dateSuggestedSortDirection: 'desc',
      taskEditSuggestions: [...currentState.taskEditSuggestions].sort((a, b) => b.dateSuggested.localeCompare(a.dateSuggested)),
      userSortDirection: null
    };
    expect(taskEditSuggestionsReducer(currentState, toggleDateAction)).toEqual(expectedState);
  });

  // Test for TOGGLE_USER_SORT_DIRECTION
  it('should handle TOGGLE_USER_SORT_DIRECTION', () => { 
    const currentState = {
      ...initialState,
      isLoading: false,
      userSortDirection: 'asc',
      taskEditSuggestions: [
        { _id: '1', user: 'UserA' },
        { _id: '2', user: 'UserB' }
      ]
    };
    const toggleUserAction = {
      type: 'TOGGLE_USER_SORT_DIRECTION'
    };
    const expectedState = { 
      ...currentState,
      userSortDirection: 'desc',
      taskEditSuggestions: [...currentState.taskEditSuggestions].sort((a, b) => b.user.localeCompare(a.user)), 
      dateSuggestedSortDirection: null
    };
    expect(taskEditSuggestionsReducer(currentState, toggleUserAction)).toEqual(expectedState);
  }); 
});
