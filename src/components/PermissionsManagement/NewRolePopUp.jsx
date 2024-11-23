import { useState } from 'react';
import { Alert, Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux';
import { boxStyle, boxStyleDark } from 'styles';
import { getAllRoles } from '../../actions/role';
import PermissionList from './PermissionList';

function CreateNewRolePopup({ toggle, roleNames, darkMode, addRole }) {
  const [permissionsChecked, setPermissionsChecked] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [isValidRole, setIsValidRole] = useState(true);
  const [isNotDuplicateRole, setIsNotDuplicateRole] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const noSymbolsRegex = /^([a-zA-Z0-9 ]+)$/;
  const dispatch = useDispatch();

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
      const response = await addRole(newRoleObject);
      if (response?.status === 201) {
        toast.success('Role created successfully');
        dispatch(getAllRoles());
      } else {
        toast.error(`Error: ${response?.status || 'Unknown error'}`);
      }
      toggle();
    }
  };

  const checkIfDuplicate = value => {
    let duplicateFound = false;
    const trimmedValue = value.trim();

    roleNames.forEach(val => {
      if (val.localeCompare(trimmedValue, 'en', { sensitivity: 'base' }) === 0) {
        duplicateFound = true;
        return true;
      }
      return 0;
    });
    return duplicateFound;
  };

  const handleRoleName = e => {
    const { value } = e.target;
    const regexTest = noSymbolsRegex.test(value);
    const duplicateTest = checkIfDuplicate(value);
    if (value.trim() === '') {
      /* Changes Made */
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

  return (
    <Form id="createRole" onSubmit={handleSubmit}>
      <FormGroup>
        <Label className={darkMode ? 'text-light' : ''}>Role Name:</Label>
        <Input
          placeholder="Please enter a new role name"
          value={newRoleName}
          onChange={handleRoleName}
        />
        {isValidRole === false || isNotDuplicateRole === false ? (
          <Alert className="createRole__alert" color="danger">
            {errorMessage}
          </Alert>
        ) : null}
      </FormGroup>

      <FormGroup>
        <Label className={darkMode ? 'text-light' : ''}>Permissions:</Label>
        <PermissionList
          rolePermissions={permissionsChecked}
          editable
          setPermissions={setPermissionsChecked}
          darkMode={darkMode}
        />
      </FormGroup>
      <Button
        type="submit"
        id="createRole"
        color="primary"
        size="lg"
        block
        style={darkMode ? boxStyleDark : boxStyle}
      >
        Create
      </Button>
    </Form>
  );
}

const mapStateToProps = state => ({ roles: state.role.roles, darkMode: state.theme.darkMode });

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  // addNewRole: newRole => dispatch(addNewRole(newRole)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewRolePopup);
