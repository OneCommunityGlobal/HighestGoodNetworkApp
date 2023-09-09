import { useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import { Alert, Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { boxStyle } from 'styles';
import { addNewRole, getAllRoles } from '../../actions/role';
import { permissionLabel } from './RolePermissions';

function CreateNewRolePopup({ toggle }) {
  const [permissionsChecked, setPermissionsChecked] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [isValidRole, setIsValidRole] = useState(true);
  const [isNotDuplicateRole, setIsNotDuplicateRole] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const noSymbolsRegex = /^([a-zA-Z0-9 ]+)$/;

  const handleSubmit = async e => {
    e.preventDefault();

    if (!isValidRole) {
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
    } else if (regexTest) {
      setNewRoleName(value);
      setIsValidRole(true);
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

  const handleChange = e => {
    const actualValue = e.target.value;

    setPermissionsChecked(previous => {
      const isAlreadyChecked = previous.some(perm => perm === actualValue);
      const unCheckPermission = previous.filter(perm => perm !== actualValue);
      return isAlreadyChecked ? unCheckPermission : [...previous, actualValue];
    });
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
        {isValidRole === false && (
          <Alert className="createRole__alert" color="danger">
            {errorMessage}
          </Alert>
        )}
      </FormGroup>

      <FormGroup>
        <Label>Permissions:</Label>
        {Object.entries(permissionLabel).map(([key, value]) => {
          return (
            <FormCheck
              onChange={e => handleChange(e)}
              value={key}
              key={key}
              label={value}
              id={value}
            />
          );
        })}
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
