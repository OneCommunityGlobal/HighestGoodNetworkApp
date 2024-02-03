export const permissionLabels = [
  {
    label: 'Reports',
    description: 'Category for all permissions related to reports',
    subperms: [
      {
        label: 'See Analytics Reports',
        key: 'getReports',
        description: 'Make ONLY "Reports -> “Reports” option appear/accessible.',
      },
      {
        label: 'See Weekly Summaries',
        key: 'getWeeklySummaries',
        description: 'Makes ONLY the "Reports" -> "Weekly Summaries Reports" option appear/accessible.',
      },
      {
        label: 'See Highlight for Bios Eligible to be Posted',
        key: 'highlightEligibleBios',
        description: 'Under "Reports" -> "Weekly Summaries Reports", make the "Bio announcement" row highlighted yellow if that user is eligible for their bio to be posted (they have at least 80 tangible hours, 60 days on the team, and still don\'t have their bio posted)',
      },
    ]
  },
  {
    label: 'User Management',
    description: 'Category for all permissions related to user management',
    subperms: [
      {
        label: 'See All Users',
        key: 'getUserProfiles',
        description: 'Make the "Other Links" -> "User Management" button appear/accessible.',
      },
      {
        label: 'Create New Users',
        key: 'postUserProfile',
        description: 'Make the "Other Links" -> "User Management" button appear/accessible and be able to ONLY create users. No editing or deleting access. ',
      },
      {
        label: 'Edit User Profile',
        key: 'putUserProfile',
        description: 'Gives the user permission to edit all the information of any user on the user profile page.',
      },
      {
        label: 'Change User Status',
        key: 'changeUserStatus',
        description: 'Gives the user permission to change the status of any user on the user profile page or User Management Page. "User Profile" -> "Green round button"',
      },
      {
        label: 'Handle Blue Squares',
        key: 'infringementAuthorizer',
        description: 'Gives the user permission to Create/Edit/Delete any blue square and assign them to any user.',
      },
      {
        label: 'Modify Important User Info',
        key: 'putUserProfileImportantInfo',
        description: 'Gives the user the ability to modify several protected parts of users profiles. This includes changing admin links,  weekly summary options, committed hours, role, isRehireable, email, date created, bio status, and more. It also allows to circumvent permissions related to assigning teams or projects and changing active status.',
      },
      {
        label: 'Manage Time Off Requests',
        key: 'manageTimeOffRequests',
        description: 'Gives the user permission to Add/Delete/Edit Time off requests.',
      },
    ]
  },
  {
    label: 'Badge Management',
    description: 'Category for all permissions related to badge management',
    subperms: [
      {
        label: 'See Badges',
        key: 'seeBadges',
        description: 'Gives the user permission to view (but not change) all badges information data on the Other Links -> Badges Management page',
      },
      {
        label: 'Create Badges',
        key: 'createBadges',
        description: 'Make the "Other Links" -> "Badge Management" button appear and then have the ability to create (but not edit or delete) badges. ',
      },
      {
        label: 'Edit Badge',
        key: 'updateBadges',
        description: 'Gives the user permission to edit information like the name, image, etc. of an existing badge ',
      },
      {
        label: 'Delete Badge',
        key: 'deleteBadges',
        description: 'Gives the user permission to delete a badge on "Other Links" -> "Badge Management"',
      },
      {
        label: 'Assign Badges',
        key: 'assignBadges',
        description: 'Gives the user permission to assign badges to others users "User Profile" -> "Assign Badges" or to increase or decrease the count of a badge on the Badge Reports Component',
      },]
  },
  {
    label: 'Project Management',
    description: 'Category for all permissions related to projects',
    subperms: [
      {
        label: 'Add Project',
        key: 'postProject',
        description: 'Gives the user permission to create any Project. "Other Links" -> "Projects" -> "Add new Project Input" ',
      },
      {
        label: 'Delete Project',
        key: 'deleteProject',
        description: 'Gives the user permission to delete any Project. "Other Links" -> "Projects" -> "Delete button" ',
      },
      {
        label: 'Edit Project Category or Status',
        key: 'putProject',
        description: 'Gives the user permission to edit the category or the status of any Project. "Other Links" -> "Projects"',
      },
      {
        label: 'Find User in Project',
        key: 'getProjectMembers',
        description: 'Gives the user permission to find any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Find user input" ',
      },
      {
        label: 'Assign Project to Users',
        key: 'assignProjectToUsers',
        description: 'Gives the user permission to add/remove any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Find user input" ',
      },
      {
        label: 'Work Breakdown Structures',
        description: 'Category for all permissions related to work breakdown structures',
        subperms: [
          {
            label: 'Add WBS',
            key: 'postWbs',
            description: 'Gives the user permission to create a new WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Add new WBS Input"',
          },
          {
            label: 'Delete WBS',
            key: 'deleteWbs',
            description: 'Gives the user permission to delete any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Minus Red Icon"',
          },
          {
            label: 'Tasks',
            description: 'Category for all permissions related to tasks',
            subperms: [
              {
                label: 'Add Task',
                key: 'postTask',
                description: 'Gives the user permission to add a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Add task button"',
              },
              {
                label: 'Edit Task',
                key: 'updateTask',
                description: 'Gives the user permission to edit a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Edit" ',
              },
              {
                label: 'Delete Task',
                key: 'deleteTask',
                description: 'Gives the user permission to delete a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Remove"',
              },
              {
                label: 'Resolve Tasks',
                key: 'resolveTask',
                description: 'Gives the user permission to RESOLVE tasks from the Management Dashboard showing all their team members. ',
              },
              {
                label: 'Suggest Changes on a task',
                key: 'suggestTask',
                description: 'Gives the user permission to suggest changes on a task. "Dashboard" -> "Tasks tab" -> "Click on any task" -> "Suggest button"',
              },
              {
                label: 'Interact with Task "Ready for Review"',
                key: 'putReviewStatus',
                description: 'Give the user permission to interact with any "Ready for Review" task button to either mark it as complete or reset it with "More work needed, reset this button" ',
              }
            ],
          },
        ],
      },
    ]
  },
  {
    label: 'Teams Management',
    description: 'Category for all permissions related to team management',
    subperms: [
      {
        label: 'See Teams Management Tab',
        key: 'seeTeams',
        description: 'Make the "Other Links" -> "Teams" button appear',
      },
      {
        label: 'Create Team',
        key: 'postTeam',
        description: 'Gives the user permission to create a team.',
      },
      {
        label: 'Edit Team',
        key: 'putTeam',
        description: 'Gives the user permission to Edit a team.',
      },
      {
        label: 'Delete Team',
        key: 'deleteTeam',
        description: 'Gives the user permission to delete a team.',
      },
      {
        label: 'Assign Users to Team',
        key: 'assignTeamToUsers',
        description: 'Gives the user permission to add users to teams. "Other Links" -> "Teams" -> "Members" -> "Add Input"',
      },
    ]
  },
  {
    label: 'Timelog Management',
    description: 'Category for all permissions related to timelog management',
    subperms: [
      {
        label: 'Timelog Management (Others)',
        description: 'Category for all permissions related to timelog management',
        subperms: [
          {
            label: 'Add Time Entry (Others)',
            key: 'postTimeEntry',
            description: 'Gives the user permission to add Intangible time entry to others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Add Time entry to (Name of the user) yellow button". Currently not implemented.',
          },
          {
            label: 'Toggle Tangible Time Self',
            key: 'toggleTangibleTime',
            description: 'Gives the user permission to toggle the Tangible check when editing their own time entry.',
          },
          {
            label: 'Delete Time Entry (Others)',
            key: 'deleteTimeEntry',
            description: 'Gives the user permission to Delete time entry from others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Current Time Log" -> "Trash button on bottom right"',
          },
          {
            label: 'Edit Time Entries',
            description: 'Category for all permissions related to timelog management',
            subperms: [
              {
                label: 'Edit Timelog Time',
                key: 'editTimeEntry',
                description: 'Gives the user permission to edit the time of any time log entry.',
              },
              {
                label: 'Edit Timelog Description',
                key: 'editTimeEntry',
                description: 'Gives the user permission to edit the description of any time log entry.',
              },
              {
                label: 'Toggle Tangible Time Others',
                key: 'editTimeEntry',
                description: 'Gives the user permission to toggle the tangible check when editing a time entry of another user.',
              },
              {
                label: 'Change Time Entry Date',
                key: 'editTimelogDate',
                description: 'Gives the user permission to edit the date when adding an intangible time entry.',
              },
            ]
          }
        ]
      }
    ]
  },
  {
    label: 'Permissions Management',
    description: 'Category for all permissions related to permissions management',
    subperms: [
      {
        label: 'Add Roles',
        key: 'postRole',
        description: 'Gives the user permission to add new user roles with custom permissions. ',
      },
      {
        label: 'Delete Roles',
        key: 'deleteRole',
        description: 'Gives the user permission to delete user roles with custom permissions. ',
      },
      {
        label: 'Edit Roles',
        key: 'putRole',
        description: 'Gives the user permission to change the permissions and names of roles. ',
      },
      {
        label: 'Edit Individual User Permissions',
        key: 'putUserProfilePermissions',
        description: 'Give user permission to access Permissions Management and ONLY manage individual User Permissions.',
      },
    ]
  },
  {
    label: 'Popup Management',
    description: 'Category for all permissions related to popup management',
    subperms: [
      // {
      //   label: 'Create Popups',
      //   key: 'createPopup',
      //   description: 'WIP',
      // },
      {
        label: 'Edit Popups',
        key: 'updatePopup',
        description: 'WIP',
      },
      // {
      //   label: 'Delete Popups',
      //   key: 'deletePopup',
      //   description: 'WIP - not implemented',
      // },
    ]
  },
  {
    label: 'Misc/Unsorted',
    description: 'Category for all permissions not related to other categories',
    subperms: [
      {
        label: 'Edit Team 4-Digit Codes',
        key: 'editTeamCode',
        description: 'Gives the user permission to edit 4-digit team codes on profile page and weekly summaries report page.',
      },
    ]
  },
];

export default permissionLabels;
