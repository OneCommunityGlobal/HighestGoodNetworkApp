/* eslint-disable import/no-named-as-default */
import { taskEditSuggestionsReducer } from '~/components/TaskEditSuggestions/reducer';
import { teamMemberTasksReducer } from '~/components/TeamMemberTasks/reducer';
import { allProjectsReducer } from './allProjectsReducer';
import { allUserTeamsReducer } from './allTeamsReducer';
import { allUserProfilesBasicInfoReducer } from './allUserProfilesBasicInfoReducer';
import {
  allUserProfilesReducer,
  changeUserPageStatusReducer,
  enableUserInfoEditReducer,
} from './allUserProfilesReducer';
import { authReducer } from './authReducer';
import { errorsReducer } from './errorsReducer';
import { leaderboardDataReducer, orgDataReducer } from './leaderboardDataReducer';
import { projectMembershipReducer } from './projectMembershipReducer';
import { projectReportReducer } from './projectReportReducer';
import { teamByIdReducer } from './teamByIdReducer';
import { timeEntriesReducer } from './timeEntriesReducer';
import { userProfileByIdReducer, userTaskByIdReducer } from './userProfileByIdReducer';
import userProjectsReducer from './userProjectsReducer';
import { weeklySummariesReducer } from './weeklySummariesReducer';
import { weeklySummariesReportReducer } from './weeklySummariesReportReducer';
// eslint-disable-next-line import/no-named-as-default
import { taskReducer } from './allTasksReducer';
import { badgeReducer } from './badgeReducer';
import { BlueSquareEmailAssignment } from './blueSquareEmailBcc';
import { followUpReducer } from './followUpReducer';
import { infoCollectionsReducer } from './informationReducer';
import { managingTeamsReducer } from './managingTeamsReducer';
import { mouseoverTextReducer } from './mouseoverTextReducer';
import notificationReducer from './notificationReducer';
import { ownerMessageReducer } from './ownerMessageReducer';
import { popupEditorReducer } from './popupEditorReducer';
import { rolePresetReducer } from './rolePresetReducer';
import { roleReducer } from './roleReducer';
import { teamUsersReducer } from './teamsTeamMembersReducer';
import { themeReducer } from './themeReducer';
import timelogTrackingReducer from './timelogTrackingReducer';
import warningsByUserIdReducer from './warningsReducer';
import wbsReducer from './wbsReducer';
import weeklySummaryRecipientsReducer from './weeklySummaryRecipientsReducer';

import WeeklySummaryEmailAssignment from './WeeklySummaryEmailAssignment';

import { projectByIdReducer } from './projectByIdReducer';
import teamCodesReducer from './teamCodesReducer';
import { userProjectsByUserNameReducer } from './userProjectsByUserNameReducer';
// eslint-disable-next-line import/no-named-as-default
import savedFilterReducer from './savedFilterReducer';

// bm dashboard
import { consumablesReducer } from './bmdashboard/consumablesReducer';
import { equipmentReducer } from './bmdashboard/equipmentReducer';
import bmInjuryReducer from './bmdashboard/injuryReducer';
import { bmInvTypeReducer } from './bmdashboard/inventoryTypeReducer';
import { bmInvUnitReducer } from './bmdashboard/inventoryUnitReducer';
import { lessonsReducer } from './bmdashboard/lessonsReducer';
import { materialsReducer } from './bmdashboard/materialsReducer';
import { bmProjectByIdReducer } from './bmdashboard/projectByIdReducer';
import { bmProjectMemberReducer } from './bmdashboard/projectMemberReducer';
import { bmProjectReducer } from './bmdashboard/projectReducer';
import { reusablesReducer } from './bmdashboard/reusablesReducer';
import { bmTimeLoggerReducer } from './bmdashboard/timeLoggerReducer';
import toolAvailabilityReducer from './bmdashboard/toolAvailabilityReducer';
import { toolReducer } from './bmdashboard/toolReducer';

import { allUsersTimeEntriesReducer } from './allUsersTimeEntriesReducer';
import issueReducer from './bmdashboard/issueReducer';
import dashboardReducer from './dashboardReducer';
import HGNFormReducer from './hgnFormReducers';
import injuriesReducer from './injuries';
import { timeOffRequestsReducer } from './timeOffRequestReducer';
import { totalOrgSummaryReducer } from './totalOrgSummaryReducer';
// import { weeklyProjectSummaryReducer } from './bmdashboard/weeklyProjectSummaryReducer';

import { weeklyProjectSummaryReducer } from './bmdashboard/weeklyProjectSummaryReducer';
import messageReducer from './listBidDashboard/messagingReducer';
// eslint-disable import/no-named-as-default
import userPreferencesReducer from './listBidDashboard/userPreferencesReducer';
import userSkillsReducer from './userSkillsReducer';
// community portalgit
import { eventFeedbackReducer } from './communityPortal/eventFeedback';
import { noShowVizReducer } from './communityPortal/noShowVizReducer';

import { jobApplicationReducer } from './jobApplication/jobApplicationReducer';

import emailOutboxReducer from './emailOutboxReducer';
import emailTemplateReducer from './emailTemplateReducer';
import wishListReducer from './listBidDashboard/wishListItemReducer';

import { optStatusBreakdownReducer } from './optStatusBreakdownReducer';

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
import { JobsHitsApplicationsReducer } from './jobAnalytics/JobsHitsApplicationsReducer';
import { studentTasksReducer } from './studentTasksReducer';

// Education Dashboard Reducers
import { weeklySummariesFiltersApi } from '../actions/weeklySummariesFilterAction';
import { atomReducer } from './educationPortal/atomReducer';
import browseLessonPlanReducer from './educationPortal/broweLPReducer';
import { studentReducer } from './studentProfileReducer';

// Kitchen and Inventory Management
import { kiCalendarApi } from '../actions/kiCalendarAction';

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
  emailTemplates: emailTemplateReducer,
  emailOutbox: emailOutboxReducer,

  optStatusBreakdown: optStatusBreakdownReducer,

  WishListItem: wishListReducer,

  listOverview: listOverviewReducer,
  listingAvailability: listingAvailabilityReducer,
  listingBooking: listingBookingReducer,
  reviewsInsights: reviewsInsightReducer,

  // job analytics
  hoursPledged: hoursPledgedReducer,
  jobsHitsApplications: JobsHitsApplicationsReducer,

  // student tasks
  studentTasks: studentTasksReducer,
  jobApplication: jobApplicationReducer,

  // education portal
  atom: atomReducer,

  // education portal
  browseLessonPlan: browseLessonPlanReducer,

  // Kitchen and Inventory Management
  [kiCalendarApi.reducerPath]: kiCalendarApi.reducer,
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
  student: studentReducer,
};

export { localReducers, sessionReducers };
