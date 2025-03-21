import { teamMemberTasksReducer } from 'components/TeamMemberTasks/reducer';
import { taskEditSuggestionsReducer } from 'components/TaskEditSuggestions/reducer';
import { userProfileByIdReducer, userTaskByIdReducer } from './userProfileByIdReducer';
import { authReducer } from './authReducer';
import { allUserProfilesBasicInfoReducer } from './allUserProfilesBasicInfoReducer';
import {
  allUserProfilesReducer,
  changeUserPageStatusReducer,
  enableUserInfoEditReducer,
} from './allUserProfilesReducer';
import { leaderboardDataReducer, orgDataReducer } from './leaderboardDataReducer';
import weeklySummariesReducer from './weeklySummariesReducer';
import weeklySummariesReportReducer from './weeklySummariesReportReducer';
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
import mouseoverTextReducer from './mouseoverTextReducer';
import notificationReducer from './notificationReducer';
import  weeklySummaryRecipientsReducer  from './weeklySummaryRecipientsReducer';
import { followUpReducer } from './followUpReducer';
import { BlueSquareEmailAssignment } from './blueSquareEmailBcc';
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
import dashboardReducer from '../reducers/dashboardReducer';
import { timeOffRequestsReducer } from './timeOffRequestReducer';
import { totalOrgSummaryReducer } from './totalOrgSummaryReducer';
import { allUsersTimeEntriesReducer } from './allUsersTimeEntriesReducer';
import HGNFormReducer from './hgnFormReducers';

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
  bmInvUnits: bmInvUnitReducer,
  bmConsumables: consumablesReducer,
  bmReusables: reusablesReducer,
  dashboard: dashboardReducer,
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
