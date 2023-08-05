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
import { timerReducer } from './timerReducer';
import { managingTeamsReducer } from './managingTeamsReducer';
import { teamUsersReducer } from './teamsTeamMembersReducer';
import { badgeReducer } from './badgeReducer';
import { popupEditorReducer } from './popupEditorReducer';
import { timeZoneAPIReducer } from './timezoneApiReducer';
import { roleReducer } from './roleReducer';
import { ownerMessageReducer } from './ownerMessageReducer';
import { ownerStandardMessageReducer } from './ownerStandardMessageReducer';
import { mouseoverTextReducer } from './mouseoverTextReducer';

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
  timer: timerReducer,
  badge: badgeReducer,
  popupEditor: popupEditorReducer,
  timeZoneAPI: timeZoneAPIReducer,
  teamMemberTasks: teamMemberTasksReducer,
  taskEditSuggestions: taskEditSuggestionsReducer,
  role: roleReducer,
  ownerMessage: ownerMessageReducer,
  ownerStandardMessage: ownerStandardMessageReducer,
  mouseoverText: mouseoverTextReducer,
});
