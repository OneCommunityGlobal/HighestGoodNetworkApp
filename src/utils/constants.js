/**
 * Constant value to validate user permissions throughout the codebase
 */
export const permissions = {
  reports: 'getReports',
  weeklySummariesReport: {getWeeklySummaries:'getWeeklySummaries',totalValidWeeklySummaries: 'totalValidWeeklySummaries'},
  userManagement: {
    getUserProfiles: 'getUserProfiles',
    postUserProfile: 'postUserProfile',
    deleteUserProfile: 'deleteUserProfile',
    changeUserStatus: 'changeUserStatus',
    putUserProfile: 'putUserProfile',
    addDeleteEditOwners: 'addDeleteEditOwners',
    updatePassword: 'updatePassword',
    manageTimeOffRequests: 'manageTimeOffRequests',
    putUserProfileImportantInfo: 'putUserProfileImportantInfo',
  },
  badgeManagement: {
    seeBadges: 'seeBadges',
    createBadges: 'createBadges',
    updateBadges: 'updateBadges',
    deleteBadges: 'deleteBadges',
    assignBadges: 'assignBadges',
    assignBadgeOthers: 'assignBadgeOthers'
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
  
  teams: {
    postTeam: 'postTeam',
    putTeam: 'putTeam',
    deleteTeam: 'deleteTeam',
    assignTeamToUsers: 'assignTeamToUsers',
    editTeamCode: 'editTeamCode'
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
  seeSummaryIndicator: 'seeSummaryIndicator',
  seeVisibilityIcon: 'seeVisibilityIcon',
  infringementAuthorizer:'infringementAuthorizer',
  highlightEligibleBios:'highlightEligibleBios'
};
