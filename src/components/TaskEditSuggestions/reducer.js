const initialState = {
  isLoading: false,
  taskEditSuggestions: [],
  userSortDirection: null,
  dateSuggestedSortDirection: 'desc',
  count: 0,
};

const taskEditSuggestionsReducer = (action, state = initialState) => {
  const fetchedTaskEditSuggestions = [...action.payload];
  const filteredTaskEditSuggestions = [...state.taskEditSuggestions].filter(
    tes => tes._id !== action.payload,
  );
  switch (action.type) {
    case 'FETCH_TASK_EDIT_SUGGESTIONS_BEGIN':
      return { ...state, isLoading: true };
    case 'FETCH_TASK_EDIT_SUGGESTIONS_SUCESS':
      return {
        ...state,
        isLoading: false,
        count: fetchedTaskEditSuggestions.length,
        taskEditSuggestions: fetchedTaskEditSuggestions.sort((tes1, tes2) =>
          tes2.dateSuggested.localeCompare(tes1.dateSuggested),
        ),
      };
    case 'FETCH_TASK_EDIT_SUGGESTIONS_ERROR':
      return { ...state, isLoading: false };
    case 'REJECT_TASK_EDIT_SUGGESTION_SUCCESS':
      return {
        ...state,
        taskEditSuggestions: filteredTaskEditSuggestions,
        count: filteredTaskEditSuggestions.length,
      };
    case 'FETCH_TASK_EDIT_SUGGESTIONS_COUNT_SUCESS':
      return { ...state, count: action.payload };
    case 'TOGGLE_DATE_SUGGESTED_SORT_DIRECTION':
      if (state.dateSuggestedSortDirection == null || state.dateSuggestedSortDirection === 'asc') {
        return {
          ...state,
          dateSuggestedSortDirection: 'desc',
          taskEditSuggestions: [...state.taskEditSuggestions].sort((tes1, tes2) =>
            tes2.dateSuggested.localeCompare(tes1.dateSuggested),
          ),
          userSortDirection: null,
        };
      }
      if (state.dateSuggestedSortDirection === 'desc') {
        return {
          ...state,
          dateSuggestedSortDirection: 'asc',
          taskEditSuggestions: [...state.taskEditSuggestions].sort((tes1, tes2) =>
            tes1.dateSuggested.localeCompare(tes2.dateSuggested),
          ),
          userSortDirection: null,
        };
      }
      break;
    case 'TOGGLE_USER_SORT_DIRECTION':
      if (state.userSortDirection === null || state.userSortDirection === 'asc') {
        return {
          ...state,
          userSortDirection: 'desc',
          taskEditSuggestions: [...state.taskEditSuggestions].sort((tes1, tes2) =>
            tes2.user.localeCompare(tes1.user),
          ),
          dateSuggestedSortDirection: null,
        };
      }
      if (state.userSortDirection === 'desc') {
        return {
          ...state,
          userSortDirection: 'asc',
          taskEditSuggestions: [...state.taskEditSuggestions].sort((tes1, tes2) =>
            tes1.user.localeCompare(tes2.user),
          ),
          dateSuggestedSortDirection: null,
        };
      }
      break;
    default:
      return { ...state };
  }
  return { ...state };
};
export default taskEditSuggestionsReducer;
