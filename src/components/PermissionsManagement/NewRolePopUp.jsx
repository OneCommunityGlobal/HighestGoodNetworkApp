import { useState } from 'react';
import { Alert, Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect, useDispatch } from 'react-redux';
import { boxStyle, boxStyleDark } from '~/styles';
import { getAllRoles } from '../../actions/role';
import PermissionList from './PermissionList';
import styles from './PermissionsManagement.module.css';

function CreateNewRolePopup({ toggle, roleNames, darkMode, addRole }) {
  const [permissionsChecked, setPermissionsChecked] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [isValidRole, setIsValidRole] = useState(true);
  const [isNotDuplicateRole, setIsNotDuplicateRole] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const noSymbolsRegex = /^([a-zA-Z0-9 ]+)$/;
  const dispatch = useDispatch();

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    if (newRoleName.trim() === '') {
      toast.error('Please enter a role name');
      setIsSubmitting(false);
    } else if (permissionsChecked.length === 0) {
      toast.error('Please select at least one permission');
      setIsSubmitting(false);
    } else if (!isValidRole) {
      toast.error('Please enter a valid role name');
      setIsSubmitting(false);
    } else if (!isNotDuplicateRole) {
      toast.error('Please enter a non duplicate role name');
      setIsSubmitting(false);
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
      setIsSubmitting(false);
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
    <>
      {isSubmitting && (
        <div className={`${styles['modal-loader-overlay']} ${darkMode ? styles['dark-mode'] : ''}`}>
          <div className={styles['modal-loader-spinner']}>
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Creating role...</span>
            </div>
            <p className={`${styles['modal-loader-text']} ${darkMode ? styles['text-light'] : ''}`}>
              Creating role...
            </p>
          </div>
        </div>
      )}
      <Form id="createRole" onSubmit={handleSubmit}>
        <div className={styles['user-search-container']}>
          <FormGroup>
            <Label className={darkMode ? styles['text-light'] : ''}>
              Role Name<span className="red-asterisk">* </span>:
            </Label>
            <Input
              placeholder="Please enter a new role name"
              value={newRoleName}
              onChange={handleRoleName}
              className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
            />
            {isValidRole === false || isNotDuplicateRole === false ? (
              <Alert className={styles['createRole__alert']} color="danger">
                {errorMessage}
              </Alert>
            ) : null}
          </FormGroup>
        </div>

        <div className={styles['modal-permission-list-container']}>
          <Label
            className={`${styles['user-permissions-pop-up__title']} ${
              darkMode ? styles['text-light'] : ''
            }`}
          >
            Permissions<span className="red-asterisk">* </span>:
          </Label>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <PermissionList
              rolePermissions={permissionsChecked}
              editable
              setPermissions={setPermissionsChecked}
              darkMode={darkMode}
            />
          </div>
        </div>

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
    </>
  );
}

const mapStateToProps = state => ({ roles: state.role.roles, darkMode: state.theme.darkMode });

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  // addNewRole: newRole => dispatch(addNewRole(newRole)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateNewRolePopup);
