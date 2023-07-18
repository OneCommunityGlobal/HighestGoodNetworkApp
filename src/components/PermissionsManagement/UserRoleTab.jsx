import React, { useEffect } from 'react';
import RolePermissions from './RolePermissions';
import { connect } from 'react-redux';
import './UserRoleTab.css';
import { getUserProfile } from 'actions/userProfile';
import { useHistory } from 'react-router-dom';

export const permissionLabel = {
  seeWeeklySummaryReports: 'See Weekly Summary Reports Tab',
  seeUserManagement: 'See User Management Tab (delete and update users)',
  seeBadgeManagement: 'See Badge Management Tab (create badges)',
  deleteOwnBadge: 'Delete Badge',
  modifyOwnBadgeAmount: 'Modify Badge Amount',
  assignBadgeOthers: 'Assign Badges',
  seePopupManagement: 'See Popup Management Tab (create and update popups)',
  seeProjectManagement: 'See Project Management Tab',
  deleteWbs: 'Delete WBS',
  addTask: 'Add Task',
  deleteTask: 'Delete Task',
  editTask: 'Edit Task',
  suggestTask: 'Suggest Changes on a task',
  addWbs: 'Add WBS',
  addProject: 'Add Project',
  deleteProject: 'Delete Project',
  editProject: 'Edit Project',
  findUserInProject: 'Find User in Project',
  assignUserInProject: 'Assign User in Project',
  unassignUserInProject: 'Unassign User in Project',
  seeTeamsManagement: 'See Teams Management Tab',
  editDeleteTeam: 'Edit/Delete Team',
  createTeam: 'Create Team',
  assignTeamToUser: 'Assign Team to User',
  editTimelogInfo: 'Edit Timelog Information',
  addTimeEntryOthers: 'Add Time Entry (Others)',
  deleteTimeEntryOthers: 'Delete Time Entry (Others)',
  toggleTangibleTime: 'Toggle Tangible Time',
  changeIntangibleTimeEntryDate: 'Change Date on Intangible Time Entry',
  editTimeEntry: 'Edit Time Entry',
  deleteTimeEntry: 'Delete Time Entry',
  changeUserStatus: 'Change User Status',
  adminLinks: 'Manage Admin Links in User Profile',
  editUserProfile: 'Edit User Profile',
  seeUserProfileInProjects: 'See User Profiles in Projects',
  resetPasswordOthers: 'Reset Password (Others)',
  dataIsTangibleTimelog: 'Timelog Data is Tangible',
  toggleSubmitForm: 'Toggle Summary Submit Form (Others)',
  handleBlueSquare: 'Handle Blue Squares',
  assignOnlyBlueSquares: 'Only Assign Blue Squares',
  seePermissionsManagement: 'See Permissions Management Tab',
  submitWeeklySummaryForOthers: 'Submit Weekly Summary For Others',
  changeBioAnnouncement: 'Change the Bio Announcement Status',
  seeAllReports: 'See All the Reports Tab',
  removeUserFromTask: 'View and Interact with Task “X”',
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
