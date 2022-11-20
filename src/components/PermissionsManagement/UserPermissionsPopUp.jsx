import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Form, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { addNewRole, getAllRoles } from '../../actions/role';
import { permissionFrontToBack } from 'utils/associatedPermissions';
import { getAllUserProfile } from 'actions/userManagement';
import { permissionLabel } from './UserRoleTab';
import { useRef } from 'react';

import './PermissionsManagement.css';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

const UserPermissionsPopUp = ({ allUserProfiles, toggle, getAllUsers }) => {
  const [searchText, onInputChange] = useState('');
  const [actualUserProfile, setActualUserProfile] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);

  //no onchange, always change this state;
  const onChangeCheck = data => {
    const actualValue = data;
    console.log(actualValue);

    setActualUserProfile(previous => {
      const permissionsUser = previous.permissions;
      const permissionsUserFront = permissionsUser?.frontPermissions;

      let isAlreadyChecked = previous.permissions?.frontPermissions?.some(
        perm => perm === actualValue,
      );
      if (isAlreadyChecked === undefined) isAlreadyChecked = false;

      const unCheckPermission = previous.permissions?.frontPermissions?.filter(
        perm => perm !== actualValue,
      );

      const actualPermissionsFront = isAlreadyChecked
        ? unCheckPermission
        : [...permissionsUserFront, actualValue];

      let permissionsBackEnd = actualPermissionsFront
        .map(permission => {
          permissionFrontToBack(permission);
        })
        .filter(e => e != undefined);

      const newPermissionsObject = {
        frontPermissions: actualPermissionsFront,
        backPermissions: permissionsBackEnd,
      };
      console.log(newPermissionsObject);
      return { ...previous, permissions: newPermissionsObject };
    });
  };

  const refInput = useRef();
  const getUserData = async userId => {
    const url = ENDPOINTS.USER_PROFILE(userId);
    const allUserInfo = await axios.get(url).then(res => res.data);
    setActualUserProfile(allUserInfo);
  };
  useEffect(() => {
    getAllUsers();

    console.log(actualUserProfile);
  }, [actualUserProfile]);

  const isPermissionChecked = permission =>
    actualUserProfile?.permissions?.frontPermissions.some(perm => perm === permission);

  const updateProfileOnSubmit = async e => {
    e.preventDefault();
    const userId = actualUserProfile?._id;

    const url = ENDPOINTS.USER_PROFILE(userId);
    console.log(actualUserProfile, 'here1');
    const allUserInfo = await axios.get(url).then(res => res.data);
    const newUserInfo = { ...allUserInfo, ...actualUserProfile };
    console.log(newUserInfo, 'here2');

    await axios
      .put(url, newUserInfo)
      .then(res => {
        res.data;
      })
      .catch(err => console.log(err));
    getAllUsers();
    console.log(newUserInfo, '2');

    toast.success('Permission has been updated successfully');
  };

  return (
    <Form
      id="manage__user-permissions"
      onSubmit={e => {
        updateProfileOnSubmit(e);
      }}
    >
      <h4 className="user-permissions-pop-up__title">User name:</h4>
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
                    getUserData(user._id);
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
        <h4 className="user-permissions-pop-up__title">Permissions:</h4>
        <ul className="user-role-tab__permission-list">
          {Object.entries(permissionLabel).map(([key, value]) => {
            return (
              <li key={key} className="user-role-tab__permission">
                <p style={{ color: isPermissionChecked(key) ? 'green' : 'red' }}>{value}</p>
                {isPermissionChecked(key) ? (
                  <Button
                    type="button"
                    color="danger"
                    onClick={e => onChangeCheck(key)}
                    disabled={actualUserProfile ? false : true}
                  >
                    -
                  </Button>
                ) : (
                  <Button
                    type="button"
                    color="success"
                    onClick={e => onChangeCheck(key)}
                    disabled={actualUserProfile ? false : true}
                  >
                    +
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
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
  getAllUsers: () => dispatch(getAllUserProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserPermissionsPopUp);
