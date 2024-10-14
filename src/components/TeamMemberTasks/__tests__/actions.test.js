import {
  fetchTeamMembersDataBegin,
  fetchTeamMembersTaskSuccess,
  fetchTeamMembersTimeEntriesSuccess,
  updateTeamMembersTimeEntrySuccess,
  fetchTeamMembersDataError,
  createOrUpdateTaskNotificationBegin,
  createOrUpdateTaskNotificationSuccess,
  createOrUpdateTaskNotificationError,
  deleteTaskNotificationBegin,
  deleteTaskNotificationSuccess,
  deleteTaskNotificationError,
} from '../actions'; 

describe('Action Creators', () => {
  it('should create fetchTeamMembersDataBegin action', () => {
    const expectedAction = {
      type: 'FETCH_TEAM_MEMBERS_DATA_BEGIN',
    };
    expect(fetchTeamMembersDataBegin()).toEqual(expectedAction);
  });

  it('should create fetchTeamMembersTaskSuccess action', () => {
    const payload = { task: 'example task' };
    const expectedAction = {
      type: 'FETCH_TEAM_MEMBERS_TASK_SUCCESS',
      payload,
    };
    expect(fetchTeamMembersTaskSuccess(payload)).toEqual(expectedAction);
  });

  it('should create fetchTeamMembersTimeEntriesSuccess action', () => {
    const payload = { entries: [] };
    const expectedAction = {
      type: 'FETCH_TEAM_MEMBERS_TIMEENTRIES_SUCCESS',
      payload,
    };
    expect(fetchTeamMembersTimeEntriesSuccess(payload)).toEqual(expectedAction);
  });

  it('should create updateTeamMembersTimeEntrySuccess action', () => {
    const payload = { entry: 'example entry' };
    const expectedAction = {
      type: 'UPDATE_TEAM_MEMBERS_TIMEENTRY_SUCCESS',
      payload,
    };
    expect(updateTeamMembersTimeEntrySuccess(payload)).toEqual(expectedAction);
  });

  it('should create fetchTeamMembersDataError action', () => {
    const error = 'Something went wrong';
    const expectedAction = {
      type: 'FETCH_TEAM_MEMBERS_DATA_ERROR',
      payload: error
    };
    expect(fetchTeamMembersDataError(error)).toEqual(expectedAction);
  });

  it('should create createOrUpdateTaskNotificationBegin action', () => {
    const expectedAction = {
      type: 'CREATE_OR_UPDATE_TASK_NOTIFICATION_BEGIN',
    };
    expect(createOrUpdateTaskNotificationBegin()).toEqual(expectedAction);
  });

  it('should create createOrUpdateTaskNotificationSuccess action', () => {
    const payload = { notification: 'example notification' };
    const expectedAction = {
      type: 'CREATE_OR_UPDATE_TASK_NOTIFICATION_SUCCESS',
      payload,
    };
    expect(createOrUpdateTaskNotificationSuccess(payload)).toEqual(expectedAction);
  });

  it('should create createOrUpdateTaskNotificationError action', () => {
    const error = 'Something went wrong';
    const expectedAction = {
      type: 'CREATE_OR_UPDATE_TASK_NOTIFICATION_ERROR',
      payload: error
    };
    expect(createOrUpdateTaskNotificationError(error)).toEqual(expectedAction);
  });

  it('should create deleteTaskNotificationBegin action', () => {
    const expectedAction = {
      type: 'DELETE_TASK_NOTIFICATION_BEGIN',
    };
    expect(deleteTaskNotificationBegin()).toEqual(expectedAction);
  });

  it('should create deleteTaskNotificationSuccess action', () => {
    const payload = { notificationId: 1 };
    const expectedAction = {
      type: 'DELETE_TASK_NOTIFICATION_SUCCESS',
      payload,
    };
    expect(deleteTaskNotificationSuccess(payload)).toEqual(expectedAction);
  });

  it('should create deleteTaskNotificationError action', () => {
    const error = 'Something went wrong';
    const expectedAction = {
      type: 'DELETE_TASK_NOTIFICATION_ERROR',
      payload: error
    };
    expect(deleteTaskNotificationError(error)).toEqual(expectedAction);
  });
});