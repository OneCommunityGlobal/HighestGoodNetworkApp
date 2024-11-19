export const permissionPresets = [
    {
        name: 'Owner',
        permissions: [
            'seeUsersInDashboard', 
            'editHeaderMessage',
            'getReports', 
            'getWeeklySummaries', 
            'totalValidWeeklySummaries', 
            'highlightEligibleBios',
            'getVolunteerWeeklySummary',
            'editTeamCode', 
            'getUserProfiles', 
            'postUserProfile', 
            'putUserProfile', 
            'changeUserStatus', 
            'addInfringements', 
            'editInfringements', 
            'deleteInfringements', 
            'putUserProfileImportantInfo', 
            'updateSummaryRequirements', 
            'manageTimeOffRequests', 
            'changeUserRehireableStatus', 
            'seeBadges', 
            'createBadges', 
            'updateBadges', 
            'deleteBadges', 
            'assignBadges', 
            'postProject', 
            'deleteProject', 
            'putProject', 
            'getProjectMembers', 
            'assignProjectToUsers', 
            'postWbs', 
            'deleteWbs', 
            'postTask', 
            'updateTask', 
            'deleteTask', 
            'resolveTask',
            'suggestTask',
            'putReviewStatus',
            'putTeam', 
            'deleteTeam', 
            'postTeam', 
            'assignTeamToUsers', 
            'toggleTangibleTime',
            'postTimeEntry', 
            'deleteTimeEntry', 
            'editTimeEntryTime', 
            'editTimeEntryDescription', 
            'editTimeEntryToggleTangible', 
            'editTimeEntryDate', 
            'sendEmails',
            'postRole',
            'deleteRole',
            'putRole', 
            'putUserProfilePermissions', 
            'updatePopup', 
            'addNewTitle', 
            'assignTitle', 
            'editTitle'
        ],
    },
    {
        name: 'Administrator',
        permissions: [
            'seeUsersInDashboard', 
            'getReports', 
            'getWeeklySummaries', 
            'totalValidWeeklySummaries', 
            'editTeamCode', 
            'getUserProfiles', 
            'postUserProfile', 
            'putUserProfile', 
            'changeUserStatus', 
            'addInfringements', 
            'editInfringements', 
            'deleteInfringements', 
            'putUserProfileImportantInfo', 
            'updateSummaryRequirements', 
            'manageTimeOffRequests', 
            'changeUserRehireableStatus', 
            'seeBadges', 
            'createBadges', 
            'updateBadges', 
            'deleteBadges', 
            'assignBadges', 
            'postProject', 
            'deleteProject', 
            'putProject', 
            'getProjectMembers', 
            'assignProjectToUsers', 
            'postWbs', 
            'deleteWbs', 
            'postTask', 
            'updateTask', 
            'deleteTask', 
            // just testing these ones
            'suggestTask',
            'putReviewStatus',
            // end testing
            'putTeam', 
            'deleteTeam', 
            'postTeam', 
            'assignTeamToUsers', 
            'postTimeEntry', 
            'deleteTimeEntry', 
            'editTimeEntryTime', 
            'editTimeEntryDescription', 
            'editTimeEntryToggleTangible', 
            'editTimeEntryDate', 
            'putRole', 
            'putUserProfilePermissions', 
            'updatePopup', 
            'addNewTitle', 
            'assignTitle'
        ],
    },
    {
        name: 'Manager',
        permissions: [
            // testing these ones
            'seeUsersInDashboard', 
            'getReports', 
            'getWeeklySummaries', 
            'totalValidWeeklySummaries', 
            'editTeamCode', 
            'postUserProfile', 
            'changeUserStatus', 
            'putUserProfileImportantInfo', 
            'updateSummaryRequirements', 
            'manageTimeOffRequests', 
            'changeUserRehireableStatus', 
            'seeBadges', 
            'createBadges', 
            'updateBadges', 
            'deleteBadges', 
            'assignBadges', 
            'postProject', 
            'deleteProject', 
            'putProject', 
            'assignProjectToUsers', 
            'postWbs', 
            'deleteWbs', 
            'deleteTask', 
            'deleteTeam', 
            'postTeam', 
            'assignTeamToUsers', 
            'postTimeEntry', 
            'deleteTimeEntry', 
            'editTimeEntryTime', 
            'editTimeEntryDescription', 
            'editTimeEntryToggleTangible', 
            'editTimeEntryDate', 
            'putRole', 
            'putUserProfilePermissions', 
            'updatePopup', 
            'addNewTitle', 
            'assignTitle',
            // end testing
            'getUserProfiles', 
            'putUserProfile', 
            'addInfringements', 
            'editInfringements', 
            'deleteInfringements', 
            'getProjectMembers', 
            'postTask', 
            'updateTask', 
            'suggestTask', 
            'putReviewStatus', 
            'putTeam'
        ],
    },
    {
        name: 'Mentor',
        permissions: [
            'getUserProfiles', 
            'putUserProfile', 
            'addInfringements', 
            'editInfringements', 
            'deleteInfringements', 
            'getProjectMembers', 
            'updateTask', 
            'suggestTask', 
            'putReviewStatus',
            // testing these ones
            'seeUsersInDashboard', 'getReports', 'getWeeklySummaries', 'totalValidWeeklySummaries', 'editTeamCode', 'postUserProfile', 'changeUserStatus', 'putUserProfileImportantInfo', 'updateSummaryRequirements', 'manageTimeOffRequests', 'changeUserRehireableStatus', 'seeBadges', 'createBadges', 'updateBadges', 'deleteBadges', 'assignBadges', 'postProject', 'deleteProject', 'putProject', 'assignProjectToUsers', 'postWbs', 'deleteWbs', 'postTask', 'deleteTask', 'putTeam', 'deleteTeam', 'postTeam', 'assignTeamToUsers', 'postTimeEntry', 'deleteTimeEntry', 'editTimeEntryTime', 'editTimeEntryDescription', 'editTimeEntryToggleTangible', 'editTimeEntryDate', 'putRole', 'putUserProfilePermissions', 'updatePopup', 'addNewTitle', 'assignTitle'
            // end testing
        ],
    },
    {
        name: 'Core Team',
        permissions: [
            'seeUsersInDashboard', 
            'getReports', 
            'getWeeklySummaries', 
            'getUserProfiles', 
            'getProjectMembers'
        ],
    },
    {
        name: 'SaumitTestTest',
        permissions: [
            'seeUsersInDashboard', 
            'editHeaderMessage', 
            'getReports', 
            'getWeeklySummaries', 
            'totalValidWeeklySummaries', 
            'highlightEligibleBios', 
            'getVolunteerWeeklySummary', 
            'editTeamCode', 
            'getUserProfiles', 
            'postUserProfile', 
            'putUserProfile', 
            'changeUserStatus', 
            'addInfringements', 
            'editInfringements', 
            'deleteInfringements', 
            'putUserProfileImportantInfo', 
            'updateSummaryRequirements', 
            'manageTimeOffRequests', 
            'changeUserRehireableStatus',
            // testing these ones
            'getProjectMembers'
            // end testing
        ],
    },
    {
        name: 'TestRole',
        permissions: [
            // testing these ones
            'seeUsersInDashboard', 'editHeaderMessage',
            // end testing
            'getReports', 
            'getWeeklySummaries', 
            'totalValidWeeklySummaries', 
            'highlightEligibleBios', 
            'getVolunteerWeeklySummary', 
            // testing these ones
            'editTeamCode',
            // end testing
            'getUserProfiles', 
            // testing these ones
            'postUserProfile',
            // end testing
            'putUserProfile', 
            'changeUserStatus', 
            // testing these ones
            'addInfringements', 'editInfringements', 'deleteInfringements', 'putUserProfileImportantInfo', 'updateSummaryRequirements', 'manageTimeOffRequests', 'changeUserRehireableStatus', 'getProjectMembers',
            // end testing
            // 'putUserProfilePermissions' - testing this one not in the list
        ],
    },
    {
        name: 'testtst',
        permissions: [
            'seeUsersInDashboard', 
            'editHeaderMessage', 
            'getReports', 
            'getWeeklySummaries', 
            'totalValidWeeklySummaries', 
            'highlightEligibleBios', 
            'getVolunteerWeeklySummary', 
            'editTeamCode',
            // testing these ones
            'getUserProfiles', 'getProjectMembers'
            // end testing
        ],
    },
    {
        name: 'usethistotest',
        permissions: [
            // testing these ones
            'seeUsersInDashboard', 'getReports', 'getWeeklySummaries',
            // end testing
            'totalValidWeeklySummaries', 
            'highlightEligibleBios', 
            // testing these ones
            'getUserProfiles',
            // end testing
            'postUserProfile', 
            'putUserProfile', 
            'updateBadges', 
            'deleteBadges',
            // testing these ones
            'getProjectMembers'
            // end testing
        ],
    },
    {
        name: 'Creator',
        permissions: [
            'seeUsersInDashboard', 
            'getReports',
            // testing these ones
            'getWeeklySummaries', 'getUserProfiles', 'getProjectMembers'
            // end testing
        ],
    },
    {
        name: 'Test Role 3',
        permissions: [
            // testing these ones
            'seeUsersInDashboard',
            // end testing
            'getReports', 
            'getWeeklySummaries', 
            'totalValidWeeklySummaries', 
            'highlightEligibleBios', 
            'getVolunteerWeeklySummary', 
            'editTeamCode',
            // testing these ones
            'getUserProfiles', 'getProjectMembers'
            // end testing
        ],
    },
    {
        name: 'Assistant Manager',
        permissions: [
            // testing these ones
            'seeUsersInDashboard', 'getReports', 'getWeeklySummaries', 'getUserProfiles', 'getProjectMembers',
            // end testing
            'suggestTask', 
            'putReviewStatus'
        ],
    },
    {
        name: 'Volunteer',
        permissions: [
            // testing these ones
            'seeUsersInDashboard', 'getReports', 'getWeeklySummaries', 'getUserProfiles', 'getProjectMembers',
            // end testing
            'suggestTask'
        ],
    }
]