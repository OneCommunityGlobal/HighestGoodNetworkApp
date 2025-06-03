import { createAction } from 'redux-actions';

export const fetchTeamMembersDataBegin = createAction('FETCH_TEAM_MEMBERS_DATA_BEGIN');
export const fetchTeamMembersTaskSuccess = createAction('FETCH_TEAM_MEMBERS_TASK_SUCCESS');
export const fetchTeamMembersTimeEntriesSuccess = createAction('FETCH_TEAM_MEMBERS_TIMEENTRIES_SUCCESS');
export const updateTeamMembersTimeEntrySuccess = createAction('UPDATE_TEAM_MEMBERS_TIMEENTRY_SUCCESS');
export const fetchTeamMembersDataError = createAction('FETCH_TEAM_MEMBERS_DATA_ERROR');

export const createOrUpdateTaskNotificationBegin = createAction(
  'CREATE_OR_UPDATE_TASK_NOTIFICATION_BEGIN',
);
export const createOrUpdateTaskNotificationSuccess = createAction(
  'CREATE_OR_UPDATE_TASK_NOTIFICATION_SUCCESS',
);
export const createOrUpdateTaskNotificationError = createAction(
  'CREATE_OR_UPDATE_TASK_NOTIFICATION_ERROR',
);

export const deleteTaskNotificationBegin = createAction('DELETE_TASK_NOTIFICATION_BEGIN');
export const deleteTaskNotificationSuccess = createAction('DELETE_TASK_NOTIFICATION_SUCCESS');
export const deleteTaskNotificationError = createAction('DELETE_TASK_NOTIFICATION_ERROR');