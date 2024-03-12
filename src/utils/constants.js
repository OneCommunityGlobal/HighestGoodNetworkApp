/**
 * Constant value to validate user permissions throughout the codebase
 */
export const permissions = {
  reports: 'getReports',
  weeklySummariesReport: 'getWeeklySummaries',
  userManagement: {
    getUserProfiles: 'getUserProfiles',
    postUserProfile: 'postUserProfile',
    deleteUserProfile: 'deleteUserProfile',
    changeUserStatus: 'changeUserStatus',
    putUserProfile: 'putUserProfile',
    addDeleteEditOwners: 'addDeleteEditOwners',
    updatePassword: 'updatePassword',
    manageTimeOffRequests: 'manageTimeOffRequests',
  },
  badgeManagement: {
    seeBadges: 'seeBadges',
    createBadges: 'createBadges',
    updateBadges: 'updateBadges',
    deleteBadges: 'deleteBadges',
  },
  projects: {
    postProject: 'postProject',
    deleteProject: 'deleteProject',
    putProject: 'putProject',
    getProjectMembers: 'getProjectMembers',
    assignProjectToUsers: 'assignProjectToUsers',
    unassignUserInProject: 'unassignUserInProject',
    postWbs: 'postWbs',
    deleteWbs: 'deleteWbs',
    postTask: 'postTask',
    updateTask: 'updateTask',
    deleteTask: 'deleteTask',
    suggestTask: 'suggestTask',
  },
  putUserProfileImportantInfo: 'putUserProfileImportantInfo',
  teams: {
    postTeam: 'postTeam',
    putTeam: 'putTeam',
    deleteTeam: 'deleteTeam',
    assignTeamToUsers: 'assignTeamToUsers',
  },
  permissionsManagement: {
    postRole: 'postRole',
    putRole: 'putRole',
    deleteRole: 'deleteRole',
    putUserProfilePermissions: 'putUserProfilePermissions',
  },
  inventoryProject: '',
  inventoryProjectWbs: '',
  popups: { createPopup: 'createPopup', updatePopup: 'updatePopup' },
  timeLog: {
    editTimelogInfo: 'editTimelogInfo',
    editTimeEntry: 'editTimeEntry',
    deleteTimeEntryOthers: 'deleteTimeEntryOthers',
    deleteTimeEntry: 'deleteTimeEntry',
  },
};
