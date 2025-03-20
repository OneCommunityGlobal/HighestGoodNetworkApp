import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import * as actions from '../../constants/allUsersTimeEntries';
import { getAllUsersTimeEntries } from '../allUsersTimeEntries';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('getAllUsersTimeEntries actions', () => {
  let store;

  const mockUsers = ['user1', 'user2'];
  const mockFromDate = '2023-01-01';
  const mockToDate = '2023-01-31';

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  it('dispatches FETCH_ALL_USERS_TIME_ENTRIES_SUCCESS on successful API call', async () => {
    const mockResponse = {
      status: 200,
      data: [
        { userId: 'user1', timeEntries: [{ date: '2023-01-01', hours: 8 }] },
        { userId: 'user2', timeEntries: [{ date: '2023-01-02', hours: 7 }] },
      ],
    };

    axios.post.mockResolvedValueOnce({ data: mockResponse });

    const expectedActions = [
      { type: actions.FETCH_ALL_USERS_TIME_ENTRIES_BEGIN },
      {
        type: actions.FETCH_ALL_USERS_TIME_ENTRIES_SUCCESS,
        payload: { usersTimeEntries: mockResponse },
      },
    ];

    const result = await store.dispatch(
      getAllUsersTimeEntries(mockUsers, mockFromDate, mockToDate),
    );

    expect(store.getActions()).toEqual(expectedActions);
    expect(result).toEqual({ status: 200, data: mockResponse.data });
    expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.TIME_ENTRIES_USER_LIST, {
      users: mockUsers,
      fromDate: mockFromDate,
      toDate: mockToDate,
    });
  });

  it('dispatches FETCH_ALL_USERS_TIME_ENTRIES_ERROR on failed API call', async () => {
    const mockError = {
      usersTimeEntries: {
        status: 500,
        message: 'Internal Server Error',
      },
    };

    axios.post.mockRejectedValueOnce(mockError);

    const expectedActions = [
      { type: actions.FETCH_ALL_USERS_TIME_ENTRIES_BEGIN },
      { type: actions.FETCH_ALL_USERS_TIME_ENTRIES_ERROR, payload: { error: mockError } },
    ];

    const result = await store.dispatch(
      getAllUsersTimeEntries(mockUsers, mockFromDate, mockToDate),
    );

    expect(store.getActions()).toEqual(expectedActions);
    expect(result).toBe(500); // Ensuring the function returns the correct status
    expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.TIME_ENTRIES_USER_LIST, {
      users: mockUsers,
      fromDate: mockFromDate,
      toDate: mockToDate,
    });
  });
});
