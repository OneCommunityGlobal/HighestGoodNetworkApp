import React, { useEffect } from 'react';
import RolePermissions from './RolePermissions';
import { connect } from 'react-redux';
import './UserRoleTab.css';
import { getUserProfile } from 'actions/userProfile';
import { useHistory } from 'react-router-dom';

export const permissionLabel = {
  // Summaries
  getWeeklySummaries: 'See Weekly Summary Reports Tab',
  // Projects
  postProject: 'Add Project',
  deleteProject: 'Delete Project',
  putProject: 'Edit Project',
  assignProjectToUsers: 'Assign Project to User',
  getProjectMembers: 'Get Project Members',
  // WBS
  postWbs: 'Add WBS',
  deleteWbs: 'Delete WBS',
  // Tasks
  postTask: 'Add Task',
  updateTask: 'Edit Task',
  deleteTask: 'Delete Task',
  suggestTask: 'Suggest Changes on a task',
  importTask: 'Import Task (???)',
  swapTask: 'Swap Task (???)',
  updateNum: 'updateNum (???)',
  // Teams
  postTeam: 'Create Team',
  deleteTeam: 'Delete Team',
  putTeam: 'Edit Team',
  assignTeamToUsers: 'Assign Team to User',
  // Time Entries
  editTimeEntry: 'Edit Timelog Information (Others)',
  deleteTimeEntry: 'Delete Time Entries (Others)',
  // Badges
  seeBadges: 'See Badges',
  assignBadges: 'Assign Badges',
  createBadges: 'Create Badges',
  deleteBadges: 'Delete Badges',
  updateBadges: 'Update Badges',
  // Popups
  createPopup: 'Create Popups',
  updatePopup: 'Edit Popups',
  // User Profiles
  postUserProfile: 'Create User Profile',
  putUserProfile: 'Edit User Profile',
  deleteUserProfile: 'Delete User Profile',
  putUserProfileImportantInfo: 'Edit User Profile Important Info',
  changeUserStatus: 'Change User Status',
  updatePassword: 'Update Password (Others)',
  infringementAuthorizer: 'Assign/Handle Blue Squares',
  // Permissions
  postRole: 'Add New User Permissions Role',
  putRole: 'Edit Role Permissions',
  putUserProfilePermissions: 'Manage User Specific Permissions',
  // General
  getUserProfiles: 'Get User Profiles',
  checkLeadTeamOfXplus: 'checkLeadTeamOfXplus(???)',
  getTimeZoneAPIKey: 'getTimeZoneAPIKey (???)',
};

const UserRoleTab = props => {
  useEffect(() => {
    props.getUserRole(props.auth?.user.userid);
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
