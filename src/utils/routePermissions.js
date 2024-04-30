//  Necessary permission(s) to access a route. Only one in the list is required.
// Route : Permissions
export const RoutePermissions = {
  reports: 'getReports',
  weeklySummariesReport: 'getWeeklySummaries',
  userManagement: [
    'getUserProfiles',
    'postUserProfile',
    'deleteUserProfile',
    'changeUserStatus'
  ],
  badgeManagement: [
    'seeBadges',
    'createBadges',
    'updateBadges',
    'deleteBadges',
    'assignBadges'
  ],
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
    'deleteTask'
  ],
  teams: [
    'postTeam',
    'putTeam',
    'deleteTeam',
    'assignTeamToUsers'
  ],
  permissionsManagement: [
    'postRole',
    'putRole',
    'deleteRole'
  ],
  userPermissionsManagement: 'putUserProfilePermissions',
  inventoryProject: '',
  inventoryProjectWbs: '',
};
