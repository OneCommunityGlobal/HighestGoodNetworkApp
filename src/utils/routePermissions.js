//  Necessary permission to access a route
// Route : Permissions
export const RoutePermissions = {
  inventoryProject: '',
  inventoryProjectWbs: '',
  weeklySummariesReport: 'getWeeklySummaries',
  seeOnlyWeeklySummariesReports: 'seeOnlyWeeklySummariesReports',
  projects: 'postProject',
  userManagement: 'postUserProfile',
  badgeManagement: 'createBadges',
  userPermissionsManagement: 'putUserProfilePermissions',
  permissionsManagement: 'putRole',
  permissionsManagementRole: 'putRole',
  teams: 'putTeam',
  reports: 'getWeeklySummaries',
};
