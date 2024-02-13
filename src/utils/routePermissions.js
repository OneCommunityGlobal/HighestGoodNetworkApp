//  Necessary permission(s) to access a route. Only one in the list is required.
// Route : Permissions
export const RoutePermissions = {
  reports: 'getReports',
  weeklySummariesReport: 'getWeeklySummaries',
  userManagement: 'postUserProfile',
  badgeManagement: [
    'seeBadges',
    'createBadges',
    'updateBadges',
    'deleteBadges'
  ],
  projects: [
    'postProject',
    'deleteProject',
    'putProject',
    'getProjectMembers',
    'assignProjectToUsers',
    'category/non-permission',
    'postWbs',
    'deleteWbs',
    'category/non-permission',
    'postTask',
    'updateTask',
    'deleteTask'
  ],
  teams: [
    'postTeam',
    'putTeam',
    'deleteTeam',
    'assignTeamToUsers'
  ],
  permissionsManagement: 'putRole',
  userPermissionsManagement: 'putUserProfilePermissions',
  inventoryProject: '',
  inventoryProjectWbs: '',
};
