import { createAction } from 'redux-actions';

export const fetchTeamMembersTaskBegin = createAction('FETCH_TEAM_MEMBERS_TASK_BEGIN');
export const fetchTeamMembersTaskSuccess = createAction('FETCH_TEAM_MEMBERS_TASK_SUCCESS');
export const fetchTeamMembersTaskError = createAction('FETCH_TEAM_MEMBERS_TASK_ERROR');

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

export const dataLoading = createAction('DATA_LOADING');
export const finishLoading = createAction('FINISH_LOADING');
