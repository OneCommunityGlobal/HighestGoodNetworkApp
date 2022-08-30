const permissions = {
    'Administrator': [
        'seeWeeklySummaryReports',
        'seeUserManagement',
        'seeBadgeManagement',
        'seePopupManagement',
        'seeProjectManagement',
        'seeTeamsManagement',
        'deleteOwnBadge',
        'modifyOwnBadgeAmount',
        'assignBadgeOthers',
        'toggleWeeklySummary',
        'editTimelogInfo',
        'addTimeEntryOthers',
        'deleteTimeEntryOthers',
        'toggleTangibleTime',
        'changeIntangibleTimeEntryDate',
        'editTimeEntry',
        'deleteTimeEntry',
        'deleteWbs',
        'addTask',
        'deleteTask',
        'editTask',
        'addWbs',
        'addProject',
        'deleteProject',
        'editProject',
        'findUserInProject',
        'assignUserInProject',
        'unassignUserInProject',
        'changeUserStatus',
        'seeUserTimelog',
        'adminLinks',
        'editUserProfile',
        'assignTeamToUser',
        'seeUserProfileInProjects',
        'createTeam',
        'editDeleteTeam',
        'handleBlueSquare',
        'resetPasswordOthers',
        'toggleSubmitForm',
    ],
    'Volunteer': [
        'V'
    ],
    'Core Team': [
        'seeWeeklySummaryReports',
    ],
    'Manager': [
        'seeWeeklySummaryReports',
        'assignOnlyBlueSquares',
        'editTask',
    ],
    'Mentor': [
        'seeWeeklySummaryReports',
        'assignOnlyBlueSquares',
        'editTask',
    ],
    'Owner': [
        'seeWeeklySummaryReports',
        'seeUserManagement',
        'seeBadgeManagement',
        'seePopupManagement',
        'seeProjectManagement',
        'seeTeamsManagement',
        'deleteOwnBadge',
        'modifyOwnBadgeAmount',
        'assignBadgeOthers',
        'toggleWeeklySummary',
        'editTimelogInfo',
        'addTimeEntryOthers',
        'deleteTimeEntryOthers',
        'toggleTangibleTime',
        'changeIntangibleTimeEntryDate',
        'editTimeEntry',
        'deleteTimeEntry',
        'deleteWbs',
        'addTask',
        'deleteTask',
        'editTask',
        'addWbs',
        'addProject',
        'deleteProject',
        'editProject',
        'findUserInProject',
        'assignUserInProject',
        'unassignUserInProject',
        'changeUserStatus',
        'seeUserTimelog',
        'adminLinks',
        'editUserProfile',
        'assignTeamToUser',
        'createTeam',
        'editDeleteTeam',
        'seeUserProfileInProjects',
        'handleBlueSquare',
        'resetPasswordOthers',
        'addDeleteEditOwners',
        'toggleSubmitForm',
    ],
};

const hasPermission = (role, action) => {
    let isAllowed;
    // console.log('user role permissions: ', permissions[role]);
    if (permissions[role].includes(action)) {
        isAllowed = true;
    } else {
        isAllowed = false;
    }
    return isAllowed;
};

export default hasPermission;
