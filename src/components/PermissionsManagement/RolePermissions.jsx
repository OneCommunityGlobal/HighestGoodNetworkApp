import React, { useState } from 'react';
import { permissionLabel } from './UserRoleTab';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { updateRole, getAllRoles } from '../../actions/role';
import { toast } from 'react-toastify';
import { permissionFrontToBack } from 'utils/associatedPermissions';

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const mapPermissionToLabel = permissions => {
  const label = [];

  permissions.map(permission => {
    if (permissionLabel[permission]) {
      label.push(permissionLabel[permission]);
    }
  });

  return label;
};

function RolePermissions(props) {
  const [permissions, setPermissions] = useState(mapPermissionToLabel(props.permissions));

  const onRemovePermission = permission => {
    const newPermissions = permissions.filter(perm => perm !== permission);
    setPermissions(newPermissions);
  };

  const onAddPermission = permission => {
    setPermissions(previous => [...previous, permission]);
  };
  const updateInfo = () => {
    const permissionsObjectName = permissions.map(perm => {
      return getKeyByValue(permissionLabel, perm);
    });

    const permissionsBackEnd = permissionsObjectName.map(permission =>
      permissionFrontToBack(permission),
    );
    const updatedRole = {
      roleName: props.role,
      permissions: permissionsObjectName,
      permissionsBackEnd: permissionsBackEnd.flat(),
    };
    const id = props.roleId;
    try {
      props.updateRole(id, updatedRole);
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Error updating role');
    }
  };

  return (
    <>
      <h2>{props.header}</h2>
      <ul className="user-role-tab__permission-list">
        {props.permissionsList.map(permission => (
          <li className="user-role-tab__permission" key={permission}>
            <p style={{ color: permissions.includes(permission) ? 'green' : 'red' }}>
              {permission}
            </p>
            {permissions.includes(permission) ? (
              <Button color="danger" onClick={() => onRemovePermission(permission)}>
                Delete
              </Button>
            ) : (
              <Button color="success" onClick={() => onAddPermission(permission)}>
                Add
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Button className="mr-1" block color="primary" onClick={() => updateInfo()}>
        Save
      </Button>
    </>
  );
}

const mapStateToProps = state => ({ roles: state.role.roles });

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  updateRole: (roleId, updatedRole) => dispatch(updateRole(roleId, updatedRole)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RolePermissions);
