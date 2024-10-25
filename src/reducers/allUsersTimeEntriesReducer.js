import * as actions from '../constants/allUsersTimeEntries';

const initialState = {
  usersTimeEntries: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
export default function allUsersTimeEntriesReducer(state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_ALL_USERS_TIME_ENTRIES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actions.FETCH_ALL_USERS_TIME_ENTRIES_SUCCESS:
      return {
        ...state,
        loading: false,
        usersTimeEntries: action.payload.usersTimeEntries,
      };

    case actions.FETCH_ALL_USERS_TIME_ENTRIES_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
}
