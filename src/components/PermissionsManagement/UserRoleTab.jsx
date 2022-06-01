import React from 'react';
import RolePermissions from './RolePermissions';
import { Button } from 'reactstrap';

export const permissionLabel = {
  'seeWeeklySummaryReports': 'See Weekly Summary Reports Tab',
  'seeUserManagement': 'See User Management Tab',
  'seeBadgeManagement': 'See Badge Management Tab',
  'seePopupManagement': 'See Popup Management Tab',
  'seeProjectManagement': 'See Project Management Tab',
  'seeTeamsManagement': 'See Teams Management Tab',
  'deleteOwnBadge': 'Delete Badge',
  'modifyOwnBadgeAmount': 'Modify Badge Amount',
  'assignBadgeOthers': 'Assign Badges',
  'editTimelogInfo': 'Edit Timelog Information',
  'addTimeEntryOthers': 'Add Time Entry (Others)',
  'deleteTimeEntryOthers': 'Delete Time Entry (Others)',
  'toggleTangibleTime': 'Toggle Tangible Time',
  'changeIntangibleTimeEntryDate': 'Change Date on Intangible Time Entry',
  'editTimeEntry': 'Edit Time Entry',
  'deleteTimeEntry': 'Delete Time Entry',
  'deleteWbs': 'Delete WBS',
  'addTask': 'Add Task',
  'deleteTask': 'Delete Task',
  'editTask': 'Edit Task',
  'addWbs': 'Add WBS',
  'addProject': 'Add Project',
  'deleteProject': 'Delete Project',
  'editProject': 'Edit Project',
  'findUserInProject': 'Find User in Project',
  'assignUserInProject': 'Assign User in Project',
  'unassignUserInProject': 'Unassign User in Project',
  'changeUserStatus': 'Change User Status',
  'adminLinks': 'Manage Admin Links in User Profile',
  'editUserProfile': 'Edit User Profile',
  'assignTeamToUser': 'Assign Team to User',
  'seeUserProfileInProjects': 'See User Profiles in Projects',
  'createTeam': 'Create Team',
  'editDeleteTeam': 'Edit/Delete Team',
  'handleBlueSquare': 'Handle Blue Squares',
  'resetPasswordOthers': 'Reset Password (Others)',
  'dataIsTangibleTimelog': 'Timelog Data is Tangible',
  'toggleSubmitForm': 'Toggle Summary Submit Form (Others)',
  'assignOnlyBlueSquares': 'Only Assign Blue Squares',
  'seePermissionsManagement': 'See Permissions Management Tab'
}

const UserRoleTab = (props) => {
  let role;
  switch(props.match.params.userRole){
    case 'admin':
      role = 'Administrator';
      break;
    case 'coreteam':
      role = 'Core Team';
      break;
    case 'manager':
      role = 'Manager';
      break;
    case 'mentor':
      role = 'Mentor';
      break;
    case 'owner':
      role = 'Owner';
      break;
    case 'volunteer':
      role = 'Volunteer';
      break;
    default: 
      role ='not existent';
  }

  if(role === 'not existent'){
    return (
      <>
        <h1>Error</h1>
        <div>User Role not existent</div>
        <a href='/permissionsmanagement'>Back to permissions management</a>
      </>
      
    );
  }

  const permissionsList = [];

  for(const key in permissionLabel){
      permissionsList.push(permissionLabel[key]);
  }
  
  return (
    <>
      <a href='/permissionsmanagement'>Back to permissions management</a>
      
      <RolePermissions 
        role={role}
        header={`${role} Permissions (Total):`}
        permissionsList={permissionsList}
      />

      <Button className="mr-1" color="primary">
        Save
      </Button>
    </>
  );
}

export default UserRoleTab;