const APIEndpoint =
  process.env.REACT_APP_APIENDPOINT || 'https://hgn-rest-beta.azurewebsites.net/api';

export const ENDPOINTS = {
  APIEndpoint: () => APIEndpoint,
  USER_PROFILE: userId => `${APIEndpoint}/userprofile/${userId}`,
  USER_PROFILE_PROPERTY: userId => `${APIEndpoint}/userprofile/${userId}/property`,
  USER_PROFILES: `${APIEndpoint}/userprofile/`,
  UPDATE_REHIREABLE_STATUS: userId => `${APIEndpoint}/userprofile/${userId}/rehireable`,
  TOGGLE_VISIBILITY: userId => `${APIEndpoint}/userprofile/${userId}/toggleInvisibility`,
  USER_PROFILE_UPDATE: `${APIEndpoint}/userprofile/update`,
  ADD_BLUE_SQUARE: userId => `${APIEndpoint}/userprofile/${userId}/addInfringement`,

  TASKS_TRENDS: () => `${APIEndpoint}/tasks/trends`,
  TASKS_SUMMARY: () => `${APIEndpoint}/tasks/summary`,

  TOP_CONVERTED: (limit, startDate, endDate) =>
    `${APIEndpoint}/job-analytics/top-converted?limit=${limit}${startDate && endDate ? `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}` : ''}`,
  LEAST_CONVERTED: (limit, startDate, endDate) =>
    `${APIEndpoint}/job-analytics/least-converted?limit=${limit}${startDate && endDate ? `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}` : ''}`,

  MODIFY_BLUE_SQUARE: (userId, blueSquareId) =>
    `${APIEndpoint}/userprofile/${userId}/infringements/${blueSquareId}`,

  // Blue Square Email Triggers
  BLUE_SQUARE_RESEND_INFRINGEMENT_EMAILS: () => `${APIEndpoint}/blueSquare/resend-infringement-emails-only`,
  BLUE_SQUARE_RESEND_WEEKLY_SUMMARY_EMAILS: () => `${APIEndpoint}/blueSquare/resend-weekly-summary-emails`,
  USERS_ALLTEAMCODE_CHANGE: `${APIEndpoint}/AllTeamCodeChanges`,
  REPLACE_TEAM_CODE: `${APIEndpoint}/userProfile/replaceTeamCode`,

  GET_JOB_FORMS: `${APIEndpoint}/jobForms`,

  USERS_REMOVE_PROFILE_IMAGE: `${APIEndpoint}/userProfile/profileImage/remove`,
  USERS_UPDATE_PROFILE_FROM_WEBSITE: `${APIEndpoint}/userProfile/profileImage/imagefromwebsite`,
  USER_PROFILE_BASIC_INFO: `${APIEndpoint}/userProfile/basicInfo`,
  USER_AUTOCOMPLETE: searchText => `${APIEndpoint}/userProfile/autocomplete/${searchText}`,
  SEARCH_USER: `${APIEndpoint}/users/search`,
  TOGGLE_BIO_STATUS: userId => `${APIEndpoint}/userProfile/${userId}/toggleBio`,

  INFO_COLLECTIONS: `${APIEndpoint}/informations`,
  INFO_COLLECTION: infoId => `${APIEndpoint}/informations/${infoId}`,
  USER_PROFILE_BY_NAME: userName => `${APIEndpoint}/userProfile/name/${userName}`,
  USER_PROFILE_BY_SINGLE_NAME: singleName => `${APIEndpoint}/userProfile/singleName/${singleName}`,
  USER_PROFILE_BY_FULL_NAME: fullName => `${APIEndpoint}/userProfile/fullName/${fullName}`,
  USER_TEAM: userId => `${APIEndpoint}/userprofile/teammembers/${userId}`,
  USER_REFRESH_TOKEN: userId => `${APIEndpoint}/refreshToken/${userId}`,
  USER_ALL_TEAM_CODE: `${APIEndpoint}/userProfile/teamCode/list`,
  LOGIN: `${APIEndpoint}/login`,
  PROJECTS: `${APIEndpoint}/projects`,
  TEAM: `${APIEndpoint}/team`,
  TEAM_DATA: teamId => `${APIEndpoint}/team/${teamId}`,
  TEAM_USERS: teamId => `${APIEndpoint}/team/${teamId}/users`,
  USER_PROJECTS: userId => `${APIEndpoint}/projects/user/${userId}`,
  JOB_ANALYTICS: `${APIEndpoint}/jobAnalytics/data`,
  JOB_ANALYTICS_REALTIME: `${APIEndpoint}/jobAnalytics/realtime`,
  PROJECT: `${APIEndpoint}/project/`,
  PROJECT_BY_ID: projectId => `${APIEndpoint}/project/${projectId}`,
  PROJECT_MEMBER_SEARCH: (projectId, query) =>
    `${APIEndpoint}/projects/${projectId}/users/search/${encodeURIComponent(query)}`,
  BADGE_COUNT: userId => `${APIEndpoint}/badge/badgecount/${userId}`,
  BADGE_COUNT_RESET: userId => `${APIEndpoint}/badge/badgecount/reset/${userId}`,
  PROJECT_MEMBER: projectId => `${APIEndpoint}/project/${projectId}/users`,
  PROJECT_MEMBER_SUMMARY: projectId => `${APIEndpoint}/project/${projectId}/users/summary`,
  PROJECT_MEMBER_ACTIVE: projectId =>
    `${APIEndpoint}/project/${projectId}/users?fields=_id,activeUserCount`,
  PROJECTS_WITH_ACTIVE_USERS: `${APIEndpoint}/projects/with-active-users`,
  UPDATE_PASSWORD: userId => `${APIEndpoint}/userprofile/${userId}/updatePassword`,
  FORCE_PASSWORD: `${APIEndpoint}/forcepassword`,
  LEADER_BOARD: userId => `${APIEndpoint}/dashboard/leaderboard/${userId}`,
  ORG_DATA: `${APIEndpoint}/dashboard/leaderboard/org/data`,
  TROPHY_ICON: (userId, trophyFollowedUp) =>
    `${APIEndpoint}/dashboard/leaderboard/trophyIcon/${userId}/${trophyFollowedUp}`,

  // Questionnaire endpoints
  QUESTIONNAIRE_FEEDBACK_REQUEST: () => `${APIEndpoint}/dashboard/questionaire/feedbackrequest`,
  QUESTIONNAIRE_CLOSE_PERMANENTLY: () =>
    `${APIEndpoint}/dashboard/questionaire/checkUserFoundHelpSomewhere`,
  QUESTIONNAIRE_USER_NAMES_LIST: () => `${APIEndpoint}/dashboard/questionaire/userNamesList`,

  TIME_ENTRIES_PERIOD: (userId, fromDate, toDate) =>
    `${APIEndpoint}/TimeEntry/user/${userId}/${fromDate}/${toDate}`,
  TIME_ENTRIES_USERS_HOURS_PERIOD: `${APIEndpoint}/TimeEntry/users/totalHours`,
  TIME_ENTRIES_USER_LIST: `${APIEndpoint}/TimeEntry/users`,
  TIME_ENTRIES_REPORTS: `${APIEndpoint}/TimeEntry/reports`,
  TIME_ENTRIES_REPORTS_TOTAL_PROJECT_REPORT: `${APIEndpoint}/TimeEntry/reports/projects`,
  TIME_ENTRIES_REPORTS_TOTAL_PEOPLE_REPORT: `${APIEndpoint}/TimeEntry/reports/people`,
  TIME_ENTRIES_LOST_USER_LIST: `${APIEndpoint}/TimeEntry/lostUsers`,
  TIME_ENTRIES_LOST_PROJ_LIST: `${APIEndpoint}/TimeEntry/lostProjects`,
  TIME_ENTRIES_LOST_TEAM_LIST: `${APIEndpoint}/TimeEntry/lostTeams`,
  TIME_ENTRY: () => `${APIEndpoint}/TimeEntry`,
  TIME_ENTRY_CHANGE: timeEntryId => `${APIEndpoint}/TimeEntry/${timeEntryId}`,
  TIMELOG_TRACKING: userId => `${APIEndpoint}/timelogTracking/${userId}`,
  WBS_ALL: `${APIEndpoint}/wbs`,
  WBS: projectId => `${APIEndpoint}/wbs/${projectId}`,
  GET_WBS: wbsId => `${APIEndpoint}/wbsId/${wbsId}`,
  TASKS: (wbsId, level, mother) => `${APIEndpoint}/tasks/${wbsId}/${level}/${mother || '0'}`,
  TASK: wbsId => `${APIEndpoint}/task/${wbsId}`,
  TASK_IMPORT: wbsId => `${APIEndpoint}/task/import/${wbsId}`,
  TASK_WBS_DELETE: wbsId => `${APIEndpoint}/task/wbs/del/${wbsId}`,
  TASK_WBS: wbsId => `${APIEndpoint}/task/wbs/${wbsId}`,
  TASKS_UPDATE: `${APIEndpoint}/tasks/update`,
  TASKS_BY_USERID: userId => `${APIEndpoint}/tasks/user/${userId}`,
  // TASKS_BY_userID: userId => `${APIEndpoint}/tasks/userProfile/${userId}`,
  TASK_DEL: (taskId, motherId) => `${APIEndpoint}/task/del/${taskId}/${motherId}`,
  GET_TASK: taskId => `${APIEndpoint}/task/${taskId}`,
  TASK_UPDATE: taskId => `${APIEndpoint}/task/update/${taskId}`,
  TASK_UPDATE_STATUS: taskId => `${APIEndpoint}/task/updateStatus/${taskId}`,
  TASK_CHANGE_LOGS: taskId => `${APIEndpoint}/task/${taskId}/changeLogs`,
  DELETE_CHILDREN: taskId => `${APIEndpoint}/task/delete/children/${taskId}`,
  GET_USER_BY_NAME: name => `${APIEndpoint}/userprofile/name/${name}`,
  FIX_TASKS: wbsId => `${APIEndpoint}/tasks/${wbsId}`,
  UPDATE_PARENT_TASKS: wbsId => `${APIEndpoint}/task/updateAllParents/${wbsId}`,
  MOVE_TASKS: wbsId => `${APIEndpoint}/tasks/moveTasks/${wbsId}`,
  WEEKLY_SUMMARIES_REPORT: () => `${APIEndpoint}/reports/weeklysummaries`,
  SAVE_SUMMARY_RECEPIENTS: userid => `${APIEndpoint}/reports/recepients/${userid}`,
  GET_SUMMARY_RECEPIENTS: () => `${APIEndpoint}/reports/getrecepients`,
  GET_CURRENT_WARNINGS: () => `${APIEndpoint}/currentWarnings`,
  POST_NEW_WARNING: () => `${APIEndpoint}/currentWarnings`,
  UPDATE_WARNING_DESCRIPTION: warningId => `${APIEndpoint}/currentWarnings/${warningId}`,
  DELETE_WARNING_DESCRIPTION: warningId => `${APIEndpoint}/currentWarnings/${warningId}`,
  EDIT_WARNING_DESCRIPTION: () => `${APIEndpoint}/currentWarnings/edit`,
  GET_WARNINGS_BY_USER_ID: userId => `${APIEndpoint}/warnings/${userId}`,
  GET_SPECIAL_WARNINGS: userId => `${APIEndpoint}/warnings/${userId}/special`,
  POST_WARNINGS_BY_USER_ID: userId => `${APIEndpoint}/warnings/${userId}`,
  DELETE_WARNINGS_BY_USER_ID: userId => `${APIEndpoint}/warnings/${userId}`,
  AUTHORIZE_WEEKLY_SUMMARY_REPORTS: () =>
    `${APIEndpoint}/userProfile/authorizeUser/weeeklySummaries`,
  TOTAL_ORG_SUMMARY: (startDate, endDate, comparisonStartDate, comparisonEndDate) =>
    `${APIEndpoint}/reports/volunteerstats?startDate=${startDate}&endDate=${endDate}&comparisonStartDate=${comparisonStartDate ||
    ''}&comparisonEndDate=${comparisonEndDate || ''}`,
  VOLUNTEER_TRENDS: (timeFrame, offset, customStartDate, customEndDate) =>
    `${APIEndpoint}/reports/volunteertrends?timeFrame=${timeFrame}&offset=${offset}${customStartDate ? `&customStartDate=${customStartDate}` : ''
    }${customEndDate ? `&customEndDate=${customEndDate}` : ''}`,
  HOURS_TOTAL_ORG_SUMMARY: (startDate, endDate) =>
    `${APIEndpoint}/reports/overviewsummaries/taskandprojectstats?startDate=${startDate}&endDate=${endDate}`,
  VOLUNTEER_ROLES_TEAM_STATS: (endDate, activeMembersMinimum) =>
    `${APIEndpoint}/reports/teams?endDate=${endDate}&activeMembersMinimum=${activeMembersMinimum}`,

  POPUP_EDITORS: `${APIEndpoint}/popupeditors/`,
  POPUP_EDITOR_BY_ID: id => `${APIEndpoint}/popupeditor/${id}`,
  POPUP_EDITOR_BACKUP_BY_ID: id => `${APIEndpoint}/backup/popupeditor/${id}`,

  TEAM_MEMBERS: teamId => `${APIEndpoint}/team/${teamId}/users`,
  TEAM_BY_ID: teamId => `${APIEndpoint}/team/${teamId}`,
  APPLICANT_VOLUNTEER_RATIO: `${APIEndpoint}/applicant-volunteer-ratio`,
  USER_UNREAD_TASK_NOTIFICATIONS: userId => `${APIEndpoint}/tasknotification/user/${userId}`,
  BADGE: () => `${APIEndpoint}/badge`,
  BADGE_ASSIGN: userId => `${APIEndpoint}/badge/assign/${userId}`,
  BADGE_BY_ID: badgeId => `${APIEndpoint}/badge/${badgeId}`,

  TEAM_MEMBER_TASKS: userId => `${ENDPOINTS.APIEndpoint()}/user/${userId}/teams/tasks`,
  CREATE_OR_UPDATE_TASK_NOTIFICATION: taskId =>
    `${ENDPOINTS.APIEndpoint()}/task/${taskId}/tasknotification`,
  DELETE_TASK_NOTIFICATION: taskNotificationId =>
    `${APIEndpoint}/tasknotification/${taskNotificationId}`,
  
POPULARITY: (range, roles, start, end) => {
  let url = `${APIEndpoint}/popularity?`;
  if (range) url += `range=${range}&`;
  if (roles && roles.length > 0) {
    url += `roles=${encodeURIComponent(JSON.stringify(roles))}&`;
  }
  if (start) url += `start=${encodeURIComponent(start)}&`;
  if (end) url += `end=${encodeURIComponent(end)}&`;
  return url.slice(0, -1); 
},
POPULARITY_ROLES: `${APIEndpoint}/popularity/roles`,


  // titles endpoints
  TITLES: () => `${APIEndpoint}/title`,
  // TITLES: () => `${APIEndpoint}/title/deleteAll`,
  TITLE_BY_ID: titleId => `${APIEndpoint}/title/${titleId}`,
  CREATE_NEW_TITLE: () => `${APIEndpoint}/title`,
  EDIT_OLD_TITLE: () => `${APIEndpoint}/title/update`,
  DELETE_TITLE_BY_ID: titleId => `${APIEndpoint}/title/${titleId}`,
  REORDER_TITLES: () => `${APIEndpoint}/title/order`,

  DELETE_TASK_NOTIFICATION_BY_USER_ID: (taskId, userId) =>
    `${APIEndpoint}/tasknotification/${userId}/${taskId}`,
  TASK_EDIT_SUGGESTION: () => `${APIEndpoint}/taskeditsuggestion`,
  REJECT_TASK_EDIT_SUGGESTION: taskEditSuggestionId =>
    `${APIEndpoint}/taskeditsuggestion/${taskEditSuggestionId}`,

  // Student Tasks (Education Portal)
  STUDENT_TASKS: () => `${APIEndpoint}/student/tasks`,
  STUDENT_TASK_MARK_DONE: taskId => `${APIEndpoint}/student/tasks/${taskId}/mark-done`,

  TIMER_SERVICE: new URL('/timer-service', APIEndpoint.replace('http', 'ws')).toString(),
  TIMEZONE_LOCATION: location => `${APIEndpoint}/timezone/${location}`,

  ROLES: () => `${APIEndpoint}/roles`,
  ROLES_BY_ID: roleId => `${APIEndpoint}/roles/${roleId}`,

  MONTHS_PLEDGED: (startDate, endDate, roles) => {
    let url = `${APIEndpoint}/analytics/months-pledged?`;
    if (startDate) url += `startDate=${encodeURIComponent(startDate)}&`;
    if (endDate) url += `endDate=${encodeURIComponent(endDate)}&`;
    if (roles && roles.length > 0) url += `roles=${encodeURIComponent(roles.join(','))}&`;
    return url;
  },

  PRESETS: () => `${APIEndpoint}/rolePreset`,
  PRESETS_BY_ID: roleNameOrPresetId => `${APIEndpoint}/rolePreset/${roleNameOrPresetId}`,

  OWNERMESSAGE: () => `${APIEndpoint}/ownerMessage`,

  AI_PROMPT: () => `${APIEndpoint}/dashboard/aiPrompt`,
  COPIED_AI_PROMPT: userId => `${APIEndpoint}/dashboard/aiPrompt/copied/${userId}`,
  INTERACT_WITH_GPT: `${APIEndpoint}/interactWithGPT`,
  SETUP_NEW_USER: () => `${APIEndpoint}/getInitialSetuptoken`,
  VALIDATE_TOKEN: () => `${APIEndpoint}/validateToken`,
  SETUP_NEW_USER_PROFILE: () => `${APIEndpoint}/ProfileInitialSetup`,
  ALL_MAP_LOCATIONS: () => `${APIEndpoint}/mapLocations`,
  GET_SETUP_INVITATION: () => `${APIEndpoint}/getSetupInvitation`,
  REFRESH_SETUP_INVITATION_TOKEN: () => `${APIEndpoint}/refreshSetupInvitationToken`,
  CANCEL_SETUP_INVITATION_TOKEN: () => `${APIEndpoint}/cancelSetupInvitationToken`,
  // emails endpoint
  POST_EMAILS: `${APIEndpoint}/send-emails`,
  BROADCAST_EMAILS: `${APIEndpoint}/broadcast-emails`,
  UPDATE_EMAIL_SUBSCRIPTION: `${APIEndpoint}/update-email-subsriptions`,
  NON_HGN_EMAIL_SUBSCRIPTION: `${APIEndpoint}/add-non-hgn-email-subscription`,
  CONFIRM_EMAIL_SUBSCRIPTION: `${APIEndpoint}/confirm-non-hgn-email-subscription`,
  REMOVE_EMAIL_SUBSCRIPTION: `${APIEndpoint}/remove-non-hgn-email-subscription`,

  // reasons endpoints
  CREATEREASON: () => {
    return `${APIEndpoint}/reason/`;
  },
  GETALLUSERREASONS: userId => {
    return `${APIEndpoint}/reason/${userId}`;
  },
  GETSINGLEREASONBYID: userId => {
    return `${APIEndpoint}/reason/single/${userId}`;
  },
  PATCHUSERREASONBYID: userId => {
    return `${APIEndpoint}/reason/${userId}`;
  },
  DELETEUSERREASONBYID: userId => {
    return `${APIEndpoint}/reason/${userId}`;
  },

  MOUSEOVERTEXT: () => `${APIEndpoint}/mouseoverText`,
  MOUSEOVERTEXT_BY_ID: mouseoverTextId => `${APIEndpoint}/mouseoverText/${mouseoverTextId}`,
  PERMISSION_CHANGE_LOGS: userId => `${APIEndpoint}/permissionChangeLogs/${userId}`,

  GET_TOTAL_COUNTRY_COUNT: () => `${APIEndpoint}/getTotalCountryCount`,

  GET_ALL_FOLLOWUPS: () => `${APIEndpoint}/followup`,

  SET_USER_FOLLOWUP: (userId, taskId) => `${APIEndpoint}/followup/${userId}/${taskId}`,
  GET_PROJECT_BY_PERSON: searchName => `${APIEndpoint}/userProfile/projects/${searchName}`,

  FAQS: `${APIEndpoint}/faqs`,
  FAQ_BY_ID: faqId => `${APIEndpoint}/faqs/${faqId}`,
  SEARCH_FAQS: searchQuery => `${APIEndpoint}/faqs/search?q=${searchQuery}`,
  LOG_UNANSWERED_QUESTION: `${APIEndpoint}/faqs/log-unanswered`,
  ADD_FAQ: `${APIEndpoint}/faqs`,
  EDIT_FAQ: faqId => `${APIEndpoint}/faqs/${faqId}`,
  DELETE_FAQ: faqId => `${APIEndpoint}/faqs/${faqId}`,
  FAQ_HISTORY: faqId => `${APIEndpoint}/faqs/${faqId}/history`,
  UNANSWERED_FAQS: `${APIEndpoint}/faqs/unanswered`,
  DELETE_UNANSWERED_FAQ: faqId => `${APIEndpoint}/faqs/unanswered/${faqId}`,

  // bm dashboard endpoints
  BM_LOGIN: `${APIEndpoint}/bm/login`,
  BM_MATERIAL_TYPES: `${APIEndpoint}/bm/invtypes/materials`,
  BM_MATERIAL_TYPE: `${APIEndpoint}/bm/invtypes/material`,
  BM_MATERIALS: `${APIEndpoint}/bm/materials`,
  BM_CONSUMABLES: `${APIEndpoint}/bm/consumables`,
  BM_UPDATE_CONSUMABLES: `${APIEndpoint}/bm/updateConsumablesRecord`,
  BM_CONSUMABLE_TYPES: `${APIEndpoint}/bm/invtypes/consumables`,
  BM_CONSUMABLES_PURCHASE: `${APIEndpoint}/bm/consumables/purchase`,
  BM_REUSABLE_TYPES: `${APIEndpoint}/bm/invtypes/reusables`,
  BM_REUSABLES: `${APIEndpoint}/bm/reusables`,
  BM_PURCHASE_REUSABLES: `${APIEndpoint}/bm/reusables/purchase`,
  BM_EQUIPMENT_TYPES: `${APIEndpoint}/bm/invtypes/equipments`,
  BM_EQUIPMENT_PURCHASE: `${APIEndpoint}/bm/equipment/purchase`,
  BM_EQUIPMENT_LOGS: `${APIEndpoint}/bm/equipments/logRecords`,
  BM_PROJECTS: `${APIEndpoint}/bm/projects`,
  BM_PROJECTS_WITH_LOCATION: `${APIEndpoint}/bm/projects/location`,
  BM_PROJECT_EXPENSE_BY_ID: projectId => `${APIEndpoint}/bm/project/${projectId}/expenses`,
  BM_PROJECT_BY_ID: projectId => `${APIEndpoint}/bm/project/${projectId}`,
  BM_PROJECTS_LIST_FOR_MATERIALS_COST: `${APIEndpoint}/totalProjects `,
  BM_PROJECT_MATERIALS_COST: `${APIEndpoint}/material-costs`,
  BM_UPDATE_MATERIAL: `${APIEndpoint}/bm/updateMaterialRecord`,
  BM_UPDATE_MATERIAL_BULK: `${APIEndpoint}/bm/updateMaterialRecordBulk`,
  BM_UPDATE_MATERIAL_STATUS: `${APIEndpoint}/bm/updateMaterialStatus`,
  BM_UPDATE_REUSABLE: `${APIEndpoint}/bm/updateReusableRecord`,
  BM_UPDATE_REUSABLE_BULK: `${APIEndpoint}/bm/updateReusableRecordBulk`,
  BM_TOOL_TYPES: `${APIEndpoint}/bm/invtypes/tools`,
  BM_TOOLS_PURCHASE: `${APIEndpoint}/bm/tools/purchase`,
  POST_LESSON: `${APIEndpoint}/bm/lessons/new`,
  BM_LESSONS: `${APIEndpoint}/bm/lessons`,
  BM_LESSON: `${APIEndpoint}/bm/lesson/`,
  BM_LESSON_LIKES: lessonId => `${APIEndpoint}/bm/lesson/${lessonId}/like`,
  BM_EXTERNAL_TEAM: `${APIEndpoint}/bm/externalTeam`,
  BM_INVENTORY_UNITS: `${APIEndpoint}/bm/inventoryUnits`,
  BM_INVTYPE_ROOT: `${APIEndpoint}/bm/invtypes`,
  BM_TOOLS: `${APIEndpoint}/bm/tools/`,
  BM_TOOL_BY_ID: singleToolId => `${APIEndpoint}/bm/tools/${singleToolId}`,
  BM_TOOL_AVAILABILITY: (toolId = '', projectId = '') =>
    `${APIEndpoint}/tools/availability?toolId=${toolId}&projectId=${projectId}`,
  BM_LOG_TOOLS: `${APIEndpoint}/bm/tools/log`,
  BM_EQUIPMENT_BY_ID: singleEquipmentId => `${APIEndpoint}/bm/equipment/${singleEquipmentId}`,
  BM_EQUIPMENTS: `${APIEndpoint}/bm/equipments`,
  BM_INVTYPE_TYPE: type => `${APIEndpoint}/bm/invtypes/${type}`,
  BM_ISSUE_CHART: `${APIEndpoint}/bm/issue/issue-chart`,

  BM_ISSUE_FORM: `${APIEndpoint}/bm/issue/add`,
  BM_INJURY_CATEGORY_BREAKDOWN: `${APIEndpoint}/bm/injuries/category-breakdown`,
  BM_INJURY_SEVERITIES: `${APIEndpoint}/bm/injuries/injury-severities`,
  BM_INJURY_TYPES: `${APIEndpoint}/bm/injuries/injury-types`,
  BM_INJURY_PROJECTS: `${APIEndpoint}/bm/injuries/project-injury`,
  BM_INJURY_ISSUE: `${APIEndpoint}/bm/issues`,
  BM_INJURY_SEVERITY: `${APIEndpoint}/bm/injuries/severity-by-project`,
  BM_RENTAL_CHART: `${APIEndpoint}/bm/rentalChart`,
  TOOLS_AVAILABILITY_PROJECTS: `${APIEndpoint}/bm/tools-availability/projects`,
  TOOLS_AVAILABILITY_BY_PROJECT: (projectId, startDate, endDate) => {
    let url = `${APIEndpoint}/bm/projects/${projectId}/tools-availability`;
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return url;
  },
  BM_TAGS: `${APIEndpoint}/bm/tags`,
  BM_TAG_ADD: `${APIEndpoint}/bm/tags`,
  BM_TAGS_DELETE: `${APIEndpoint}/bm/tags`,

  BM_ORGS_WITH_LOCATION: `${APIEndpoint}/bm/orgLocation`,
  ORG_DETAILS: (projectId) => `${APIEndpoint}/bm/orgLocation/${projectId}`,
  BM_PROJECT_MEMBERS: projectId => `${APIEndpoint}/bm/project/${projectId}/users`,

  // bm time logger endpoints
  TIME_LOGGER_START: (projectId, memberId) =>
    `${APIEndpoint}/bm/timelogger/${projectId}/${memberId}/start`,
  TIME_LOGGER_PAUSE: (projectId, memberId) =>
    `${APIEndpoint}/bm/timelogger/${projectId}/${memberId}/pause`,
  TIME_LOGGER_STOP: (projectId, memberId) =>
    `${APIEndpoint}/bm/timelogger/${projectId}/${memberId}/stop`,
  TIME_LOGGER_LOGS: (projectId, memberId) =>
    `${APIEndpoint}/bm/timelogger/${projectId}/${memberId}/logs`,

  GET_TIME_OFF_REQUESTS: () => `${APIEndpoint}/getTimeOffRequests`,
  ADD_TIME_OFF_REQUEST: () => `${APIEndpoint}/setTimeOffRequest`,
  UPDATE_TIME_OFF_REQUEST: id => `${APIEndpoint}/updateTimeOffRequest/${id}`,
  DELETE_TIME_OFF_REQUEST: id => `${APIEndpoint}/deleteTimeOffRequest/${id}`,
  BLUE_SQUARE_EMAIL_BCC: () => `${APIEndpoint}/AssignBlueSquareEmail`,
  DELETE_BLUE_SQUARE_EMAIL_BCC: id => `${APIEndpoint}/AssignBlueSquareEmail/${id}`,

  ADD_BLUE_SQUARE_EMAIL_CC: userId => `${APIEndpoint}/assignCCEmail/${userId}`,
  DELETE_BLUE_SQUARE_EMAIL_CC: (userId, email) => `${APIEndpoint}/removeCCEmail/${userId}/${email}`,

  WEEKLY_SUMMARY_EMAIL_BCC: () => `${APIEndpoint}/AssignWeeklySummaryEmail`,
  DELETE_WEEKLY_SUMMARY_EMAIL_BCC: id => `${APIEndpoint}/AssignWeeklySummaryEmail/${id}`,
  UPDATE_WEEKLY_SUMMARY_EMAIL_BCC: id => `${APIEndpoint}/AssignWeeklySummaryEmail/${id}`,

  HGN_FORM_GET_QUESTION: `${APIEndpoint}/questions`,
  HGN_FORM_UPDATE_QUESTION: id => `${APIEndpoint}/questions/${id}`,
  HGN_FORM_SUBMIT: `${APIEndpoint}/hgnform`,
  HGN_FORM_UPDATE_USER_SKILLS_FOLLOWUP_SUBMIT: `${APIEndpoint}/skills/profile/updateFollowUp/`,

  CREATE_JOB_FORM: `${APIEndpoint}/jobforms`,
  UPDATE_JOB_FORM: `${APIEndpoint}/jobforms`,
  GET_JOB_FORM: formId => `${APIEndpoint}/jobforms/${formId}`,
  GET_ALL_JOB_FORMS: `${APIEndpoint}/jobforms/all`,
  GET_FORM_RESPONSES: formID => `${APIEndpoint}/jobforms/${formID}/responses`,

  ADD_QUESTION: formId => `${APIEndpoint}/jobforms/${formId}/questions`,
  UPDATE_QUESTION: (formId, questionIndex) =>
    `${APIEndpoint}/jobforms/${formId}/questions/${questionIndex}`,
  DELETE_QUESTION: (formId, questionIndex) =>
    `${APIEndpoint}/jobforms/${formId}/questions/${questionIndex}`,
  REORDER_QUESTIONS: formId => `${APIEndpoint}/jobforms/${formId}/questions/reorder`,

  GET_ALL_TEMPLATES: `${APIEndpoint}/templates`,
  CREATE_TEMPLATE: `${APIEndpoint}/templates`,
  GET_TEMPLATE_BY_ID: id => `${APIEndpoint}/templates/${id}`,
  UPDATE_TEMPLATE: id => `${APIEndpoint}/templates/${id}`,
  DELETE_TEMPLATE: id => `${APIEndpoint}/templates/${id}`,

  JOB_NOTIFICATION_LIST: `${APIEndpoint}/job-notification-list/`,

  MESSAGING_SERVICE: new URL('/messaging-service', APIEndpoint.replace('http', 'ws')).toString(),
  // lb dashboard endpoints
  LB_REGISTER: `${APIEndpoint}/lbdashboard/register`,
  LB_LOGIN: `${APIEndpoint}/lbdashboard/login`,

  // event endpoint
  EVENTS: `${APIEndpoint}/events`,
  EVENT_TYPES: `${APIEndpoint}/events/types`,
  EVENT_LOCATIONS: `${APIEndpoint}/events/locations`,
  LB_SEND_MESSAGE: `${APIEndpoint}/lb/messages`,
  LB_READ_MESSAGE: `${APIEndpoint}/lb/messages/conversation`,
  LB_UPDATE_MESSAGE_STATUS: `${APIEndpoint}/lb/messages/statuses`,
  LB_EXISTING_CHATS: `${APIEndpoint}/lb/messages/existing-chats`,
  LB_SEARCH_USERS: `${APIEndpoint}/lb/messages/search-users`,
  LB_GET_USER_PREFERENCES: `${APIEndpoint}/lb/preferences`,
  LB_UPDATE_USER_PREFERENCES: `${APIEndpoint}/lb/preferences`,
  LB_MARK_MESSAGES_AS_READ: `${APIEndpoint}/lb/messages/mark-as-read`,

  // Injuries endpoints
  INJURIES: `${APIEndpoint}/injuries`,

  NOTIFICATIONS: `${APIEndpoint}/notification`,
  MSG_NOTIFICATION: `${APIEndpoint}/lb/notifications`,

  DROPBOX_DELETE: `${APIEndpoint}/dropbox/delete-folder`,
  DROPBOX_TEAM_FOLDERS: `${APIEndpoint}/dropbox/team-folders`,
  GITHUB_REMOVE: `${APIEndpoint}/github/remove`,
  SENTRY_REMOVE: `${APIEndpoint}/sentry/remove`,

  SENTRY_ADD: `${APIEndpoint}/sentry/invite`,
  GITHUB_ADD: `${APIEndpoint}/github/invite`,
  DROPBOX_ADD: `${APIEndpoint}/dropbox/invite`,
  SLACK_ADD: `${APIEndpoint}/slack/invite`,
  DROPBOX_CREATE_ADD: `${APIEndpoint}/dropbox/create-folder-and-invite`,
  ACCESS_MANAGEMENT: `${APIEndpoint}/accessManagement`,

  // community portal
  CP_NOSHOW_VIZ_LOCATION: `${APIEndpoint}/communityportal/reports/participation/location`,
  CP_NOSHOW_VIZ_AGEGROUP: `${APIEndpoint}/communityportal/reports/participation/age-group`,
  CP_NOSHOW_VIZ_PROPORTION: `${APIEndpoint}/communityportal/reports/participation/proportions`,
  CP_NOSHOW_VIZ_PERIOD: `${APIEndpoint}/communityportal/reports/participation/data`,
  CP_ATTENDENCE_VIZ_DAY: `${APIEndpoint}/communityportal/reports/participation/by-day`,
  CP_NOSHOW_VIZ_UNIQUE_EVENTTYPES: `${APIEndpoint}/communityportal/reports/participation/unique-eventTypes`,
  CP_ADD_EVENT_FEEDBACK: `${APIEndpoint}/communityportal/activities/eventFeedback`,

  LB_LISTINGS: `${APIEndpoint}/lb/getListings`,
  LB_LISTINGS_BASE: `${APIEndpoint}/lb`,
  LB_LISTING_GET_BY_ID: `${APIEndpoint}/lb/listing/getById`,
  LB_LISTING_AVAILABILITY: `${APIEndpoint}/lb/listing/availability`,
  LB_LISTING_BOOK: `${APIEndpoint}/lb/listing/availability/booking`,
  HELP_CATEGORIES: `${APIEndpoint}/help-categories`,

  // job analytics
  HOURS_PLEDGED: `${APIEndpoint}/analytics/hours-pledged`,

  // Saved Filters endpoints
  SAVED_FILTERS: () => `${APIEndpoint}/savedFilters`,
  SAVED_FILTER_BY_ID: filterId => `${APIEndpoint}/savedFilters/${filterId}`,
  UPDATE_SAVED_FILTERS_TEAM_CODES: () => `${APIEndpoint}/savedFilters/updateTeamCodes`,
  UPDATE_SAVED_FILTERS_INDIVIDUAL_TEAM_CODE: () =>
    `${APIEndpoint}/savedFilters/updateIndividualTeamCode`,

  // pr dashboard endpoints
  PROMOTION_ELIGIBILITY: `${APIEndpoint}/promotion-eligibility`,
  PROMOTE_MEMBERS: `${APIEndpoint}/promote-members`,


  //pull requests analysis
  PR_REVIEWS_INSIGHTS: `${APIEndpoint}/analytics/pr-review-insights`,

};

export const ApiEndpoint = APIEndpoint;
