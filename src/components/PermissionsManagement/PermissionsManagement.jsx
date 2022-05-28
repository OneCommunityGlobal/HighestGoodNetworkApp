import React from 'react';
import { permissions } from '../../utils/permissions';

const permissionLabel = {
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
    'editProject': 'Edit Project'
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

const mapPermissionToLabel = (role) => {
    const label = [];
    permissions[role].map((permission) => {
        if(permissionLabel[permission]){
            label.push(permissionLabel[permission]);
        }
    });

    console.log(label);

    console.log('other way:', getKeyByValue(permissionLabel, 'Delete Badge'));
}

const PermissionsManagement = () => {
  return (
      <>
        <h2>Admin Permissions:</h2>
        {mapPermissionToLabel('Administrator')}
        <div>{permissions.Administrator.map(p => <p>{p}</p>)}</div>
      </>
    
  );
}

export default PermissionsManagement;