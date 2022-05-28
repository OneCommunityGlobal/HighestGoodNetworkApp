import React, { useState } from 'react';
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
    'assignOnlyBlueSquares': 'Only Assign Blue Squares'
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

    return label;
}

const PermissionsManagement = () => {  
    const adminPermissions = mapPermissionToLabel('Administrator');
    const ownerPermissions = mapPermissionToLabel('Owner');
    const mentorPermissions = mapPermissionToLabel('Mentor');
    const managerPermissions = mapPermissionToLabel('Manager');
    const voluenteerPermissions = mapPermissionToLabel('Volunteer');
    const coreteamPermissions = mapPermissionToLabel('Core Team');

    return (
        <>
            <h2>Admin Permissions:</h2>
            {adminPermissions.map(permission => <p>{permission}</p>)}
            <h2>Core Team Permissions:</h2>
            {coreteamPermissions.map(permission => <p>{permission}</p>)}
            <h2>Manager Permissions:</h2>
            {managerPermissions.map(permission => <p>{permission}</p>)}
            <h2>Mentor Permissions:</h2>
            {mentorPermissions.map(permission => <p>{permission}</p>)}
            <h2>Volunteer Permissions:</h2>
            {voluenteerPermissions.map(permission => <p>{permission}</p>)}
            <h2>Owner Permissions:</h2>
            {ownerPermissions.map(permission => <p>{permission}</p>)}
        </>
        
    );
}

export default PermissionsManagement;