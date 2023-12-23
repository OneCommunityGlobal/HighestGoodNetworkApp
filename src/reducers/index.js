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
import { infoCollectionsReducer } from './informationReducer';
import { mouseoverTextReducer } from './mouseoverTextReducer';

// bm dashboard
import { materialsReducer } from './bmdashboard/materialsReducer';
import { bmProjectReducer } from './bmdashboard/projectReducer';
import { bmInvTypeReducer } from './bmdashboard/inventoryTypeReducer';
import { bmInvUnitReducer } from './bmdashboard/inventoryUnitReducer';

export default combineReducers({
  auth: authReducer,
  userProfile: userProfileByIdReducer,
  userTask: userTaskByIdReducer,
  allUserProfiles: allUserProfilesReducer,
  leaderBoardData: leaderboardDataReducer,
  orgData: orgDataReducer,
  weeklySummaries: weeklySummariesReducer,
  weeklySummariesReport: weeklySummariesReportReducer,
  allProjects: allProjectsReducer,
  projectReport: projectReportReducer,
  userProjects: userProjectsReducer,
  projectMembers: projectMembershipReducer,
  managingTeams: managingTeamsReducer,
  allTeamsData: allUserTeamsReducer,
  teamsTeamMembers: teamUsersReducer,
  team: teamByIdReducer,
  wbs: wbsReducer,
  tasks: taskReducer,
  errors: errorsReducer,
  timeEntries: timeEntriesReducer,
  badge: badgeReducer,
  popupEditor: popupEditorReducer,
  timeZoneAPI: timeZoneAPIReducer,
  teamMemberTasks: teamMemberTasksReducer,
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
  bmInvUnits: bmInvUnitReducer
});
