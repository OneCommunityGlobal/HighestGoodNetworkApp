import React, { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, Form, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { addNewRole, getAllRoles } from '../../actions/role';
import { permissionFrontToBack } from 'utils/associatedPermissions';
import { getAllUserProfile } from 'actions/userManagement';
import { permissionLabel } from './UserRoleTab';

import './PermissionsManagement.css';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { boxStyle } from 'styles';

const UserPermissionsPopUp = ({ allUserProfiles, toggle, getAllUsers, roles }) => {
  const [searchText, onInputChange] = useState('');
  const [actualUserProfile, setActualUserProfile] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [actualUserRolePermission, setActualUserRolePermission] = useState();

  //no onchange, always change this state;
  const onChangeCheck = data => {
    const actualValue = data;

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
    if (actualUserProfile?.role && roles) {
      const roleIndex = roles?.findIndex(({ roleName }) => roleName === actualUserProfile?.role);
      let permissions = [];
      if (roleIndex !== -1) {
        permissions = roles[roleIndex].permissions;
      }
      setActualUserRolePermission(permissions);
    }
  }, [actualUserProfile]);

  const isPermissionChecked = permission =>
    actualUserProfile?.permissions?.frontPermissions.some(perm => perm === permission);

  const isPermissionDefault = permission => {
    return actualUserRolePermission?.includes(permission);
  };

  const updateProfileOnSubmit = async e => {
    e.preventDefault();
    const userId = actualUserProfile?._id;

    const url = ENDPOINTS.USER_PROFILE(userId);
    const allUserInfo = await axios.get(url).then(res => res.data);
    const newUserInfo = { ...allUserInfo, ...actualUserProfile };

    await axios
      .put(url, newUserInfo)
      .then(res => {
        res.data;
      })
      .catch(err => console.log(err));
    getAllUsers();

    const SUCCESS_MESSAGE = `
        Permission has been updated successfully. Be sure to tell them that you are changing these
        permissions and for that they need to log out and log back in for their new permissions to take
        place.`;
    toast.success(SUCCESS_MESSAGE, {
      autoClose: 10000,
    });
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
                <div
                  style={{
                    color: isPermissionChecked(key) || isPermissionDefault(key) ? 'green' : 'red',
                    padding: '14px',
                  }}
                >
                  {value}
                </div>
                {isPermissionDefault(key) ? null : isPermissionChecked(key) ? (
                  <Button
                    type="button"
                    color="danger"
                    onClick={e => onChangeCheck(key)}
                    disabled={actualUserProfile ? false : true}
                    style={boxStyle}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    color="success"
                    onClick={e => onChangeCheck(key)}
                    disabled={actualUserProfile ? false : true}
                    style={boxStyle}
                  >
                    Add
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
        style={{ ...boxStyle, marginTop: '1rem' }}
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
