//  Necessary permission to access a route
// Route : Permissions
export const RoutePermissions = {
  inventoryProject: '',
  inventoryProjectWbs: '',
  weeklySummariesReport: 'getWeeklySummaries',
  projects: 'postProject',
  userManagement: 'postUserProfile',
  userManagement_fullFunctionality: 'seeUserManagement',
  userManagement_onlyCreateUsers: 'seeUserManagementTab',
  badgeManagement: 'createBadges',
  permissionsManagement: 'putRole',
  permissionsManagementRole: 'putRole',
  teams: 'putTeam',
  reports: 'getWeeklySummaries',
};
