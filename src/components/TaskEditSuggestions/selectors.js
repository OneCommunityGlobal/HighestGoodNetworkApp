export const getTaskEditSuggestionsData = state => {
  return {
    userRole: state.auth.user.role,
    isLoading: state.taskEditSuggestions.isLoading,
    taskEditSuggestions: state.taskEditSuggestions.taskEditSuggestions,
    userSortDirection: state.taskEditSuggestions.userSortDirection,
    dateSuggestedSortDirection: state.taskEditSuggestions.dateSuggestedSortDirection,
  };
};
