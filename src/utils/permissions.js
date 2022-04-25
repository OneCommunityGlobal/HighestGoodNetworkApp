const permissions = {
    'Administrator' : [
        'seeWeeklySummaryReports',
        'seeUserManagement',
        'seeBadgeManagement',
        'seePopupManagement',
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
        'handleBlueSquare',
        'resetPasswordOthers',
        'dataIsTangibleTimelog',
    ],
    'Volunteer': [
        'V'
    ],
    'Core Team': [
        'seeWeeklySummaryReports',
    ],
    'Manager': [
        'seeWeeklySummaryReports',
    ],
    'Mentor': [
        'M'
    ],
    'Owner': [
        'seeWeeklySummaryReports',
        'seeUserManagement',
        'seeBadgeManagement',
        'seePopupManagement',
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
        'handleBlueSquare',
        'resetPasswordOthers',
        'dataIsTangibleTimelog',
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
