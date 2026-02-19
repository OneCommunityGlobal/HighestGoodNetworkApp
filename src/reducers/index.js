/* eslint-disable import/no-named-as-default */
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
// eslint-disable-next-line import/no-named-as-default
import timelogTrackingReducer from './timelogTrackingReducer';
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
// eslint-disable-next-line import/no-named-as-default
import savedFilterReducer from './savedFilterReducer';

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
import toolAvailabilityReducer from './bmdashboard/toolAvailabilityReducer';
import { equipmentReducer } from './bmdashboard/equipmentReducer';
import { bmProjectMemberReducer } from './bmdashboard/projectMemberReducer';
import { bmTimeLoggerReducer } from './bmdashboard/timeLoggerReducer';
import bmInjuryReducer from './bmdashboard/injuryReducer';

import dashboardReducer from './dashboardReducer';
import { timeOffRequestsReducer } from './timeOffRequestReducer';
import { totalOrgSummaryReducer } from './totalOrgSummaryReducer';
import { allUsersTimeEntriesReducer } from './allUsersTimeEntriesReducer';
import issueReducer from './bmdashboard/issueReducer';
import HGNFormReducer from './hgnFormReducers';
import injuriesReducer from './injuries';
// import { weeklyProjectSummaryReducer } from './bmdashboard/weeklyProjectSummaryReducer';

import { weeklyProjectSummaryReducer } from './bmdashboard/weeklyProjectSummaryReducer';
import messageReducer from './listBidDashboard/messagingReducer';
// eslint-disable import/no-named-as-default
import userPreferencesReducer from './listBidDashboard/userPreferencesReducer';
import userSkillsReducer from './userSkillsReducer';
// community portalgit
import { noShowVizReducer } from './communityPortal/noShowVizReducer';
import { eventFeedbackReducer } from './communityPortal/eventFeedback';

import { jobApplicationReducer } from './jobApplication/jobApplicationReducer';

// lbdashboard
import wishListReducer from './listBidDashboard/wishListItemReducer';

// listing and biddding dashboard

import {
  listOverviewReducer,
  listingAvailabilityReducer,
  listingBookingReducer,
} from './listBidDashboard/listOverviewReducer';

// pr analytics
import reviewsInsightReducer from './prAnalytics/reviewsInsightReducer';

// job analytics
import { hoursPledgedReducer } from './jobAnalytics/hoursPledgedReducer';
import { studentTasksReducer } from './studentTasksReducer';

// education portal
import { atomReducer } from './educationPortal/atomReducer';
import { weeklySummariesFiltersApi } from '../actions/weeklySummariesFilterAction';

//education portal

import browseLessonPlanReducer from './educationPortal/broweLPReducer';

const localReducers = {
  auth: authReducer,
  allUserProfiles: allUserProfilesReducer,
  weeklySummaries: weeklySummariesReducer,
  weeklySummariesReport: weeklySummariesReportReducer,
  savedFilters: savedFilterReducer,
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
  [weeklySummariesFiltersApi.reducerPath]: weeklySummariesFiltersApi.reducer,

  // bm dashboard
  materials: materialsReducer,
  tools: toolReducer,
  toolAvailability: toolAvailabilityReducer,
  bmProjects: bmProjectReducer,
  bmIssues: issueReducer,
  bmInjuries: bmInjuryReducer,
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
  injuries: injuriesReducer,
  weeklyProjectSummary: weeklyProjectSummaryReducer,

  // lbdashboard
  wishlistItem: wishListReducer,

  bmissuechart: issueReducer,
  noShowViz: noShowVizReducer,
  eventFeedback: eventFeedbackReducer,

  bmProjectMembers: bmProjectMemberReducer,
  bmTimeLogger: bmTimeLoggerReducer,
  bmInjury: bmInjuryReducer,
  // lbdashboard
  lbmessaging: messageReducer,
  lbuserpreferences: userPreferencesReducer,

  WishListItem: wishListReducer,

  listOverview: listOverviewReducer,
  listingAvailability: listingAvailabilityReducer,
  listingBooking: listingBookingReducer,
  reviewsInsights: reviewsInsightReducer,

  // job analytics
  hoursPledged: hoursPledgedReducer,

  // student tasks
  studentTasks: studentTasksReducer,
  jobApplication: jobApplicationReducer,

  // education portal
  atom: atomReducer,

  // education portal
  browseLessonPlan: browseLessonPlanReducer,
};

const sessionReducers = {
  userSkills: userSkillsReducer,
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
  timelogTracking: timelogTrackingReducer,
  teamMemberTasks: teamMemberTasksReducer,
  warning: warningsByUserIdReducer,
};

export { localReducers, sessionReducers };
