import React, { useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import { Alert, Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { boxStyle } from 'styles';
import { addNewRole, getAllRoles } from '../../actions/role';
import PermissionList from './PermissionList';

function CreateNewRolePopup({ toggle, addNewRole, roleNames }) {
  const [permissionsChecked, setPermissionsChecked] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [isValidRole, setIsValidRole] = useState(true);
  const [isNotDuplicateRole, setIsNotDuplicateRole] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const noSymbolsRegex = /^([a-zA-Z0-9 ]+)$/;

  const handleSubmit = async e => {
    e.preventDefault();

    if (newRoleName.trim() === '') {
      toast.error('Please enter a role name');
    } else if (permissionsChecked.length === 0) {
      toast.error('Please select at least one permission');
    } else if (!isValidRole) {
      toast.error('Please enter a valid role name');
    } else if (!isNotDuplicateRole) {
      toast.error('Please enter a non duplicate role name');
    } else {
      const newRoleObject = {
        roleName: newRoleName,
        permissions: permissionsChecked,
      };
      await addNewRole(newRoleObject);
      toast.success('Role created successfully');
      toggle();
    }
  };

  const handleRoleName = e => {
    const { value } = e.target;
    const regexTest = noSymbolsRegex.test(value);
    const duplicateTest = checkIfDuplicate(value);
    if (value.trim() === '') {
      setNewRoleName(value);
      setErrorMessage('Please enter a role name');
      setIsValidRole(false);
    } else if (duplicateTest) {
      setNewRoleName(value);
      setErrorMessage('Please enter a different role name');
      setIsNotDuplicateRole(false);
    } else if (regexTest) {
      setNewRoleName(value);
      setIsValidRole(true);
      setIsNotDuplicateRole(true);
    } else {
      setErrorMessage('Special character/symbols not allowed');
      setIsValidRole(false);
    }
  };

  const checkIfDuplicate = value => {
    let duplicateFound = false;

    roleNames.forEach(val => {
      if (val.localeCompare(value, 'en', { sensitivity: 'base' }) === 0) {
        duplicateFound = true;
        return true;
      }
    });
    return duplicateFound;
  };

  return (
    <Form id="createRole" onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Role Name:</Label>
        <Input
          placeholder="Please enter a new role name"
          value={newRoleName}
          onChange={handleRoleName}
        />
        {isValidRole === false || isNotDuplicateRole === false ? (
          <Alert className="createRole__alert" color="danger">
            {errorMessage}
          </Alert>
        ) : (
          <></>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Permissions:</Label>
        <PermissionList
          rolePermissions={permissionsChecked}
          editable={true}
          setPermissions={setPermissionsChecked}
        />
      </FormGroup>
      <Button type="submit" id="createRole" color="primary" size="lg" block style={boxStyle}>
        Create
      </Button>
    </Form>
  );
}

const mapStateToProps = state => ({ roles: state.role.roles });

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  addNewRole: newRole => dispatch(addNewRole(newRole)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewRolePopup);
