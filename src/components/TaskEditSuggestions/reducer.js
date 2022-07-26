const initialState = {
  isLoading: false,
  taskEditSuggestions: [],
  userSortDirection: null,
  dateSuggestedSortDirection: "desc"
};

export const taskEditSuggestionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_TASK_EDIT_SUGGESTIONS_BEGIN":
      return { ...state, isLoading: true } ;
    case "FETCH_TASK_EDIT_SUGGESTIONS_SUCESS":
      return { ...state, isLoading: false, taskEditSuggestions: [...action.payload].sort((tes1, tes2) => tes2.dateSuggested.localeCompare(tes1.dateSuggested)) };
    case "FETCH_TASK_EDIT_SUGGESTIONS_ERROR":
      return { ...state, isLoading: false };
    case "TOGGLE_DATE_SUGGESTED_SORT_DIRECTION":
      if (state.dateSuggestedSortDirection == null || state.dateSuggestedSortDirection == "asc") {
        return { ...state,
          dateSuggestedSortDirection: "desc", 
          taskEditSuggestions: [...state.taskEditSuggestions].sort((tes1, tes2) => tes2.dateSuggested.localeCompare(tes1.dateSuggested)),
          userSortDirection: null,
         }
      } else if (state.dateSuggestedSortDirection == "desc") {
        return { ...state,
          dateSuggestedSortDirection: "asc", 
          taskEditSuggestions: [...state.taskEditSuggestions].sort((tes1, tes2) => tes1.dateSuggested.localeCompare(tes2.dateSuggested)),
          userSortDirection: null,
         }
      }
    case "TOGGLE_USER_SORT_DIRECTION":
      if (state.userSortDirection == null || state.userSortDirection == "asc") {
        return { ...state,
          userSortDirection: "desc", 
          taskEditSuggestions: [...state.taskEditSuggestions].sort((tes1, tes2) => tes2.user.localeCompare(tes1.user)),
          dateSuggestedSortDirection: null,
          }
      } else if (state.userSortDirection == "desc") {
        return { ...state,
          userSortDirection: "asc", 
          taskEditSuggestions: [...state.taskEditSuggestions].sort((tes1, tes2) => tes1.user.localeCompare(tes2.user)),
          dateSuggestedSortDirection: null,
          }
      }
    default:
      return { ...state };
  }
};
