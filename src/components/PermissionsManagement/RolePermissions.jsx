import React from 'react';
import { permissions } from '../../utils/permissions';
import { permissionLabel } from './UserRoleTab';
import { Button } from 'reactstrap';

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const mapPermissionToLabel = role => {
  const label = [];
  permissions[role].map(permission => {
    if (permissionLabel[permission]) {
      label.push(permissionLabel[permission]);
    }
  });

  // console.log(label);

  // console.log('other way:', getKeyByValue(permissionLabel, 'Delete Badge'));

  return label;
};

function RolePermissions(props) {
  const permissions = mapPermissionToLabel(props.role);

  const permissionsCopy = permissions;

  console.log('user role permissions: ', permissionsCopy);

  const onRemovePermission = () => {
    console.log('Remove Permissions');
  };

  const onAddPermission = () => {
    console.log('Add Permissions');
  };

  return (
    <>
      <h2>{props.header}</h2>
      {props.permissionsList.map(permission => (
        <p style={{ color: permissions.includes(permission) ? 'green' : 'red' }}>
          {permission}{' '}
          {permissions.includes(permission) ? (
            <Button color="danger" onClick={onRemovePermission}>
              -
            </Button>
          ) : (
            <Button color="success" onClick={onAddPermission}>
              +
            </Button>
          )}
        </p>
      ))}
    </>
  );
}

export default RolePermissions;
