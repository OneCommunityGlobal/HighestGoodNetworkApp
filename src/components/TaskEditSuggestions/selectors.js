export const getTaskEditSuggestionsData = (state) => ({
  isLoading: state.taskEditSuggestions.isLoading,
  taskEditSuggestions: state.taskEditSuggestions.taskEditSuggestions
});