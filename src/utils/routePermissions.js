//  Necessary permission(s) to access a route. Only one in the list is required.
// Route : Permissions
const RoutePermissions = {
  reports: ['getReports'],
  weeklySummariesReport: ['getWeeklySummaries'],
  weeklyVolunteerSummary: ['getWeeklyVolunteerSummary'],
  userManagement: ['getUserProfiles', 'postUserProfile', 'deleteUserProfile', 'changeUserStatus'],
  badgeManagement: ['seeBadges', 'createBadges', 'updateBadges', 'deleteBadges', 'assignBadges'],
  projects: [
    'postProject',
    'deleteProject',
    'putProject',
    'getProjectMembers',
    'assignProjectToUsers',
    'postWbs',
    'deleteWbs',
    'postTask',
    'updateTask',
    'deleteTask',
    'rescheduleEvent',
  ],
  teams: ['postTeam', 'putTeam', 'deleteTeam', 'assignTeamToUsers'],
  permissionsManagement: ['postRole', 'putRole', 'deleteRole'],
  userPermissionsManagement: ['putUserProfilePermissions'],
  inventoryProject: [''],
  inventoryProjectWbs: [''],
  workBreakdownStructure: [
    'postWbs',
    'deleteWbs',
    'postTask',
    'updateTask',
    'deleteTask',
    'resolveTask',
    'putReviewStatus',
    'suggestTask',
  ],
  announcements: ['sendEmails'],
};
export default RoutePermissions;
