import React from 'react';
import { permissions } from '../../utils/permissions';
import { permissionLabel } from './PermissionsManagement';

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

function RolePermissions(props) {
    const permissions = mapPermissionToLabel(props.role);

    return (
        <>
            <h2>{props.header}</h2>
            {props.permissionsList.map(permission => (
                <p style={{color: permissions.includes(permission) ? 'green' : 'red'}}>
                    {permission} {permissions.includes(permission) ? '-' : '+'}
                </p>
            ))}
                
            
        </>
    );
}

export default RolePermissions;