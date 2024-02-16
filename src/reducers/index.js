import { combineReducers } from 'redux';
import { teamMemberTasksReducer } from 'components/TeamMemberTasks/reducer';
import { taskEditSuggestionsReducer } from 'components/TaskEditSuggestions/reducer';
import { userProfileByIdReducer, userTaskByIdReducer } from './userProfileByIdReducer';
import { authReducer } from './authReducer';
import { allUserProfilesReducer } from './allUserProfilesReducer';
import { leaderboardDataReducer, orgDataReducer } from './leaderboardDataReducer';
import { weeklySummariesReducer } from './weeklySummariesReducer';
import { weeklySummariesReportReducer } from './weeklySummariesReportReducer';
import { allProjectsReducer } from './allProjectsReducer';
import { projectReportReducer } from './projectReportReducer';
import { userProjectsReducer } from './userProjectsReducer';
import { projectMembershipReducer } from './projectMembershipReducer';
import { allUserTeamsReducer } from './allTeamsReducer';
import { teamByIdReducer } from './teamByIdReducer';
import { errorsReducer } from './errorsReducer';
import { timeEntriesReducer } from './timeEntriesReducer';
import { wbsReducer } from './wbsReducer';
import { taskReducer } from './allTasksReducer';
import { managingTeamsReducer } from './managingTeamsReducer';
import { teamUsersReducer } from './teamsTeamMembersReducer';
import { badgeReducer } from './badgeReducer';
import { popupEditorReducer } from './popupEditorReducer';
import { timeZoneAPIReducer } from './timezoneApiReducer';
import { roleReducer } from './roleReducer';
import { rolePresetReducer } from './rolePresetReducer';
import { ownerMessageReducer } from './ownerMessageReducer';
import { warningsByUserIdReducer } from './warningsReducer';
import { infoCollectionsReducer } from './informationReducer';
import { weeklySummariesAIPromptReducer } from './weeklySummariesAIPromptReducer';
import { mouseoverTextReducer } from './mouseoverTextReducer';

// bm dashboard
import { materialsReducer } from './bmdashboard/materialsReducer';
import { bmProjectReducer } from './bmdashboard/projectReducer';
import { bmInvTypeReducer } from './bmdashboard/inventoryTypeReducer';
import { bmInvUnitReducer } from './bmdashboard/inventoryUnitReducer';
import { consumablesReducer } from './bmdashboard/consumablesReducer';
import { toolReducer } from './bmdashboard/toolReducer';
import { timeOffRequestsReducer } from "./timeOffRequestReducer"

const localReducers = {
  auth: authReducer,
  allUserProfiles: allUserProfilesReducer,
  weeklySummaries: weeklySummariesReducer,
  weeklySummariesReport: weeklySummariesReportReducer,
  allProjects: allProjectsReducer,
  projectReport: projectReportReducer,
  projectMembers: projectMembershipReducer,
  managingTeams: managingTeamsReducer,
  allTeamsData: allUserTeamsReducer,
  team: teamByIdReducer,
  wbs: wbsReducer,
  tasks: taskReducer,
  errors: errorsReducer,
  badge: badgeReducer,
  popupEditor: popupEditorReducer,
  timeZoneAPI: timeZoneAPIReducer,
  taskEditSuggestions: taskEditSuggestionsReducer,
  role: roleReducer,
  rolePreset: rolePresetReducer,
  ownerMessage: ownerMessageReducer,
  infoCollections: infoCollectionsReducer,
  mouseoverText: mouseoverTextReducer,

  // bmdashboard
  materials: materialsReducer,
  bmProjects: bmProjectReducer,
  bmInvTypes: bmInvTypeReducer,
  timeOffRequests: timeOffRequestsReducer,
  bmTools: toolReducer,
  bmInvUnits: bmInvUnitReducer,
  bmConsumables: consumablesReducer,
};

const sessionReducers = {
  userProfile: userProfileByIdReducer,
  userTask: userTaskByIdReducer,
  leaderBoardData: leaderboardDataReducer,
  orgData: orgDataReducer,
  userProjects: userProjectsReducer,
  teamsTeamMembers: teamUsersReducer,
  timeEntries: timeEntriesReducer,
  teamMemberTasks: teamMemberTasksReducer,
  warning: warningsByUserIdReducer,
};

export { localReducers, sessionReducers };
// >>>>>>> development
