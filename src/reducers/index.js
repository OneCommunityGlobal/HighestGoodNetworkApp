<<<<<<< HEAD
import { combineReducers } from 'redux'
import { userProfileByIdReducer } from './userProfileByIdReducer'
import { authReducer } from './authReducer'
import { handleSuccessReducer } from './handleSuccessReducer'
import { allUserProfilesReducer } from './allUserProfilesReducer'
import { userTeamMembersReducer } from './userTeamMembersReducer'
import { userProjectMembersReducer } from './userProjectMembersReducer'
import { dashboardDataReducer } from './dashboardDataReducer'
import { weeklyDashboardDataReducer } from './weeklyDashboardDataReducer'
import { monthlyDashboardDataReducer } from './monthlyDashboardDataReducer'
import { leaderboardDataReducer } from './leaderboardDataReducer'
import { weeklySummariesReducer } from './weeklySummariesReducer'
import { weeklySummariesReportReducer } from './weeklySummariesReportReducer'
import { actionItemsReducer } from './actionItemsReducer'
import { notificationsReducer } from './notificationsReducer'
import { allProjectsReducer } from './allProjectsReducer'
import { projectByIdReducer } from './projectByIdReducer'
import { userProjectsReducer } from './userProjectsReducer'
import { projectMembershipReducer } from './projectMembershipReducer'
import { allTeamsReducer } from './allTeamsReducer'
import { teamByIdReducer } from './teamByIdReducer'
import { teamMembershipReducer } from './teamMembershipReducer'
import { timeEntriesForSpecifiedProjectReducer } from './timeEntriesForSpecifiedProjectReducer'
import { allTimeEntriesReducer } from './allTimeEntriesReducer'
import { timeEntriesForSpecifiedPeriodReducer } from './timeEntriesForSpecifiedPeriodReducer'
import { errorsReducer } from './errorsReducer'
import { timeEntriesReducer } from './timeEntriesReducer'
import { timerReducer } from './timerReducer'
=======
import { combineReducers } from 'redux';
import { userProfileByIdReducer } from './userProfileByIdReducer';
import { authReducer } from './authReducer';
import { handleSuccessReducer } from './handleSuccessReducer';
import { allUserProfilesReducer } from './allUserProfilesReducer';
import { userTeamMembersReducer } from './userTeamMembersReducer';
import { userProjectMembersReducer } from './userProjectMembersReducer';
import { dashboardDataReducer } from './dashboardDataReducer';
import { weeklyDashboardDataReducer } from './weeklyDashboardDataReducer';
import { monthlyDashboardDataReducer } from './monthlyDashboardDataReducer';
import { leaderboardDataReducer } from './leaderboardDataReducer';
import { weeklySummariesReducer } from './weeklySummariesReducer';
import { weeklySummariesReportReducer } from './weeklySummariesReportReducer';
import { actionItemsReducer } from './actionItemsReducer';
import { notificationsReducer } from './notificationsReducer';
import { allProjectsReducer } from './allProjectsReducer';
import { projectByIdReducer } from './projectByIdReducer';
import { userProjectsReducer } from './userProjectsReducer';
import { projectMembershipReducer } from './projectMembershipReducer';
import { allTeamsReducer } from './allTeamsReducer';
import { teamByIdReducer } from './teamByIdReducer';
import { teamMembershipReducer } from './teamMembershipReducer';
import { timeEntriesForSpecifiedProjectReducer } from './timeEntriesForSpecifiedProjectReducer';
import { allTimeEntriesReducer } from './allTimeEntriesReducer';
import { timeEntriesForSpecifiedPeriodReducer } from './timeEntriesForSpecifiedPeriodReducer';
import { errorsReducer } from './errorsReducer';
import { timeEntriesReducer } from './timeEntriesReducer';
import { wbsReducer } from './wbsReducer'
import { taskReducer } from './allTasksReducer'
>>>>>>> ccf1827f9e0c3ade4a3994b4066f1a1c60ccf851

export default combineReducers({
  auth: authReducer,
  userProfile: userProfileByIdReducer,
  allUserProfiles: allUserProfilesReducer,
  // userTeamMembers: userTeamMembersReducer,
  // userProjectMembers: userProjectMembersReducer,
  // dashboardData: dashboardDataReducer,
  leaderBoardData: leaderboardDataReducer,
  weeklySummaries: weeklySummariesReducer,
  weeklySummariesReport: weeklySummariesReportReducer,
  // weeklyDashboardData: weeklyDashboardDataReducer,
  // monthlyDashboardData: monthlyDashboardDataReducer,
  //	actionItems: actionItemsReducer,
  //	notifications: notificationsReducer,
  allProjects: allProjectsReducer,
  // project: projectByIdReducer,
  userProjects: userProjectsReducer,
  projectMembers: projectMembershipReducer,
  // allTeams: allTeamsReducer,
  // team: teamByIdReducer,
  // teamMembers: teamMembershipReducer,
  // allTimeEntries: allTimeEntriesReducer,
  // userTimeEntries: timeEntriesForSpecifiedPeriodReducer,
  // projectTimeEntries: timeEntriesForSpecifiedProjectReducer,
  // requestStatus: handleSuccessReducer,
  wbs: wbsReducer,
  tasks: taskReducer,
  errors: errorsReducer,
<<<<<<< HEAD
  timeEntries: timeEntriesReducer,
  timer: timerReducer,
})
=======
  timeEntries: timeEntriesReducer
});
>>>>>>> ccf1827f9e0c3ade4a3994b4066f1a1c60ccf851
