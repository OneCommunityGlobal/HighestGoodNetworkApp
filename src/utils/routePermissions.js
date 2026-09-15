//  Necessary permission(s) to access a route. Only one in the list is required.
// Route : Permissions
import { permissions } from './constants';

const RoutePermissions = {
  reports: [permissions.getReports],
  weeklySummariesReport: [permissions.getWeeklySummaries],
  prDashboard: [permissions.accessPRTeamDashboard],
  weeklyVolunteerSummary: [permissions.getWeeklyVolunteerSummary],
  userManagement: [
    permissions.getUserProfiles,
    permissions.postUserProfile,
    permissions.deleteUserProfile,
    permissions.changeUserStatus,
    permissions.interactWithPauseUserButton,
  ],
  badgeManagement: [
    permissions.seeBadges,
    permissions.createBadges,
    permissions.updateBadges,
    permissions.deleteBadges,
    permissions.assignBadges,
  ],
  projects: [
    permissions.postProject,
    permissions.deleteProject,
    permissions.putProject,
    permissions.getProjectMembers,
    permissions.assignProjectToUsers,
    permissions.postWbs,
    permissions.deleteWbs,
    permissions.postTask,
    permissions.updateTask,
    permissions.deleteTask,
    permissions.rescheduleEvent,
  ],
  teams: [
    permissions.postTeam,
    permissions.putTeam,
    permissions.deleteTeam,
    permissions.assignTeamToUsers,
  ],
  permissionsManagement: [
    permissions.postRole,
    permissions.putRole,
    permissions.deleteRole,
    permissions.putUserProfilePermissions,
  ],
  userPermissionsManagement: [permissions.putUserProfilePermissions],
  inventoryProject: [''],
  inventoryProjectWbs: [''],
  workBreakdownStructure: [
    permissions.postWbs,
    permissions.deleteWbs,
    permissions.postTask,
    permissions.updateTask,
    permissions.deleteTask,
    permissions.resolveTask,
    permissions.putReviewStatus,
    permissions.suggestTask,
  ],
  announcements: [permissions.sendEmails],
  faq: [''],
  faqManagement: [permissions.manageFAQs],
  meetings: [permissions.scheduleMeetings],
  accessHgnSkillsDashboard: [permissions.accessHgnSkillsDashboard],
  jobFormManagement: [
    permissions.manageJobForms,
    permissions.createFormQuestions,
    permissions.editFormQuestions,
    permissions.deleteFormQuestions,
  ],
};
export default RoutePermissions;
