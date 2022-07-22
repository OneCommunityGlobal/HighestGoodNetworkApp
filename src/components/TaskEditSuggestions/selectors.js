export const getTaskEditSuggestionsData = (state) => {
  return ({
  isLoading: state.taskEditSuggestions.isLoading,
  taskEditSuggestions: state.taskEditSuggestions.taskEditSuggestions
})};