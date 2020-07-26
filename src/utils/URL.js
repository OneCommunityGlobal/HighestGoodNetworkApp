const APIEndpoint = process.env.REACT_APP_APIENDPOINT

export const ENDPOINTS = {
  USER_PROFILE: userId => `${APIEndpoint}/userprofile/${userId}`,
  USER_PROFILES: `${APIEndpoint}/userprofile/`,
  USER_TEAM: userId => `${APIEndpoint}/userprofile/teammembers/${userId}`,
  LOGIN: `${APIEndpoint}/login`,
  PROJECTS: `${APIEndpoint}/projects`,
  USER_PROJECTS: userId => `${APIEndpoint}/projects/user/${userId}`,
  PROJECT: `${APIEndpoint}/project/`,
  PROJECT_MEMBER: projectId => `${APIEndpoint}/project/${projectId}/users`,
  UPDATE_PASSWORD: userId => `${APIEndpoint}/userprofile/${userId}/updatePassword`,
  FORCE_PASSWORD: `${APIEndpoint}/forcepassword`,
  LEADER_BOARD: userId => `${APIEndpoint}/dashboard/leaderboard/${userId}`,
  TIME_ENTRIES_PERIOD: (userId, fromDate, toDate) => `${APIEndpoint}/TimeEntry/user/${userId}/${fromDate}/${toDate}`,
  TIME_ENTRY: () => `${APIEndpoint}/TimeEntry`,
  TIME_ENTRY_CHANGE: timeEntryId => `${APIEndpoint}/TimeEntry/${timeEntryId}`,
  WBS: projectId => `${APIEndpoint}/wbs/${projectId}`,
  TASKS: wbsId => `${APIEndpoint}/tasks/${wbsId}`,
  TASK: wbsId => `${APIEndpoint}/task/${wbsId}`,
  TASKS_UPDATE: `${APIEndpoint}/tasks/update`,
  TASK_DEL: taskId => `${APIEndpoint}/task/del/${taskId}`,
  GET_TASK: taskId => `${APIEndpoint}/task/${taskId}`,
  TASK_UPDATE: taskId => `${APIEndpoint}/task/update/${taskId}`,
  GET_USER_BY_NAME: name => `${APIEndpoint}/userprofile/name/${name}`,
  FIX_TASKS: wbsId => `${APIEndpoint}/tasks/${wbsId}`,
  UPDATE_PARENT_TASKS: wbsId => `${APIEndpoint}/task/updateAllParents/${wbsId}`
}