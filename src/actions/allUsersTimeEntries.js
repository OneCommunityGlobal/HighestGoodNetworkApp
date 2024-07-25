import axios from 'axios';
import * as actions from '../constants/allUsersTimeEntries';
import { ENDPOINTS } from '../utils/URL';

/**
 * Action to set the 'loading' flag to true.
 */
export const fetchAllUsersTimeEntriesBegin= () => ({
  type: actions.FETCH_ALL_USERS_TIME_ENTRIES_BEGIN,
});

/**
 * This action is used to set the all users time entries summaries in store.
 *
 * @param {array} usersTimeEntries An  array of all users.
 */
export const fetchAllUsersTimeEntriesSuccess = usersTimeEntries => ({
  type: actions.FETCH_ALL_USERS_TIME_ENTRIES_SUCCESS,
  payload: { usersTimeEntries },
});
/**
 * Handle the error case.
 *
 * @param {Object} error The error object.
 */
export const fetchAllUsersTimeEntriesError = error => ({
  type: actions.FETCH_ALL_USERS_TIME_ENTRIES_ERROR,
  payload: { error },
});

export const getAllUsersTimeEntries = (users, fromDate, toDate) => {
  const url = ENDPOINTS.TIME_ENTRIES_USER_LIST;
  return async dispatch => {
    dispatch(fetchAllUsersTimeEntriesBegin());
    try {
      const { data: usersTimeEntries } = await axios.post(url, {users, fromDate, toDate});
      dispatch(fetchAllUsersTimeEntriesSuccess(usersTimeEntries));
      return {status: usersTimeEntries.status, data: usersTimeEntries.data};
    } catch (error) {
      dispatch(fetchAllUsersTimeEntriesError(error));
      return error.usersTimeEntries.status;
    }
  };
};
