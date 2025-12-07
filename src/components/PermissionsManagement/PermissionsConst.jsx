//// recursive function that returns the permission keys given an array of permission objects (from permissionLabels below)
const getAllSubpermissionKeys = permissions => {
  const keys = [];
  permissions.forEach(permission => {
    // recursive call for nested permissions
    if (permission.subperms) {
      keys.push(...getAllSubpermissionKeys(permission.subperms));
    } else {
      keys.push(permission.key);
    }
  });
  return keys;
};

const makeCategory = (label, description, subperms) => ({
  label,
  description,
  subperms,
});

const makePerm = (label, key, description) => ({
  label,
  key,
  description,
});

export const generatePermissionLabelKeyMapping = (permissionLabels, start) => {
  if (start >= permissionLabels.length) {
    return {};
  }
  if (!permissionLabels?.length) {
    return {};
  }
  const firstEle = permissionLabels[start];
  const { label, key, subperms } = firstEle;
  // console.log('label', label);
  let currentVal;
  if (subperms) {
    currentVal = generatePermissionLabelKeyMapping(subperms, 0);
  } else {
    currentVal = { [key]: label };
  }
  return {
    ...currentVal,
    ...generatePermissionLabelKeyMapping(permissionLabels, start + 1),
  };
};

export const permissionLabels = [
  makeCategory('General', 'Category for all generalized permissions', [
    makePerm(
      'See All Users in Dashboard and Leaderboard',
      'seeUsersInDashboard',
      'Lets the user see all users in the dashboard as if they were on the same team. Requires "See All Users" to function',
    ),
    makePerm(
      'Edit Header Message',
      'editHeaderMessage',
      'Gives the user permission to edit the message displayed in the header',
    ),
  ]),
  makeCategory('Reports', 'Category for all permissions related to reports', [
    makePerm(
      'See Analytics Reports',
      'getReports',
      'Make ONLY "Reports -> “Reports” option appear/accessible.',
    ),
    makePerm(
      'See Weekly Summaries',
      'getWeeklySummaries',
      'Makes ONLY the "Reports" -> "Weekly Summaries Reports" option appear/accessible.',
    ),
    makePerm(
      'See/Edit PR Team Dashboard',
      'accessPRTeamDashboard',
      'Gives access to the PR Team dashboard, including view and edit rights.',
    ),
    makePerm(
      'Edit Total Valid Weekly Summaries',
      'totalValidWeeklySummaries',
      'Gives permission to edit total valid weekly summaries count under reports',
    ),
    makePerm(
      'See Highlight for Bios Eligible to be Posted',
      'highlightEligibleBios',
      'Under "Reports" -> "Weekly Summaries Reports", make the "Bio announcement" row highlighted yellow if that user is eligible for their bio to be posted (they have at least 80 tangible hours, 60 days on the team, and still don\'t have their bio posted)',
    ),
    makePerm(
      'Toggle Request Bio',
      'requestBio',
      'Gives the user permission to toggle the "Bio announcement" switch under "Reports" -> "Weekly Summaries Reports"',
    ),
    makePerm(
      'See Volunteer Weekly Summaries',
      'getVolunteerWeeklySummary',
      'Makes ONLY the "Reports" -> "Volunteer Summary Reports" option appear/accessible.',
    ),
    makePerm(
      'Edit Team 4-Digit Codes',
      'editTeamCode',
      'Gives the user permission to edit 4-digit team codes on profile page and weekly summaries report page.',
    ),
    makePerm(
      'Create, Edit and Delete Weekly Summaries Filter',
      'manageSummariesFilters',
      'Gives the user permission to create, edit and delete the filter in weekly summaries report page.',
    ),
    makePerm('See Job Analytics Reports', 'getJobReports', 'Job Analytics Reports.'),
  ]),
  makeCategory('User Management', 'Category for all permissions related to user management', [
    makePerm(
      'See All Users',
      'getUserProfiles',
      'Make the "Other Links" -> "User Management" button appear/accessible.',
    ),
    makePerm(
      'Create New Users',
      'postUserProfile',
      'Make the "Other Links" -> "User Management" button appear/accessible and be able to ONLY create users. No editing or deleting access.',
    ),
    makePerm(
      'Edit User Profile',
      'putUserProfile',
      'Gives the user permission to edit all the information of any user on the user profile page.',
    ),
    makePerm(
      'Change User Status',
      'changeUserStatus',
      'Gives the user permission to change the status of any user on the user profile page or User Management Page. "User Profile" -> "Green round button"',
    ),
    makePerm(
      'Toggle Invisibility Permission Self and Others',
      'toggleInvisibility',
      'Gives the user permission to change the invisibility toggle for themselves and others',
    ),
    makePerm(
      'Assign Blue Squares',
      'addInfringements',
      'Gives the user permission to add blue squares to any user.',
    ),
    makePerm(
      'Edit Blue Squares',
      'editInfringements',
      'Gives the user permission to edit any blue square.',
    ),
    makePerm(
      'Delete Blue Squares',
      'deleteInfringements',
      'Gives the user permission to delete any blue square.',
    ),
    makePerm(
      'Modify Important User Info',
      'putUserProfileImportantInfo',
      'Gives the user the ability to modify several protected parts of users profiles. This includes changing admin links,  weekly summary options, committed hours, role, isRehireable, email, date created, bio status, and more. It also allows to circumvent permissions related to assigning teams or projects and changing active status.',
    ),
    makePerm(
      'Edit Summary Submit Requirement (Others)',
      'updateSummaryRequirements',
      'Gives the user permission to change the requirement to the user to submit a summary.',
    ),
    makePerm(
      'Update Password (Others)',
      'updatePassword',
      'Gives the user permission to update the password of any user but Owner/Admin classes.',
    ),
    makePerm(
      'Manage Time Off Requests',
      'manageTimeOffRequests',
      'Gives the user permission to Add/Delete/Edit Time off requests.',
    ),
    makePerm(
      'Change Rehireable Status',
      'changeUserRehireableStatus',
      'Gives the user permission to change the user status of rehireable or not.',
    ),
    makePerm(
      'Pause User Activity',
      'pauseUserActivity',
      'Gives the user permission to use the "Pause" button to pause user activity on their profile page.',
    ),
    makePerm(
      'Set Final Day',
      'setFinalDay',
      'Gives the user permission to use the set the final working day.',
    ),
    makePerm(
      'HGN People +/- Setup',
      'manageHGNAccessSetup',
      'Gives the user permission to access the HGN Add Access button on user profile pages to add/remove user access to GitHub, Dropbox, Slack, and Sentry.',
    ),
  ]),
  makeCategory('Tracking Management', 'Permissions for managing tracking-related activities.', [
    makePerm(
      'View Tracking Overview',
      'viewTrackingOverview',
      'Allows user to view an overview of tracking activities for all users.',
    ),
    makePerm(
      'Issue Tracking Warnings',
      'issueTrackingWarnings',
      'Allows the user to issue warnings for violations of tracking activities.',
    ),
    makePerm(
      'Issue a Blue Square',
      'issueBlueSquare',
      'Allows the user to issue a blue square for violations of tracking activity.',
    ),
    makePerm(
      'Delete a Warning',
      'deleteWarning',
      'Gives the user permission to delete existing tracking warnings.',
    ),
    makePerm(
      'Add a New Warning Tracker',
      'addWarningTracker',
      'Allows user to add a new warning tracker to the system.',
    ),
    makePerm(
      'Deactivate a Warning Tracker',
      'deactivateWarningTracker',
      'Allows user to deactivate an existing warning tracker.',
    ),
    makePerm(
      'Reactivate a Warning Tracker',
      'reactivateWarningTracker',
      'Allows user to reactivate an existing warning tracker.',
    ),
    makePerm(
      'Delete a Warning Tracker',
      'deleteWarningTracker',
      'Gives user permission to delete a warning tracker from the system.',
    ),
  ]),
  makeCategory('Badge Management', 'Category for all permissions related to badge management', [
    makePerm(
      'See Badges',
      'seeBadges',
      'Gives the user permission to view (but not change) all badges information data on the Other Links -> Badges Management page',
    ),
    makePerm(
      'Create Badges',
      'createBadges',
      'Make the "Other Links" -> "Badge Management" button appear and then have the ability to create (but not edit or delete) badges.',
    ),
    makePerm(
      'Edit Badge',
      'updateBadges',
      'Gives the user permission to edit information like the name, image, etc. of an existing badge',
    ),
    makePerm(
      'Delete Badge',
      'deleteBadges',
      'Gives the user permission to delete a badge on "Other Links" -> "Badge Management"',
    ),
    makePerm(
      'Modify Badge Amount',
      'modifyBadgeAmount',
      'Gives the user permission to increase or decrease the count of a badge on the Badge Reports Component',
    ),
    makePerm(
      'Assign Badges',
      'assignBadges',
      'Gives the user permission to assign badges to other users via "User Profile" -> "Assign Badges" or to increase/decrease the count of a badge on the Badge Reports Component',
    ),
  ]),
  makeCategory('Project Management', 'Category for all permissions related to projects', [
    makePerm(
      'Add Project',
      'postProject',
      'Gives the user permission to create any Project. "Other Links" -> "Projects" -> "Add new Project Input"',
    ),
    makePerm(
      'Delete Project',
      'deleteProject',
      'Gives the user permission to delete any Project. "Other Links" -> "Projects" -> "Delete button"',
    ),
    makePerm(
      'Edit Project Category or Status',
      'putProject',
      'Gives the user permission to edit the category or the status of any Project. "Other Links" -> "Projects"',
    ),
    makePerm(
      'See User in Project',
      'getProjectMembers',
      'Gives the user permission to access the profile of any user directly from the projects members page. "Other Links" -> "Projects" -> "Members"',
    ),
    makePerm(
      'Assign Project to Users',
      'assignProjectToUsers',
      'Gives the user permission to add/remove any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Find user input"',
    ),
    makeCategory(
      'Work Breakdown Structures',
      'Category for all permissions related to work breakdown structures',
      [
        makePerm(
          'Add WBS',
          'postWbs',
          'Gives the user permission to create a new WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Add new WBS Input"',
        ),
        makePerm(
          'Delete WBS',
          'deleteWbs',
          'Gives the user permission to delete any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Minus Red Icon"',
        ),
        makeCategory('Tasks', 'Category for all permissions related to tasks', [
          makePerm(
            'Add Task',
            'postTask',
            'Gives the user permission to add a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Add task button"',
          ),
          makePerm(
            'Edit Task',
            'updateTask',
            'Gives the user permission to edit a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Edit"',
          ),
          makePerm(
            'Delete Task',
            'deleteTask',
            'Gives the user permission to delete a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Remove"',
          ),
          makePerm(
            'Resolve Tasks',
            'resolveTask',
            'Gives the user permission to RESOLVE tasks from the Management Dashboard showing all their team members.',
          ),
          makePerm(
            'Suggest Changes on a task',
            'suggestTask',
            'Gives the user permission to suggest changes on a task. "Dashboard" -> "Tasks tab" -> "Click on any task" -> "Suggest button"',
          ),
          makePerm(
            'Unassign Team Members from Tasks',
            'removeUserFromTask',
            'Gives the user permission to UNASSIGN tasks from only their TEAM members through the Dashboard -> task -> red X.',
          ),
          makePerm(
            'Interact with Task "Ready for Review"',
            'putReviewStatus',
            'Give the user permission to interact with any "Ready for Review" task button to either mark it as complete or reset it with "More work needed, reset this button"',
          ),
          makePerm(
            'View and Interact with Task "X" on Dashboards',
            'canDeleteTask',
            'Gives the user permission to DELETE tasks from the Management Dashboard showing all their team members.',
          ),
          makePerm(
            'Unassign Team Members from Tasks',
            'deleteDashboardTask',
            'Gives the user permission to UNASSIGN tasks from only their TEAM members through the Dashboard -> task -> red X.',
          ),
        ]),
      ],
    ),
  ]),
  makeCategory('Teams Management', 'Category for all permissions related to team management', [
    makePerm('Edit Team', 'putTeam', 'Gives the user permission to Edit a team.'),
    makePerm('Delete Team', 'deleteTeam', 'Gives the user permission to delete a team.'),
    makeCategory(
      'Create/assign teams',
      'Quality of life bundling of two permissions commonly used together',
      [
        makePerm('Create Team', 'postTeam', 'Gives the user permission to create a team.'),
        makePerm(
          'Assign Users to Team',
          'assignTeamToUsers',
          'Gives the user permission to add users to teams. "Other Links" -> "Teams" -> "Members" -> "Add Input"',
        ),
      ],
    ),
  ]),
  makeCategory('Timelog Management', 'Category for all permissions related to timelog management', [
    makePerm(
      'Toggle Tangible Time Self',
      'toggleTangibleTime',
      'Gives the user permission to toggle the Tangible check when editing their own time entry.',
    ),
    makeCategory(
      'Timelog Management (Own)',
      'Category for all permissions related to timelog management',
      [
        makePerm(
          'Delete Time Entry (Own)',
          'deleteTimeEntryOwn',
          'Gives the user permission to Delete time entry from others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Current Time Log" -> "Trash button on bottom right"',
        ),
      ],
    ),
    makeCategory(
      'Timelog Management (Others)',
      'Category for all permissions related to timelog management',
      [
        makePerm(
          'Add Time Entry (Others)',
          'postTimeEntry',
          'Gives the user permission to add Intangible time entry to others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Add Time entry to (Name of the user) yellow button". Currently not implemented.',
        ),
        makePerm(
          'Delete Time Entry (Others)',
          'deleteTimeEntryOthers',
          'Gives the user permission to Delete time entry from others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Current Time Log" -> "Trash button on bottom right"',
        ),
        makeCategory(
          'Editing Time Entries',
          'Category for all permissions related to editing timelogs',
          [
            makePerm(
              'Edit Timelog Time (Self and Others)',
              'editTimeEntryTime',
              'Gives the user permission to edit the time of any time log entry.',
            ),
            makePerm(
              'Edit Timelog Description (Self and Others)',
              'editTimeEntryDescription',
              'Gives the user permission to edit the description of any time log entry.',
            ),
            makePerm(
              'Toggle Tangible Time Others',
              'editTimeEntryToggleTangible',
              'Gives the user permission to toggle the tangible check when editing a time entry of another user.',
            ),
            makePerm(
              'Change Time Entry Date (Self and Others)',
              'editTimeEntryDate',
              'Gives the user permission to edit the date when adding an intangible time entry.',
            ),
          ],
        ),
      ],
    ),
  ]),
  makeCategory('Announcements', 'Category to communicate', [
    makePerm(
      'Send Emails',
      'sendEmails',
      'Gives the user permission to send email communications to other users.',
    ),
  ]),
  makeCategory(
    'Permissions Management',
    'Category for all permissions related to permissions management',
    [
      makePerm(
        'Add Roles',
        'postRole',
        'Gives the user permission to add new user roles with custom permissions.',
      ),
      makePerm(
        'Delete Roles',
        'deleteRole',
        'Gives the user permission to delete user roles with custom permissions.',
      ),
      makePerm(
        'Edit Roles',
        'putRole',
        'Gives the user permission to change the permissions and names of roles.',
      ),
      makePerm(
        'Edit Individual User Permissions',
        'putUserProfilePermissions',
        'Give user permission to access Permissions Management and ONLY manage individual User Permissions.',
      ),
    ],
  ),
  makeCategory('Popup Management', 'Category for all permissions related to popup management', [
    // makePerm(
    //   'Create Popups',
    //   'createPopup',
    //   'WIP'
    // ),
    makePerm('Edit Popups', 'updatePopup', 'WIP'),
    // makePerm(
    //   'Delete Popups',
    //   'deletePopup',
    //   'WIP - not implemented'
    // ),
  ]),
  makeCategory(
    'Quick Setup Functions',
    'Category for permissions related to Quick Setup functions.',
    [
      makePerm(
        'Add New Title',
        'addNewTitle',
        'Gives user permission to add new title in quick setup functions.',
      ),

      makePerm(
        'Assign Title',
        'assignTitle',
        'Gives user permission to edit existing title in quick setup functions.',
      ),

      makePerm(
        'Edit Titles',
        'editTitle',
        'Gives user permission to view existing title in quick setup functions.',
      ),
    ],
  ),
  makeCategory('Misc/Unsorted', 'Category for all permissions not related to other categories', [
    makePerm(
      'Edit Team 4-Digit Codes',
      'editTeamCode',
      'Gives the user permission to edit 4-digit team codes on profile page and weekly summaries report page.',
    ),

    makePerm(
      'See All Users in Dashboard and Leaderboard',
      'seeUsersInDashboard',
      'Lets the user see all users in the dashboard as if they were on the same team. Requires "See All Users" to function',
    ),

    makePerm(
      'Access HGN Skills Dashboard',
      'accessHgnSkillsDashboard',
      'Lets the user access the HGN skills dashboard, which provides insights into user skills and competencies.',
    ),

    makePerm(
      'Blue Square Email Management',
      'resendBlueSquareAndSummaryEmails',
      'Gives the user permission to access Blue Square Email Management and resend infringement emails and weekly summary emails.',
    ),
  ]),
  makeCategory('FAQs', 'Category for all permissions related to FAQs', [
    makePerm(
      'Manage FAQs',
      'manageFAQs',
      'Gives the user permission to add, edit, and delete FAQs.',
    ),
  ]),
  // {
  //   label: 'General',
  //   description: 'Category for all generalized permissions',
  //   subperms: [
  //     {
  //       label: 'See All Users in Dashboard and Leaderboard',
  //       key: 'seeUsersInDashboard',
  //       description:
  //         'Lets the user see all users in the dashboard as if they were on the same team. Requires "See All Users" to function',
  //     },
  //     {
  //       label: 'Edit Header Message',
  //       key: 'editHeaderMessage',
  //       description: 'Gives the user permission to edit the message displayed in the header',
  //     },
  //   ],
  // },
  // {
  //   label: 'Reports',
  //   description: 'Category for all permissions related to reports',
  //   subperms: [
  //     {
  //       label: 'See Analytics Reports',
  //       key: 'getReports',
  //       description: 'Make ONLY "Reports -> “Reports” option appear/accessible.',
  //     },
  //     {
  //       label: 'See Weekly Summaries',
  //       key: 'getWeeklySummaries',
  //       description:
  //         'Makes ONLY the "Reports" -> "Weekly Summaries Reports" option appear/accessible.',
  //     },
  //     {
  //       label: 'See/Edit PR Team Dashboard',
  //       key: 'accessPRTeamDashboard',
  //       description: 'Gives access to the PR Team dashboard, including view and edit rights.',
  //     },
  //     {
  //       label: 'Edit Total Valid Weekly Summaries',
  //       key: 'totalValidWeeklySummaries',
  //       description: 'Gives permission to edit total valid weekly summaries count under reports',
  //     },
  //     {
  //       label: 'See Highlight for Bios Eligible to be Posted',
  //       key: 'highlightEligibleBios',
  //       description:
  //         'Under "Reports" -> "Weekly Summaries Reports", make the "Bio announcement" row highlighted yellow if that user is eligible for their bio to be posted (they have at least 80 tangible hours, 60 days on the team, and still don\'t have their bio posted)',
  //     },
  //     {
  //       label: 'Toggle Request Bio',
  //       key: 'requestBio',
  //       description:
  //         'Gives the user permission to toggle the "Bio announcement" switch under "Reports" -> "Weekly Summaries Reports"',
  //     },
  //     {
  //       label: 'See Volunteer Weekly Summaries',
  //       key: 'getVolunteerWeeklySummary',
  //       description:
  //         'Makes ONLY the "Reports" -> "Volunteer Summary Reports" option appear/accessible.',
  //     },
  //     {
  //       label: 'Edit Team 4-Digit Codes',
  //       key: 'editTeamCode',
  //       description:
  //         'Gives the user permission to edit 4-digit team codes on profile page and weekly summaries report page.',
  //     },
  //     {
  //       label: 'Create, Edit and Delete Weekly Summaries Filter',
  //       key: 'manageSummariesFilters',
  //       description:
  //         'Gives the user permission to create, edit and delete the filter in weekly summaries report page.',
  //     },
  //     {
  //       label: 'See Job Analytics Reports',
  //       key: 'getJobReports',
  //       description: 'Job Analytics Reports.',
  //     },
  //   ],
  // },
  // {
  //   label: 'User Management',
  //   description: 'Category for all permissions related to user management',
  //   subperms: [
  //     {
  //       label: 'See All Users',
  //       key: 'getUserProfiles',
  //       description: 'Make the "Other Links" -> "User Management" button appear/accessible.',
  //     },
  //     {
  //       label: 'Create New Users',
  //       key: 'postUserProfile',
  //       description:
  //         'Make the "Other Links" -> "User Management" button appear/accessible and be able to ONLY create users. No editing or deleting access. ',
  //     },
  //     {
  //       label: 'Edit User Profile',
  //       key: 'putUserProfile',
  //       description:
  //         'Gives the user permission to edit all the information of any user on the user profile page.',
  //     },
  //     {
  //       label: 'Change User Status',
  //       key: 'changeUserStatus',
  //       description:
  //         'Gives the user permission to change the status of any user on the user profile page or User Management Page. "User Profile" -> "Green round button"',
  //     },
  //     {
  //       label: 'Toggle Invisibility Permission Self and Others',
  //       key: 'toggleInvisibility',
  //       description:
  //         'Gives the user permission to change the invisibility toggle for themselves and others',
  //     },
  //     {
  //       label: 'Assign Blue Squares',
  //       key: 'addInfringements',
  //       description: 'Gives the user permission to add blue squares to any user.',
  //     },
  //     {
  //       label: 'Edit Blue Squares',
  //       key: 'editInfringements',
  //       description: 'Gives the user permission to edit any blue square.',
  //     },
  //     {
  //       label: 'Delete Blue Squares',
  //       key: 'deleteInfringements',
  //       description: 'Gives the user permission to delete any blue square.',
  //     },
  //     {
  //       label: 'Modify Important User Info',
  //       key: 'putUserProfileImportantInfo',
  //       description:
  //         'Gives the user the ability to modify several protected parts of users profiles. This includes changing admin links,  weekly summary options, committed hours, role, isRehireable, email, date created, bio status, and more. It also allows to circumvent permissions related to assigning teams or projects and changing active status.',
  //     },
  //     {
  //       label: 'Edit Summary Submit Requirement (Others)',
  //       key: 'updateSummaryRequirements',
  //       description:
  //         'Gives the user permission to change the requirement to the user to submit a summary.',
  //     },
  //     {
  //       label: 'Update Password (Others)',
  //       key: 'updatePassword',
  //       description:
  //         'Gives the user permission to update the password of any user but Owner/Admin classes. ',
  //     },
  //     {
  //       label: 'Manage Time Off Requests',
  //       key: 'manageTimeOffRequests',
  //       description: 'Gives the user permission to Add/Delete/Edit Time off requests.',
  //     },

  //     {
  //       label: 'Change Rehireable Status',
  //       key: 'changeUserRehireableStatus',
  //       description: 'Gives the user permission to change the user status of rehireable or not.',
  //     },
  //     {
  //       label: 'Pause User Activity',
  //       key: 'pauseUserActivity',
  //       description:
  //         'Gives the user permission to use the "Pause" button to pause user activity on their profile page.',
  //     },
  //     {
  //       label: 'Set Final Day',
  //       key: 'setFinalDay',
  //       description: 'Gives the user permission to use the set the final working day.',
  //     },
  //     {
  //       label: 'HGN People +/- Setup',
  //       key: 'manageHGNAccessSetup',
  //       description:
  //         'Gives the user permission to access the HGN Add Access button on user profile pages to add/remove user access to GitHub, Dropbox, Slack, and Sentry.',
  //     },
  //   ],
  // },
  // {
  //   label: 'Tracking Management',
  //   description: 'Permissions for managing tracking-related activities.',
  //   subperms: [
  //     {
  //       label: 'View Tracking Overview',
  //       key: 'viewTrackingOverview',
  //       description: 'Allows user to view an overview of tracking activities for all users.',
  //     },
  //     {
  //       label: 'Issue Tracking Warnings',
  //       key: 'issueTrackingWarnings',
  //       description: 'Allows the user to issue warnings for violations of tracking activities.',
  //     },
  //     {
  //       label: 'Issue a Blue Square',
  //       key: 'issueBlueSquare',
  //       description: 'Allows the user to issue a blue square for viloations of tracking activity.',
  //     },
  //     {
  //       label: 'Delete a Warning',
  //       key: 'deleteWarning',
  //       description: 'Gives the user permission to delete existing tracking warnings.',
  //     },
  //     {
  //       label: 'Add a New Warning Tracker',
  //       key: 'addWarningTracker',
  //       description: 'Allows user to add a new warning tracker to the system.',
  //     },
  //     {
  //       label: 'Deactivate a Warning Tracker',
  //       key: 'deactivateWarningTracker',
  //       description: 'Allows user to deactivate an existing warning tracker.',
  //     },
  //     {
  //       label: 'Reactivate a Warning Tracker',
  //       key: 'reactivateWarningTracker',
  //       description: 'Allows user to reactivate an existing warning tracker.',
  //     },
  //     {
  //       label: 'Delete a Warning Tracker',
  //       key: 'deleteWarningTracker',
  //       description: 'Gives user permission to delete a warning tracker from the system.',
  //     },
  //   ],
  // },
  // {
  //   label: 'Badge Management',
  //   description: 'Category for all permissions related to badge management',
  //   subperms: [
  //     {
  //       label: 'See Badges',
  //       key: 'seeBadges',
  //       description:
  //         'Gives the user permission to view (but not change) all badges information data on the Other Links -> Badges Management page',
  //     },
  //     {
  //       label: 'Create Badges',
  //       key: 'createBadges',
  //       description:
  //         'Make the "Other Links" -> "Badge Management" button appear and then have the ability to create (but not edit or delete) badges. ',
  //     },
  //     {
  //       label: 'Edit Badge',
  //       key: 'updateBadges',
  //       description:
  //         'Gives the user permission to edit information like the name, image, etc. of an existing badge ',
  //     },
  //     {
  //       label: 'Delete Badge',
  //       key: 'deleteBadges',
  //       description:
  //         'Gives the user permission to delete a badge on "Other Links" -> "Badge Management"',
  //     },
  //     {
  //       label: 'Modify Badge Amount',
  //       key: 'modifyBadgeAmount',
  //       description:
  //         'Gives the user permission to increase or decrease the count of a badge on the Badge Reports Component',
  //     },
  //     {
  //       label: 'Assign Badges',
  //       key: 'assignBadges',
  //       description:
  //         'Gives the user permission to assign badges to others users "User Profile" -> "Assign Badges" or to increase or decrease the count of a badge on the Badge Reports Component',
  //     },
  //   ],
  // },
  // {
  //   label: 'Project Management',
  //   description: 'Category for all permissions related to projects',
  //   subperms: [
  //     {
  //       label: 'Add Project',
  //       key: 'postProject',
  //       description:
  //         'Gives the user permission to create any Project. "Other Links" -> "Projects" -> "Add new Project Input" ',
  //     },
  //     {
  //       label: 'Delete Project',
  //       key: 'deleteProject',
  //       description:
  //         'Gives the user permission to delete any Project. "Other Links" -> "Projects" -> "Delete button" ',
  //     },
  //     {
  //       label: 'Edit Project Category or Status',
  //       key: 'putProject',
  //       description:
  //         'Gives the user permission to edit the category or the status of any Project. "Other Links" -> "Projects"',
  //     },
  //     {
  //       label: 'See User in Project',
  //       key: 'getProjectMembers',
  //       description:
  //         'Gives the user permission to access the profile of any user directly from the projects members page. "Other Links" -> "Projects" -> "Members"',
  //     },
  //     {
  //       label: 'Assign Project to Users',
  //       key: 'assignProjectToUsers',
  //       description:
  //         'Gives the user permission to add/remove any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Find user input" ',
  //     },
  //     {
  //       label: 'Work Breakdown Structures',
  //       description: 'Category for all permissions related to work breakdown structures',
  //       subperms: [
  //         {
  //           label: 'Add WBS',
  //           key: 'postWbs',
  //           description:
  //             'Gives the user permission to create a new WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Add new WBS Input"',
  //         },
  //         {
  //           label: 'Delete WBS',
  //           key: 'deleteWbs',
  //           description:
  //             'Gives the user permission to delete any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Minus Red Icon"',
  //         },
  //         {
  //           label: 'Tasks',
  //           description: 'Category for all permissions related to tasks',
  //           subperms: [
  //             {
  //               label: 'Add Task',
  //               key: 'postTask',
  //               description:
  //                 'Gives the user permission to add a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Add task button"',
  //             },
  //             {
  //               label: 'Edit Task',
  //               key: 'updateTask',
  //               description:
  //                 'Gives the user permission to edit a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Edit" ',
  //             },
  //             {
  //               label: 'Delete Task',
  //               key: 'deleteTask',
  //               description:
  //                 'Gives the user permission to delete a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Remove"',
  //             },
  //             {
  //               label: 'Resolve Tasks',
  //               key: 'resolveTask',
  //               description:
  //                 'Gives the user permission to RESOLVE tasks from the Management Dashboard showing all their team members. ',
  //             },
  //             {
  //               label: 'Suggest Changes on a task',
  //               key: 'suggestTask',
  //               description:
  //                 'Gives the user permission to suggest changes on a task. "Dashboard" -> "Tasks tab" -> "Click on any task" -> "Suggest button"',
  //             },
  //             {
  //               label: 'Unassign Team Members from Tasks',
  //               key: 'removeUserFromTask',
  //               description:
  //                 'Gives the user permission to UNASSIGN tasks from only their TEAM members through the Dashboard -> task -> red X.',
  //             },
  //             {
  //               label: 'Interact with Task "Ready for Review"',
  //               key: 'putReviewStatus',
  //               description:
  //                 'Give the user permission to interact with any "Ready for Review" task button to either mark it as complete or reset it with "More work needed, reset this button" ',
  //             },
  //             {
  //               label: 'View and Interact with Task "X" on Dashboards',
  //               key: 'canDeleteTask',
  //               description:
  //                 'Gives the user permission to DELETE tasks from the Management Dashboard showing all their team members. ',
  //             },
  //             {
  //               label: 'Unassign Team Members from Tasks',
  //               key: 'deleteDashboardTask',
  //               description:
  //                 'Gives the user permission to UNASSIGN tasks from only their TEAM members through the Dashboard -> task -> red X. ',
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   label: 'Teams Management',
  //   description: 'Category for all permissions related to team management',
  //   subperms: [
  //     {
  //       label: 'Edit Team',
  //       key: 'putTeam',
  //       description: 'Gives the user permission to Edit a team.',
  //     },
  //     {
  //       label: 'Delete Team',
  //       key: 'deleteTeam',
  //       description: 'Gives the user permission to delete a team.',
  //     },
  //     {
  //       label: 'Create/assign teams',
  //       description: 'Quality of life bundling of two permissions commonly used together',
  //       subperms: [
  //         {
  //           label: 'Create Team',
  //           key: 'postTeam',
  //           description: 'Gives the user permission to create a team.',
  //         },
  //         {
  //           label: 'Assign Users to Team',
  //           key: 'assignTeamToUsers',
  //           description:
  //             'Gives the user permission to add users to teams. "Other Links" -> "Teams" -> "Members" -> "Add Input"',
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   label: 'Timelog Management',
  //   description: 'Category for all permissions related to timelog management',
  //   subperms: [
  //     {
  //       label: 'Toggle Tangible Time Self',
  //       key: 'toggleTangibleTime',
  //       description:
  //         'Gives the user permission to toggle the Tangible check when editing their own time entry.',
  //     },
  //     {
  //       label: 'Timelog Management (Own)',
  //       description: 'Category for all permissions related to timelog management',
  //       subperms: [
  //         {
  //           label: 'Delete Time Entry (Own)',
  //           key: 'deleteTimeEntryOwn',
  //           description:
  //             'Gives the user permission to Delete time entry from others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Current Time Log" -> "Trash button on bottom right"',
  //         },
  //       ],
  //     },
  //     {
  //       label: 'Timelog Management (Others)',
  //       description: 'Category for all permissions related to timelog management',
  //       subperms: [
  //         {
  //           label: 'Add Time Entry (Others)',
  //           key: 'postTimeEntry',
  //           description:
  //             'Gives the user permission to add Intangible time entry to others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Add Time entry to (Name of the user) yellow button". Currently not implemented.',
  //         },
  //         {
  //           label: 'Delete Time Entry (Others)',
  //           key: 'deleteTimeEntryOthers',
  //           description:
  //             'Gives the user permission to Delete time entry from others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Current Time Log" -> "Trash button on bottom right"',
  //         },
  //         {
  //           label: 'Editing Time Entries',
  //           description: 'Category for all permissions related to editing timelogs',
  //           subperms: [
  //             {
  //               label: 'Edit Timelog Time (Self and Others)',
  //               key: 'editTimeEntryTime',
  //               description: 'Gives the user permission to edit the time of any time log entry.',
  //             },
  //             {
  //               label: 'Edit Timelog Description (Self and Others)',
  //               key: 'editTimeEntryDescription',
  //               description:
  //                 'Gives the user permission to edit the description of any time log entry.',
  //             },
  //             {
  //               label: 'Toggle Tangible Time Others',
  //               key: 'editTimeEntryToggleTangible',
  //               description:
  //                 'Gives the user permission to toggle the tangible check when editing a time entry of another user.',
  //             },
  //             {
  //               label: 'Change Time Entry Date (Self and Others)',
  //               key: 'editTimeEntryDate',
  //               description:
  //                 'Gives the user permission to edit the date when adding an intangible time entry.',
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   label: 'Announcements',
  //   description: 'Category to communicate',
  //   subperms: [
  //     {
  //       label: 'Send Emails',
  //       key: 'sendEmails',
  //       description: 'Gives the user permission to send email communications to other users. ',
  //     },
  //   ],
  // },
  // {
  //   label: 'Permissions Management',
  //   description: 'Category for all permissions related to permissions management',
  //   subperms: [
  //     {
  //       label: 'Add Roles',
  //       key: 'postRole',
  //       description: 'Gives the user permission to add new user roles with custom permissions. ',
  //     },
  //     {
  //       label: 'Delete Roles',
  //       key: 'deleteRole',
  //       description: 'Gives the user permission to delete user roles with custom permissions. ',
  //     },
  //     {
  //       label: 'Edit Roles',
  //       key: 'putRole',
  //       description: 'Gives the user permission to change the permissions and names of roles. ',
  //     },
  //     {
  //       label: 'Edit Individual User Permissions',
  //       key: 'putUserProfilePermissions',
  //       description:
  //         'Give user permission to access Permissions Management and ONLY manage individual User Permissions.',
  //     },
  //   ],
  // },
  // {
  //   label: 'Popup Management',
  //   description: 'Category for all permissions related to popup management',
  //   subperms: [
  //     // {
  //     //   label: 'Create Popups',
  //     //   key: 'createPopup',
  //     //   description: 'WIP',
  //     // },
  //     {
  //       label: 'Edit Popups',
  //       key: 'updatePopup',
  //       description: 'WIP',
  //     },
  //     // {
  //     //   label: 'Delete Popups',
  //     //   key: 'deletePopup',
  //     //   description: 'WIP - not implemented',
  //     // },
  //   ],
  // },
  // {
  //   label: 'Quick Setup Functions',
  //   description: 'Category for permissions related to Quick Setup functions.',
  //   subperms: [
  //     {
  //       label: 'Add New Title',
  //       key: 'addNewTitle',
  //       description: 'Gives user permission to add new title in quick setup functions.',
  //     },
  //     {
  //       label: 'Assign Title',
  //       key: 'assignTitle',
  //       description: 'Gives user permission to edit existing title in quick setup functions.',
  //     },
  //     {
  //       label: 'Edit Titles',
  //       key: 'editTitle',
  //       description: 'Gives user permission to view existing title in quick setup functions.',
  //     },
  //   ],
  // },
  // {
  //   label: 'Misc/Unsorted',
  //   description: 'Category for all permissions not related to other categories',
  //   subperms: [
  //     {
  //       label: 'Edit Team 4-Digit Codes',
  //       key: 'editTeamCode',
  //       description:
  //         'Gives the user permission to edit 4-digit team codes on profile page and weekly summaries report page.',
  //     },
  //     {
  //       label: 'See All Users in Dashboard and Leaderboard',
  //       key: 'seeUsersInDashboard',
  //       description:
  //         'Lets the user see all users in the dashboard as if they were on the same team. Requires "See All Users" to function',
  //     },
  //     {
  //       label: 'Access HGN Skills Dashboard',
  //       key: 'accessHgnSkillsDashboard',
  //       description:
  //         'Lets the user access the HGN skills dashboard, which provides insights into user skills and competencies.',
  //     },
  //     {
  //       label: 'Blue Square Email Management',
  //       key: 'resendBlueSquareAndSummaryEmails',
  //       description:
  //         'Gives the user permission to access Blue Square Email Management and resend infringement emails and weekly summary emails.',
  //     },
  //   ],
  // },
  // {
  //   label: 'FAQs',
  //   description: 'Category for all permissions related to FAQs',
  //   subperms: [
  //     {
  //       label: 'Manage FAQs',
  //       key: 'manageFAQs',
  //       description: 'Gives the user permission to add, edit, and delete FAQs.',
  //     },
  //   ],
  // },
];

export const permissionLabelKeyMappingObj = generatePermissionLabelKeyMapping(permissionLabels, 0);

export const roleOperationLabels = [
  {
    label: 'Save',
    key: 'save',
    description: 'Save current changes',
  },
  {
    label: 'Delete',
    key: 'delete',
    description: 'Delete the role',
  },
];

// returns an array of all the keys for permissions
export const getAllPermissionKeys = () => {
  return getAllSubpermissionKeys(permissionLabels);
};

export default permissionLabels;
