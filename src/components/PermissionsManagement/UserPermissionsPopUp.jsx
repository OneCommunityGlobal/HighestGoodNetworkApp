import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Form, FormGroup, Input, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { addNewRole, getAllRoles } from '../../actions/role';
import { commonBackEndPermissions, permissionFrontToBack } from 'utils/associatedPermissions';
import { getAllUserProfile } from 'actions/userManagement';
import { updateUserProfile } from 'actions/userProfile';
import { permissionLabel } from './UserRoleTab';
import { FormCheck } from 'react-bootstrap';
import { useRef } from 'react';

import './PermissionsManagement.css';

const UserPermissionsPopUp = ({ allUserProfiles, toggle, updateUserProfile }) => {
  const [searchText, onInputChange] = useState('');
  const [actualUserProfile, setActualUserProfile] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState([]);
  const [isInputFocus, setIsInputFocus] = useState(false);
  let actualPermissions;

  const handleChange = e => {
    const actualValue = e.target.value;
    setPermissionsChecked(previous => {
      const isAlreadyChecked = previous.some(perm => perm === actualValue);
      const unCheckPermission = previous.filter(perm => perm !== actualValue);
      return isAlreadyChecked ? unCheckPermission : [...previous, actualValue];
    });
    setActualUserProfile(previous => {
      const isAlreadyChecked = previous.permissions.frontPermissions.some(
        perm => perm === actualValue,
      );
      const unCheckPermission = previous.permissions.frontPermissions.filter(
        perm => perm !== actualValue,
      );
      const actualPermissions = isAlreadyChecked ? unCheckPermission : [...previous, actualValue];
      // update userProfile permissions back and front based in the select checks here and in the useForm, use this value =.
      // {}
      return { ...previous, permissions: actualPermissions };
    });
    console.log(permissionsChecked);
  };

  const refInput = useRef();

  const updateProfileOnSubmit = async e => {
    e.preventDefault();
    let permissionsBackEnd = permissionsChecked.map(permission => {
      permissionFrontToBack(permission);
    });
    permissionsBackEnd = [...permissionsBackEnd, ...commonBackEndPermissions].flat();
    console.log(permissionsBackEnd);
    actualPermissions;
    const newPermissionsObject = {
      frontPermissions: permissionsChecked,
      backPermissions: permissionsBackEnd,
    };
    setActualUserProfile(prev => {
      return { ...prev, permissions: newPermissionsObject };
    });
    console.log(actualUserProfile, 'before');
    // await updateUserProfile(actualUserProfile._id, actualUserProfile);
    // console.log(actualUserProfile, 'after');
    // console.log(actualUserProfile);
    toast.success('Permission have been updated successfully');
    // toggle();
  };

  return (
    <Form
      id="manage__user-permissions"
      onSubmit={e => {
        updateProfileOnSubmit(e);
      }}
    >
      <Label>User name:</Label>
      <Dropdown
        isOpen={isOpen}
        toggle={() => {
          setIsOpen(!isOpen);
        }}
        style={{ width: '100%', marginRight: '5px' }}
      >
        <Input
          type="text"
          value={searchText}
          ref={refInput}
          onFocus={e => {
            setIsInputFocus(true);
            setIsOpen(true);
          }}
          onChange={e => {
            onInputChange(e.target.value);
            setIsOpen(true);
          }}
        />
        {isInputFocus || (searchText !== '' && allUserProfiles && allUserProfiles.length > 0) ? (
          <div
            tabIndex="-1"
            role="menu"
            aria-hidden="false"
            className={`dropdown-menu${isOpen ? ' show dropdown__user-perms' : ''}`}
            style={{ marginTop: '0px', width: '100%' }}
          >
            {allUserProfiles
              .filter(user => {
                if (
                  user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
                  user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
                  `${user.firstName} ${user.lastName}`
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
                ) {
                  return user;
                }
              })
              .map(user => (
                <div
                  className="user__auto-complete"
                  key={user._id}
                  onClick={() => {
                    onInputChange(`${user.firstName} ${user.lastName}`);
                    setIsOpen(false);
                    setActualUserProfile(user);
                    // setPermissionsChecked(user.permissions);
                    // props.onDropDownSelect(user);
                  }}
                >
                  {`${user.firstName} ${user.lastName}`}
                </div>
              ))}
          </div>
        ) : (
          <></>
        )}
      </Dropdown>
      <div>
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
      </div>
      <Button
        type="submit"
        id="manage__user-permissions"
        color="primary"
        size="lg"
        block
        style={{ marginTop: '1rem' }}
      >
        Submit
      </Button>
    </Form>
  );
};

const mapStateToProps = state => ({
  roles: state.role.roles,
  allUserProfiles: state.allUserProfiles.userProfiles,
  permissionsUser: state.auth.permissions,
});

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  addNewRole: newRole => dispatch(addNewRole(newRole)),
  getAllUsers: () => dispatch(getAllUserProfile),
  updateUserProfile: newUserProfile => dispatch(updateUserProfile(newUserProfile)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserPermissionsPopUp);
