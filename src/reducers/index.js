import { teamMemberTasksReducer } from '~/components/TeamMemberTasks/reducer';
import { taskEditSuggestionsReducer } from '~/components/TaskEditSuggestions/reducer';
import { userProfileByIdReducer, userTaskByIdReducer } from './userProfileByIdReducer';
import { authReducer } from './authReducer';
import { allUserProfilesBasicInfoReducer } from './allUserProfilesBasicInfoReducer';
import {
  allUserProfilesReducer,
  changeUserPageStatusReducer,
  enableUserInfoEditReducer,
} from './allUserProfilesReducer';
import { leaderboardDataReducer, orgDataReducer } from './leaderboardDataReducer';
import { weeklySummariesReducer } from './weeklySummariesReducer';
import { weeklySummariesReportReducer } from './weeklySummariesReportReducer';
import { allProjectsReducer } from './allProjectsReducer';
import { projectReportReducer } from './projectReportReducer';
import userProjectsReducer from './userProjectsReducer';
import { projectMembershipReducer } from './projectMembershipReducer';
import { allUserTeamsReducer } from './allTeamsReducer';
import { teamByIdReducer } from './teamByIdReducer';
import { errorsReducer } from './errorsReducer';
import { timeEntriesReducer } from './timeEntriesReducer';
import wbsReducer from './wbsReducer';
import { taskReducer } from './allTasksReducer';
import { managingTeamsReducer } from './managingTeamsReducer';
import { teamUsersReducer } from './teamsTeamMembersReducer';
import { themeReducer } from './themeReducer';
import { badgeReducer } from './badgeReducer';
import { popupEditorReducer } from './popupEditorReducer';
import { roleReducer } from './roleReducer';
import { rolePresetReducer } from './rolePresetReducer';
import { ownerMessageReducer } from './ownerMessageReducer';
import warningsByUserIdReducer from './warningsReducer';
import { infoCollectionsReducer } from './informationReducer';
import { mouseoverTextReducer } from './mouseoverTextReducer';
import notificationReducer from './notificationReducer';
import weeklySummaryRecipientsReducer from './weeklySummaryRecipientsReducer';
import { followUpReducer } from './followUpReducer';
import { BlueSquareEmailAssignment } from './blueSquareEmailBcc';

import WeeklySummaryEmailAssignment from './WeeklySummaryEmailAssignment';

import { userProjectsByUserNameReducer } from './userProjectsByUserNameReducer';
import teamCodesReducer from './teamCodesReducer';
import { projectByIdReducer } from './projectByIdReducer';

// bm dashboard
import { materialsReducer } from './bmdashboard/materialsReducer';
import { reusablesReducer } from './bmdashboard/reusablesReducer';
import { bmProjectReducer } from './bmdashboard/projectReducer';
import { bmInvTypeReducer } from './bmdashboard/inventoryTypeReducer';
import { lessonsReducer } from './bmdashboard/lessonsReducer';
import { bmProjectByIdReducer } from './bmdashboard/projectByIdReducer';
import { bmInvUnitReducer } from './bmdashboard/inventoryUnitReducer';
import { consumablesReducer } from './bmdashboard/consumablesReducer';
import { toolReducer } from './bmdashboard/toolReducer';
import { equipmentReducer } from './bmdashboard/equipmentReducer';
import { bmProjectMemberReducer } from './bmdashboard/projectMemberReducer';
import { bmTimeLoggerReducer } from './bmdashboard/timeLoggerReducer';

import dashboardReducer from './dashboardReducer';
import { timeOffRequestsReducer } from './timeOffRequestReducer';
import { totalOrgSummaryReducer } from './totalOrgSummaryReducer';
import { allUsersTimeEntriesReducer } from './allUsersTimeEntriesReducer';
import issueReducer from './bmdashboard/issueReducer';
import HGNFormReducer from './hgnFormReducers';
import { weeklyProjectSummaryReducer } from './bmdashboard/weeklyProjectSummaryReducer';
import messageReducer from './lbdashboard/messagingReducer';
import { userPreferencesReducer } from './lbdashboard/userPreferencesReducer';

// community portal
import { noShowVizReducer } from './communityPortal/noShowVizReducer';

// lbdashboard
import wishListReducer from './lbdashboard/wishListItemReducer';

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
  taskEditSuggestions: taskEditSuggestionsReducer,
  theme: themeReducer,
  role: roleReducer,
  rolePreset: rolePresetReducer,
  ownerMessage: ownerMessageReducer,
  infoCollections: infoCollectionsReducer,
  mouseoverText: mouseoverTextReducer,
  weeklySummaryRecipients: weeklySummaryRecipientsReducer,
  notification: notificationReducer,
  userFollowUp: followUpReducer,
  userProjectsByUserNameReducer,
  teamCodes: teamCodesReducer,
  blueSquareEmailAssignment: BlueSquareEmailAssignment,
  weeklySummaryEmailAssignment: WeeklySummaryEmailAssignment,
  totalOrgSummary: totalOrgSummaryReducer,
  allUsersTimeEntries: allUsersTimeEntriesReducer,
  allUserProfilesBasicInfo: allUserProfilesBasicInfoReducer,
  projectById: projectByIdReducer,

  // bmdashboard
  materials: materialsReducer,
  tools: toolReducer,
  bmProjects: bmProjectReducer,
  bmInvTypes: bmInvTypeReducer,
  timeOffRequests: timeOffRequestsReducer,
  lessons: lessonsReducer,
  project: bmProjectByIdReducer,
  bmTools: toolReducer,
  bmEquipments: equipmentReducer,
  bmIssues: issueReducer,
  bmInvUnits: bmInvUnitReducer,
  bmConsumables: consumablesReducer,
  bmReusables: reusablesReducer,
  dashboard: dashboardReducer,
  weeklyProjectSummary: weeklyProjectSummaryReducer,

  // lbdashboard
  wishlistItem: wishListReducer,

  bmissuechart: issueReducer,
  noShowViz: noShowVizReducer,

  bmProjectMembers: bmProjectMemberReducer,
  bmTimeLogger: bmTimeLoggerReducer,
  // lbdashboard
  lbmessaging: messageReducer,
  lbuserpreferences: userPreferencesReducer,
};

const sessionReducers = {
  hgnForm: HGNFormReducer,
  userPagination: changeUserPageStatusReducer,
  userProfileEdit: enableUserInfoEditReducer,
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
