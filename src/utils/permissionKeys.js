/**
 * Permission key constants for hasPermission() calls.
 * Built from Permissions.json (Permissions Management source of truth),
 * plus keys still referenced in the app that are not yet in that file.
 *
 * Prefer: hasPermission(permissions.deleteWbs)
 * Avoid:  hasPermission('deleteWbs')
 */
import permissionLabels from '../components/PermissionsManagement/Permissions.json';

const collectKeys = (perms, out = []) => {
  perms.forEach(permission => {
    if (permission.subperms) {
      collectKeys(permission.subperms, out);
    } else if (permission.key) {
      out.push(permission.key);
    }
  });
  return out;
};

/** Keys used in the codebase but not (yet) listed in Permissions.json */
const LEGACY_OR_EXTRA_KEYS = [
  'addDeleteEditOwners',
  'announcements_manage',
  'assignBadgeOthers',
  'createPopup',
  'delete:badges',
  'deleteTimeEntry',
  'deleteUserProfile',
  'editProject',
  'editSummaryHoursCount',
  'editTimelogInfo',
  'getWeeklyVolunteerSummary', // RoutePermissions alias (JSON uses getVolunteerWeeklySummary)
  'infringementAuthorizer',
  'manageAdminLinks',
  'postTeam', // still used for create-team UI; may nest under Teams in Permissions.json
  'scheduleMeetings',
  'seeProjectManagement',
  'seeQSC',
  'seeSummaryIndicator',
  'seeVisibilityIcon',
  'unassignUserInProject',
  'update:badges',
  'updateUserSkillsProfileFollowUp',
];

const allKeys = [...new Set([...collectKeys(permissionLabels), ...LEGACY_OR_EXTRA_KEYS])].sort(
  (a, b) => a.localeCompare(b),
);

/**
 * Flat map of permission key -> same string value.
 * Nested category helpers below mirror the original PR #2052 shape for Header/route checks.
 */
export const permissions = Object.freeze(
  Object.fromEntries(allKeys.map(key => [key, key])),
);

/**
 * Nested permission groups (PR #2052 style) for category-level references.
 * Values remain the canonical permission strings.
 */
export const permissionCategories = Object.freeze({
  reports: permissions.getReports,
  weeklySummariesReport: {
    getWeeklySummaries: permissions.getWeeklySummaries,
    totalValidWeeklySummaries: permissions.totalValidWeeklySummaries,
  },
  userManagement: {
    getUserProfiles: permissions.getUserProfiles,
    postUserProfile: permissions.postUserProfile,
    deleteUserProfile: permissions.deleteUserProfile,
    changeUserStatus: permissions.changeUserStatus,
    putUserProfile: permissions.putUserProfile,
    addDeleteEditOwners: permissions.addDeleteEditOwners,
    updatePassword: permissions.updatePassword,
    manageTimeOffRequests: permissions.manageTimeOffRequests,
    putUserProfileImportantInfo: permissions.putUserProfileImportantInfo,
    changeUserRehireableStatus: permissions.changeUserRehireableStatus,
    manageAdminLinks: permissions.manageAdminLinks,
    seeQSC: permissions.seeQSC,
    setFinalDay: permissions.setFinalDay,
    interactWithPauseUserButton: permissions.interactWithPauseUserButton,
  },
  badgeManagement: {
    seeBadges: permissions.seeBadges,
    createBadges: permissions.createBadges,
    updateBadges: permissions.updateBadges,
    deleteBadges: permissions.deleteBadges,
    assignBadges: permissions.assignBadges,
    assignBadgeOthers: permissions.assignBadgeOthers,
    modifyBadgeAmount: permissions.modifyBadgeAmount,
  },
  projects: {
    postProject: permissions.postProject,
    deleteProject: permissions.deleteProject,
    putProject: permissions.putProject,
    getProjectMembers: permissions.getProjectMembers,
    assignProjectToUsers: permissions.assignProjectToUsers,
    unassignUserInProject: permissions.unassignUserInProject,
    postWbs: permissions.postWbs,
    deleteWbs: permissions.deleteWbs,
    postTask: permissions.postTask,
    updateTask: permissions.updateTask,
    deleteTask: permissions.deleteTask,
    suggestTask: permissions.suggestTask,
  },
  teams: {
    postTeam: permissions.postTeam,
    putTeam: permissions.putTeam,
    deleteTeam: permissions.deleteTeam,
    assignTeamToUsers: permissions.assignTeamToUsers,
    editTeamCode: permissions.editTeamCode,
  },
  permissionsManagement: {
    postRole: permissions.postRole,
    putRole: permissions.putRole,
    deleteRole: permissions.deleteRole,
    putUserProfilePermissions: permissions.putUserProfilePermissions,
  },
  popups: {
    createPopup: permissions.createPopup,
    updatePopup: permissions.updatePopup,
  },
  timeLog: {
    editTimelogInfo: permissions.editTimelogInfo,
    deleteTimeEntryOthers: permissions.deleteTimeEntryOthers,
    deleteTimeEntry: permissions.deleteTimeEntry,
  },
  seeSummaryIndicator: permissions.seeSummaryIndicator,
  seeVisibilityIcon: permissions.seeVisibilityIcon,
  infringementAuthorizer: permissions.infringementAuthorizer,
  highlightEligibleBios: permissions.highlightEligibleBios,
});

export default permissions;
