/* eslint-disable import/prefer-default-export */
let APIEndpoint =
  process.env.REACT_APP_APIENDPOINT || 'https://hgn-rest-beta.azurewebsites.net/api';
let GeocodeAPIEndpoint = 'https://api.opencagedata.com/geocode/v1/json';

export const ENDPOINTS = {
  APIEndpoint: () => APIEndpoint,
  USER_PROFILE: userId => `${APIEndpoint}/userprofile/${userId}`,
  USER_PROFILES: `${APIEndpoint}/userprofile/`,
  USER_PROFILE_BY_NAME: userName => `${APIEndpoint}/userProfile/name/${userName}`,
  USER_TEAM: userId => `${APIEndpoint}/userprofile/teammembers/${userId}`,
  LOGIN: `${APIEndpoint}/login`,
  PROJECTS: `${APIEndpoint}/projects`,
  TEAM: `${APIEndpoint}/team`,
  TEAM_DATA: teamId => `${APIEndpoint}/team/${teamId}`,
  TEAM_USERS: teamId => `${APIEndpoint}/team/${teamId}/users`,
  USER_PROJECTS: userId => `${APIEndpoint}/projects/user/${userId}`,
  PROJECT: `${APIEndpoint}/project/`,
  PROJECT_BY_ID: projectId => `${APIEndpoint}/project/${projectId}`,

  PROJECT_MEMBER: projectId => `${APIEndpoint}/project/${projectId}/users`,
  UPDATE_PASSWORD: userId => `${APIEndpoint}/userprofile/${userId}/updatePassword`,
  FORCE_PASSWORD: `${APIEndpoint}/forcepassword`,
  LEADER_BOARD: userId => `${APIEndpoint}/dashboard/leaderboard/${userId}`,
  ORG_DATA: `${APIEndpoint}/dashboard/leaderboard/org/data`,
  TIME_ENTRIES_PERIOD: (userId, fromDate, toDate) =>
    `${APIEndpoint}/TimeEntry/user/${userId}/${fromDate}/${toDate}`,
  TIME_ENTRIES_USER_LIST: users => `${APIEndpoint}/TimeEntry/users?members=${users}`,
  TIME_ENTRY: () => `${APIEndpoint}/TimeEntry`,
  TIME_ENTRY_CHANGE: timeEntryId => `${APIEndpoint}/TimeEntry/${timeEntryId}`,
  WBS_ALL: `${APIEndpoint}/wbs`,
  TIMER: userId => `${APIEndpoint}/timer/${userId}`,
  WBS: projectId => `${APIEndpoint}/wbs/${projectId}`,
  GET_WBS: wbsId => `${APIEndpoint}/wbsId/${wbsId}`,
  TASKS: (wbsId, level, mother) =>
    `${APIEndpoint}/tasks/${wbsId}/${level}/${mother ? mother : '0'}`,
  TASK: wbsId => `${APIEndpoint}/task/${wbsId}`,
  TASK_IMPORT: wbsId => `${APIEndpoint}/task/import/${wbsId}`,
  TASK_WBS: wbsId => `${APIEndpoint}/task/wbs/del/${wbsId}`,
  TASKS_UPDATE: `${APIEndpoint}/tasks/update`,
  TASKS_BY_USERID: members => `${APIEndpoint}/tasks/userProfile?members=${members}`,
  TASKS_BY_userID: userId => `${APIEndpoint}/tasks/userProfile/${userId}`,
  TASK_DEL: (taskId, motherId) => `${APIEndpoint}/task/del/${taskId}/${motherId}`,
  GET_TASK: taskId => `${APIEndpoint}/task/${taskId}`,
  TASK_UPDATE: taskId => `${APIEndpoint}/task/update/${taskId}`,
  GET_USER_BY_NAME: name => `${APIEndpoint}/userprofile/name/${name}`,
  FIX_TASKS: wbsId => `${APIEndpoint}/tasks/${wbsId}`,
  UPDATE_PARENT_TASKS: wbsId => `${APIEndpoint}/task/updateAllParents/${wbsId}`,
  MOVE_TASKS: wbsId => `${APIEndpoint}/tasks/moveTasks/${wbsId}`,
  WEEKLY_SUMMARIES_REPORT: () => `${APIEndpoint}/reports/weeklysummaries`,
  POPUP_EDITORS: `${APIEndpoint}/popupeditors/`,
  POPUP_EDITOR_BY_ID: id => `${APIEndpoint}/popupeditor/${id}`,
  POPUP_EDITOR_BACKUP_BY_ID: id => `${APIEndpoint}/backup/popupeditor/${id}`,

  TEAM_MEMBERS: teamId => `${APIEndpoint}/team/${teamId}/users`,
  TEAM_BY_ID: teamId => `${APIEndpoint}/team/${teamId}`,
  USER_UNREAD_TASK_NOTIFICATIONS: userId => `${APIEndpoint}/tasknotification/user/${userId}`,
  BADGE: () => `${APIEndpoint}/badge`,
  BADGE_ASSIGN: userId => `${APIEndpoint}/badge/assign/${userId}`,
  BADGE_BY_ID: badgeId => `${APIEndpoint}/badge/${badgeId}`,

  TEAM_MEMBER_TASKS: userId => `${ENDPOINTS.APIEndpoint()}/user/${userId}/teams/tasks`,
  CREATE_OR_UPDATE_TASK_NOTIFICATION: taskId =>
    `${ENDPOINTS.APIEndpoint()}/task/${taskId}/tasknotification`,
  DELETE_TASK_NOTIFICATION: taskNotificationId =>
    `${APIEndpoint}/tasknotification/${taskNotificationId}`,

  TASK_EDIT_SUGGESTION: () => `${APIEndpoint}/taskeditsuggestion`,
  REJECT_TASK_EDIT_SUGGESTION: taskEditSuggestionId =>
    `${ENDPOINTS.TASK_EDIT_SUGGESTION()}/${taskEditSuggestionId}`,

  TIMEZONE_KEY: `${APIEndpoint}/timezone`,
  GEOCODE_URI: (location, key) =>
    `${GeocodeAPIEndpoint}?key=${key}&q=${encodeURIComponent(location)}&pretty=1&limit=1`,

  ROLES: () => `${APIEndpoint}/roles`,
  ROLES_BY_ID: roleId => `${APIEndpoint}/roles/${roleId}`,
};

export const ApiEndpoint = APIEndpoint;
