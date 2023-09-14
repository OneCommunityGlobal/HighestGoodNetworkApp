import React, { useEffect } from 'react';
import RolePermissions from './RolePermissions';
import { connect } from 'react-redux';
import './UserRoleTab.css';
import { getUserProfile } from 'actions/userProfile';
import { useHistory } from 'react-router-dom';
import { boxStyle } from 'styles';

export const permissionLabel = {
  // Reports
  seeAllReports: 'See All the Reports Tab (DNE)',
  getWeeklySummaries: 'See Weekly Summary Reports Tab',
  // User Management
  seeUserManagement: 'See User Management Tab (Full Functionality) (DNE)',
  seeUserManagementTab: 'See User Management Tab (ONLY create Users) (DNE - postUserProfile)',
  // Badges
  seeBadgeManagement: 'See Badge Management Tab (Full Functionality) (DNE)',
  seeBadges: 'See Badges',
  createBadges: 'Create Badges',
  deleteBadges: 'Delete Badges',
  updateBadges: 'Update Badges',
  modifyOwnBadgeAmount: 'Modify Badge Amount (DNE - assignBadges)',
  assignBadges: 'Assign Badges',
  // Projects
  seeProjectManagement: 'See Project Management Tab (Full Functionality) (DNE)',
  postProject: 'Add Project',
  deleteProject: 'Delete Project',
  putProject: 'Edit Project',
  seeUserProfileInProjects: 'See User Profiles in Projects (DNE)',
  findUserInProject: 'Find User in Project (DNE)',
  assignProjectToUsers: 'Assign Project to User',
  unassignUserInProject: 'Unassign User in Project (DNE - same as assigning)',
  // WBS
  postWbs: 'Add WBS',
  deleteWbs: 'Delete WBS',
  // Tasks
  postTask: 'Add Task',
  updateTask: 'Edit Task',
  deleteTask: 'Delete Task',
  suggestTask: 'Suggest Changes on a task',
  viewInteractTask: 'View and Interact with Task (DNE)',
  importTask: 'Import Task (???)',
  swapTask: 'Swap Task (???)',
  updateNum: 'updateNum (something related to tasks???)',
  // Teams
  seeTeamsManagement: 'See Teams Management Tab (Full Functionality) (DNE)',
  postTeam: 'Create Team',
  deleteTeam: 'Delete Team',
  putTeam: 'Edit Team',
  assignTeamToUsers: 'Assign Team to User',
  // Time Entries
  editTimelogInfo: 'Edit Timelog Information (DNE)',
  addTimeEntryOthers: 'Add Time Entry (Others) (DNE)',
  deleteTimeEntryOthers: 'Delete Time Entry (Others) (DNE)',
  toggleTangibleTime: 'Toggle Tangible Time (DNE)',
  changeIntangibleTimeEntryDate: 'Change Date on Intangible Time Entry (DNE)',
  editTimeEntry: 'Edit Time Entry (Others)',
  deleteTimeEntry: 'Delete Time Entry (Others)',
  // More User Profiles
  putUserProfile: 'Edit User Profile',
  changeUserStatus: 'Change User Status',
  infringementAuthorizer: 'Handle Blue Squares (and assign)',
  assignOnlyBlueSquares: 'Only Assign Blue Squares (DNE - infringementAuthorizer)',
  adminLinks: 'Manage Admin Links in User Profile (DNE - putUserProfileImportantInfo)',
  assignTeam: "Assign User's Team (exists elsewhere)",
  updatePassword: 'Reset Password (Others)',
  toggleSubmitForm: 'Toggle Summary Submit Form (Others) (DNE - putUserProfileImportantInfo)',
  submitWeeklySummaryForOthers: 'Submit Weekly Summary For Others  (DNE - putUserProfile)',
  seePermissionsManagement: 'See Permissions Management Tab (DNE - postRole/putRole)',
  putUserProfilePermissions: 'Manage User Permissions',
  postRole: 'Add New User Permissions Role',
  putRole: 'Edit Role Permissions',
  changeBioAnnouncement: 'Change the Bio Announcement Status (DNE)',
  // Misc
  removeUserFromTask: 'View and Interact with Task “X” (DNE)',
  seeSummaryIndicator: 'See Summary Indicator (DNE)',
  seeVisibilityIcon: 'See Visibility Icon (DNE)',
  editWeeklySummaryOptions: 'Edit Weekly Summary Options (DNE)',
  // Popups
  seePopupManagement: 'See Popup Management Tab (create and update popups) (DNE - separate)',
  createPopup: 'Create Popups',
  updatePopup: 'Edit Popups',
  dataIsTangibleTimelog: 'Timelog Data is Tangible (DNE)',
  // General
  getUserProfiles: 'Get User Profiles',
  checkLeadTeamOfXplus: 'checkLeadTeamOfXplus(???)',
  getTimeZoneAPIKey: 'Get Time Zone API Key',

};

const UserRoleTab = props => {
  useEffect(() => {
    props.getUserRole(props.auth?.user.userid);
    const mode = localStorage.getItem('mode');
    document.body.className = mode
  }, []);
  const history = useHistory();

  const roleNames = props.roles.map(role => role.roleName);
  const userRoleParamsURL = props.match.params.userRole;
  const roleIndex = roleNames.findIndex(
    roleName => roleName.toLowerCase() === userRoleParamsURL.replace('-', ' '),
  );

  if (roleIndex === -1) {
    return (
      <div className="userRoleTab__container">
        <h1>Error</h1>
        <div>User Role not existent</div>
        <a href="/permissionsmanagement">Back to permissions management</a>
      </div>
    );
  }

  const actualRole = props.roles[roleIndex];
  const permissions = actualRole.permissions;
  const roleName = actualRole.roleName;
  const roleId = actualRole._id;

  const permissionsList = [];

  for (const key in permissionLabel) {
    permissionsList.push(permissionLabel[key]);
  }
  return (
    <div className="userRoleTab__container">
      <button
        onClick={() => history.push('/permissionsmanagement')}
        className="userRoleTab__backBtn"
        style={boxStyle}
      >
        Back
      </button>
      <RolePermissions
        userRole={props.userProfile.role}
        role={roleName}
        roleId={roleId}
        header={`${roleName} Permissions:`}
        permissionsList={permissionsList}
        permissions={permissions}
      />
    </div>
  );
};

// export default UserRoleTab;
const mapStateToProps = state => ({
  roles: state.role.roles,
  auth: state.auth,
  userProfile: state.userProfile,
});

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  getUserRole: id => dispatch(getUserProfile(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserRoleTab);
