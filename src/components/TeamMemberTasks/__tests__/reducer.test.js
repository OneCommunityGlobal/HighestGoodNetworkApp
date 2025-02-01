import { teamMemberTasksReducer } from '../reducer';
describe('teamMemberTasksReducer', () => {
  const initialState = {
    isLoading: false,
    usersWithTasks: [],
    usersWithTimeEntries: [],
  };

  it('should return the initial state when no action is provided', () => {
    expect(teamMemberTasksReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FETCH_TEAM_MEMBERS_DATA_BEGIN', () => {
    const action = { type: 'FETCH_TEAM_MEMBERS_DATA_BEGIN' };
    const expectedState = { ...initialState, isLoading: true };
    expect(teamMemberTasksReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_TEAM_MEMBERS_DATA_ERROR', () => {
    const action = { type: 'FETCH_TEAM_MEMBERS_DATA_ERROR' };
    const expectedState = { ...initialState, isLoading: false };
    expect(teamMemberTasksReducer({ ...initialState, isLoading: true }, action)).toEqual(
      expectedState,
    );
  });

  it('should handle FETCH_TEAM_MEMBERS_TASK_SUCCESS', () => {
    const action = {
      type: 'FETCH_TEAM_MEMBERS_TASK_SUCCESS',
      payload: { usersWithTasks: [{ id: 1, name: 'John Doe' }] },
    };
    const expectedState = {
      ...initialState,
      isLoading: false,
      usersWithTasks: [{ id: 1, name: 'John Doe' }],
    };
    expect(teamMemberTasksReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_TEAM_MEMBERS_TIMEENTRIES_SUCCESS', () => {
    const action = {
      type: 'FETCH_TEAM_MEMBERS_TIMEENTRIES_SUCCESS',
      payload: { usersWithTimeEntries: [{ _id: 1, hours: 10 }] },
    };
    const expectedState = {
      ...initialState,
      isLoading: false,
      usersWithTimeEntries: [{ _id: 1, hours: 10 }],
    };
    expect(teamMemberTasksReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle UPDATE_TEAM_MEMBERS_TIMEENTRY_SUCCESS', () => {
    const action = {
      type: 'UPDATE_TEAM_MEMBERS_TIMEENTRY_SUCCESS',
      payload: { _id: 1, hours: 15 },
    };
    const initialStateWithEntries = {
      ...initialState,
      usersWithTimeEntries: [{ _id: 1, hours: 10 }],
    };
    const expectedState = {
      ...initialState,
      usersWithTimeEntries: [{ _id: 1, hours: 15 }],
    };
    expect(teamMemberTasksReducer(initialStateWithEntries, action)).toEqual(expectedState);
  });

  it('should handle DELETE_TASK_NOTIFICATION_SUCCESS', () => {
    const action = {
      type: 'DELETE_TASK_NOTIFICATION_SUCCESS',
      payload: {
        userId: 1,
        taskId: 1,
        taskNotificationId: 1,
      },
    };
    const initialStateWithTasks = {
      ...initialState,
      usersWithTasks: [
        {
          personId: 1,
          tasks: [
            {
              _id: 1,
              taskNotifications: [{ _id: 1 }, { _id: 2 }],
            },
          ],
        },
      ],
    };
    const expectedState = {
      ...initialState,
      usersWithTasks: [
        {
          personId: 1,
          tasks: [
            {
              _id: 1,
              taskNotifications: [{ _id: 2 }],
            },
          ],
        },
      ],
      isLoading: false,
    };
    expect(teamMemberTasksReducer(initialStateWithTasks, action)).toEqual(expectedState);
  });

  it('should handle DELETE_TASK_NOTIFICATION_BEGIN', () => {
    const action = { type: 'DELETE_TASK_NOTIFICATION_BEGIN' };
    const expectedState = { ...initialState, isLoading: true };
    expect(teamMemberTasksReducer(initialState, action)).toEqual(expectedState);
  });
});
