// { frontEndPermission: [backEndPermissions]}
// If the field is empty, it means that the route in the backend is allowed to access without authentication.
// Some permissions may be repeated;
const associatedPermissions = {
  seeWeeklySummaryReports: ['getWeeklySummaries'],
  seeUserManagement: [
    'deleteUserProfile',
    'getUserProfiles',
    ,
    'putUserProfileImportantInfo',
    'postUserProfile',
  ],
  seeBadgeManagement: ['seeBadges', 'createBadges'],
  seePopupManagement: ['createPopup', 'updatePopup'],
  seeProjectManagement: ['getAllInvInProjectWBS', 'getAllInvInProject'],
  seeTeamsManagement: ['getUserProfiles'],
  seeUserProfileInProjects: ['getUserProfiles'],
  deleteOwnBadge: ['deleteBadges', 'createBadges'],
  modifyOwnBadgeAmount: ['updateBadges', 'createBadges'],
  assignBadgeOthers: ['assignBadges', 'createBadges'],
  createTeam: [''],
  editDeleteTeam: ['deleteTeam', 'putTeam'],
  editTimelogInfo: ['editTimeEntry'],
  addTimeEntryOthers: [''],
  deleteTimeEntryOthers: ['deleteTimeEntry'],
  toggleTangibleTime: ['editTimeEntry'],
  changeIntangibleTimeEntryDate: ['editTimeEntry'],
  editTimeEntry: ['editTimeEntry'],
  deleteTimeEntry: ['deleteTimeEntry'],
  deleteWbs: ['deleteWbs'],
  addTask: ['postTask', 'updateNum'],
  deleteTask: ['swapTask', 'importTask', 'updateTask', 'updateNum'],
  editTask: ['updateTask', 'updateNum'],
  addWbs: ['postWbs'],
  addProject: ['postProject'],
  deleteProject: ['deleteProject'],
  editProject: ['putProject'],
  findUserInProject: ['getProjectMembers'],
  assignUserInProject: ['assignProjectToUsers'],
  unassignUserInProject: ['assignProjectToUsers', 'putProject'],
  adminLinks: [''],
  editUserProfile: ['putUserProfile'],
  assignTeamToUser: ['assignTeamToUsers'],
  createTeam: [''],
  editDeleteTeam: ['deleteTeam', 'putTeam'],
  seeUserProfileInProjects: ['getUserProfiles', 'getProjectMembers'],
  handleBlueSquare: ['putUserProfileImportantInfo', 'putUserProfile'],
  resetPasswordOthers: ['updatePassword', 'putUserProfileImportantInfo'],
  seeQSC: ['seeQSC', 'addNewTitle', 'assignTitle'],
  dataIsTangibleTimelog: [''],
  addDeleteEditOwners: [''],
  toggleSubmitForm: [''],
  seePermissionsManagement: [''],
};

export const commonBackEndPermissions = [
  'infringementAuthorizer',
  'getTimeZoneAPIKey',
  'checkLeadTeamOfXplus',
];

// receive a permission front-end [key] => return the array back-end, but in form of strings, putting a flat.

export const permissionFrontToBack = frontEndPermission => {
  return associatedPermissions[frontEndPermission];
};
