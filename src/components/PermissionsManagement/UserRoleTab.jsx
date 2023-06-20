import React, { useEffect } from 'react';
import RolePermissions from './RolePermissions';
import { connect } from 'react-redux';
import './UserRoleTab.css';
import { getUserProfile } from 'actions/userProfile';
import { useHistory } from 'react-router-dom';

export const permissionLabel = {
  // Badges
  createBadges: 'See Badge Management Tab (create badges)',
  deleteBadges: 'Delete Badge',
  modifyOwnBadgeAmount: 'Modify Badge Amount',
  assignBadges: 'Assign Badges',
  // Popups
  createPopup: 'See Popup Management Tab (create popups)',
  updatePopup: 'See Popup Management Tab (update popups)',
  // WBS
  deleteWbs: 'Delete WBS',
  postWbs: 'Add WBS',
  // Tasks
  postTask: 'Add Task',
  deleteTask: 'Delete Task',
  updateTask: 'Edit Task',
  suggestTask: 'Suggest Changes on a task',
  // Projects
  postProject: 'Add Project',
  deleteProject: 'Delete Project',
  putProject: 'Edit Project',
  getProjectMembers: 'Find User in Project',
  assignProjectToUsers: 'Assign User in Project',
  assignProjectToUsers: 'Unassign User in Project',
  // Teams
  putTeam: 'Edit Team',
  deleteTeam: 'Delete Team',
  postTeam: 'Create Team',
  assignTeamToUsers: 'Assign Team to User',
  // Time Entries
  editTimeEntry: 'Edit Timelog Information',
  addTimeEntryOthers: 'Add Time Entry (Others)',
  deleteTimeEntry: 'Delete Time Entry (Others)',
  editTimeEntry: 'Toggle Tangible Time',
  editTimeEntry: 'Change Date on Intangible Time Entry',
  editTimeEntry: 'Edit Time Entry',
  deleteTimeEntry: 'Delete Time Entry',
  // User Management
  postUserProfile: 'See User Management Tab (create users)',
  deleteUserProfile: 'See User Management Tab (delete users)',
  changeUserStatus: 'Change User Status',
  adminLinks: 'Manage Admin Links in User Profile',
  putUserProfile: 'Edit User Profile',
  getUserProfiles: 'See User Profiles in Projects',
  updatePassword: 'Reset Password (Others)',
  toggleSubmitForm: 'Toggle Summary Submit Form (Others)',
  putUserProfileImportantInfo: 'Handle Blue Squares',
  infringementAuthorizer: 'Only Assign Blue Squares',
  submitWeeklySummaryForOthers: 'Submit Weekly Summary For Others',
  // Misc
  dataIsTangibleTimelog: 'Timelog Data is Tangible',
  getWeeklySummaries: 'See Weekly Summary Reports Tab',
  seePermissionsManagement: 'See Permissions Management Tab',
  changeBioAnnouncement: 'Change the Bio Announcement Status',
  getWeeklySummaries: 'See All the Reports Tab',
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
