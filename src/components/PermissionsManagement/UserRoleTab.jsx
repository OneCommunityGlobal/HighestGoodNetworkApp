import React, { useEffect } from 'react';
import RolePermissions from './RolePermissions';
import { connect } from 'react-redux';
import './UserRoleTab.css';
import { getUserProfile } from 'actions/userProfile';
import { useHistory } from 'react-router-dom';
import { boxStyle } from 'styles';

export const permissionLabel = {
  seeAllReports: 'See All the Reports Tab',
  seeWeeklySummaryReports: 'See Weekly Summary Reports Tab',
  seeUserManagement: 'See User Management Tab (Full Functionality)',
  seeUserManagementTab: 'See User Management Tab (ONLY create Users)',
  seeBadgeManagement: 'See Badge Management Tab (Full Functionality)',
  deleteOwnBadge: 'Delete Badge',
  modifyOwnBadgeAmount: 'Modify Badge Amount',
  assignBadgeOthers: 'Assign Badges',
  seeProjectManagement: 'See Project Management Tab (Full Functionality)',
  addProject: 'Add Project',
  deleteProject: 'Delete Project',
  editProject: 'Edit Project',
  seeUserProfileInProjects: 'See User Profiles in Projects',
  findUserInProject: 'Find User in Project',
  assignUserInProject: 'Assign User in Project',
  unassignUserInProject: 'Unassign User in Project',
  addWbs: 'Add WBS',
  deleteWbs: 'Delete WBS',
  addTask: 'Add Task',
  editTask: 'Edit Task',
  deleteTask: 'Delete Task',
  suggestTask: 'Suggest Changes on a task',
  viewInteractTask: 'View and Interact with Task',
  seeTeamsManagement: 'See Teams Management Tab (Full Functionality)',
  createTeam: 'Create Team',
  editDeleteTeam: 'Edit/Delete Team',
  assignTeamToUser: 'Assign Team to User',
  editTimelogInfo: 'Edit Timelog Information',
  addTimeEntryOthers: 'Add Time Entry (Others)',
  deleteTimeEntryOthers: 'Delete Time Entry (Others)',
  toggleTangibleTime: 'Toggle Tangible Time',
  changeIntangibleTimeEntryDate: 'Change Date on Intangible Time Entry',
  editTimeEntry: 'Edit Own Time Entry',
  deleteTimeEntry: 'Delete Own Time Entry',
  editUserProfile: 'Edit User Profile',
  changeUserStatus: 'Change User Status',
  handleBlueSquare: 'Handle Blue Squares',
  assignOnlyBlueSquares: 'Only Assign Blue Squares',
  adminLinks: 'Manage Admin Links in User Profile',
  assignTeam: "Assign User's Team",
  resetPasswordOthers: 'Reset Password (Others)',
  toggleSubmitForm: 'Toggle Summary Submit Form (Others)',
  submitWeeklySummaryForOthers: 'Submit Weekly Summary For Others',
  seePermissionsManagement: 'See Permissions Management Tab',
  manageUser: 'Manage User Permissions',
  addPermissionRole: 'Add New User Permissions Role',
  changeBioAnnouncement: 'Change the Bio Announcement Status',
  removeUserFromTask: 'View and Interact with Task “X”',
  seeSummaryIndicator: 'See Summary Indicator',
  seeVisibilityIcon: 'See Visibility Icon',
  editWeeklySummaryOptions: 'Edit Weekly Summary Options',
  seePopupManagement: 'See Popup Management Tab (create and update popups)',
  dataIsTangibleTimelog: 'Timelog Data is Tangible',

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
