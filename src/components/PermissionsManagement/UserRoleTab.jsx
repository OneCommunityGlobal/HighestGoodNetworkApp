import React, { useEffect } from 'react';
import RolePermissions from './RolePermissions';
import { connect } from 'react-redux';
import './UserRoleTab.css';

export const permissionLabel = {
  seeWeeklySummaryReports: 'See Weekly Summary Reports Tab',
  seeUserManagement: 'See User Management Tab (delete and update users)',
  seeBadgeManagement: 'See Badge Management Tab (create badges)',
  seePopupManagement: 'See Popup Management Tab (create and update popups)',
  seeProjectManagement: 'See Project Management Tab',
  seeTeamsManagement: 'See Teams Management Tab',
  deleteOwnBadge: 'Delete Badge',
  modifyOwnBadgeAmount: 'Modify Badge Amount',
  assignBadgeOthers: 'Assign Badges',
  editTimelogInfo: 'Edit Timelog Information',
  addTimeEntryOthers: 'Add Time Entry (Others)',
  deleteTimeEntryOthers: 'Delete Time Entry (Others)',
  toggleTangibleTime: 'Toggle Tangible Time',
  changeIntangibleTimeEntryDate: 'Change Date on Intangible Time Entry',
  editTimeEntry: 'Edit Time Entry',
  deleteTimeEntry: 'Delete Time Entry',
  deleteWbs: 'Delete WBS',
  addTask: 'Add Task',
  deleteTask: 'Delete Task',
  editTask: 'Edit Task',
  addWbs: 'Add WBS',
  addProject: 'Add Project',
  deleteProject: 'Delete Project',
  editProject: 'Edit Project',
  findUserInProject: 'Find User in Project',
  assignUserInProject: 'Assign User in Project',
  unassignUserInProject: 'Unassign User in Project',
  changeUserStatus: 'Change User Status',
  adminLinks: 'Manage Admin Links in User Profile',
  editUserProfile: 'Edit User Profile',
  assignTeamToUser: 'Assign Team to User',
  seeUserProfileInProjects: 'See User Profiles in Projects',
  createTeam: 'Create Team',
  editDeleteTeam: 'Edit/Delete Team',
  handleBlueSquare: 'Handle Blue Squares',
  resetPasswordOthers: 'Reset Password (Others)',
  dataIsTangibleTimelog: 'Timelog Data is Tangible',
  toggleSubmitForm: 'Toggle Summary Submit Form (Others)',
  assignOnlyBlueSquares: 'Only Assign Blue Squares',
  seePermissionsManagement: 'See Permissions Management Tab',
};

const UserRoleTab = props => {
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
      <a href="/permissionsmanagement">Back to permissions management</a>

      <RolePermissions
        role={roleName}
        roleId={roleId}
        header={`${roleName} Permissions (Total):`}
        permissionsList={permissionsList}
        permissions={permissions}
      />
    </div>
  );
};

// export default UserRoleTab;
const mapStateToProps = state => ({ roles: state.role.roles });

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserRoleTab);
