import React, { useState } from 'react';
import { permissions } from '../../utils/permissions';
import RolePermissions from './RolePermissions';

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
    'assignOnlyBlueSquares': 'Only Assign Blue Squares'
}

const PermissionsManagement = () => {  
    const permissionsList = [];

    for(const key in permissionLabel){
        permissionsList.push(permissionLabel[key]);
    }

    console.log('All permissions: ', permissionsList);

    return (
        <>
            <RolePermissions 
                role='Administrator'
                header='Admin Permissions (Total):'
                permissionsList={permissionsList}
            />
            <RolePermissions 
                role='Core Team'
                header='Core Team Permissions (Total):'
                permissionsList={permissionsList}
            />
            <RolePermissions 
                role='Manager'
                header='Manager Permissions (Total):'
                permissionsList={permissionsList}
            />
            <RolePermissions 
                role='Mentor'
                header='Mentor Permissions (Total):'
                permissionsList={permissionsList}
            />
            <RolePermissions 
                role='Volunteer'
                header='Volunteer Permissions (Total):'
                permissionsList={permissionsList}
            />
            <RolePermissions 
                role='Owner'
                header='Owner Permissions (Total):'
                permissionsList={permissionsList}
            />
        </>
        
    );
}

export default PermissionsManagement;