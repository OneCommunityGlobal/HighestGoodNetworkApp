import React, { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, Form, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { addNewRole, getAllRoles } from '../../actions/role';
import { getAllUserProfile } from 'actions/userManagement';
import PermissionList from './PermissionList';
import './PermissionsManagement.css';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { boxStyle } from 'styles';

const UserPermissionsPopUp = ({ allUserProfiles, toggle, getAllUsers, roles }) => {

  const [searchText, onInputChange] = useState('');
  const [actualUserProfile, setActualUserProfile] = useState();
  const [userPermissions, setUserPermissions] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [actualUserRolePermission, setActualUserRolePermission] = useState();

  const setToDefault = () => {
    setUserPermissions([]);
  }

  useEffect(()=>{
    setUserPermissions(actualUserProfile?.permissions?.frontPermissions);
  }, [actualUserProfile]);

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
      const permissions = roleIndex !== -1 ? roles[roleIndex].permissions : [];
      setActualUserRolePermission(permissions);
    }
  }, [actualUserProfile]);

  const updateProfileOnSubmit = async e => {
    e.preventDefault();
    // Ensure "seeBadges" is included if any badge-related permissions are present
    const badgePermissions = ["createBadges", "updateBadges", "deleteBadges"];
    const hasBadgePermission = userPermissions.some(permission => badgePermissions.includes(permission));
  
    if (hasBadgePermission && !userPermissions.includes("seeBadges")) {
        userPermissions.push("seeBadges");
    }
    
    const userId = actualUserProfile?._id;

    const url = ENDPOINTS.USER_PROFILE(userId);
    const allUserInfo = await axios.get(url).then(res => res.data);
    const newUserInfo = { ...allUserInfo, permissions: {frontPermissions: userPermissions} };

    await axios
      .put(url, newUserInfo)
      .then(res => {
        const SUCCESS_MESSAGE = `
        Permission has been updated successfully. Be sure to tell them that you are changing these
        permissions and for that they need to log out and log back in for their new permissions to take
        place.`;
        toast.success(SUCCESS_MESSAGE, {
          autoClose: 10000,
        });
      })
      .catch(err => {
        console.log(err);
        const ERROR_MESSAGE = `
        Permission updated failed. ${err}
        `
        toast.error(ERROR_MESSAGE, {
          autoClose: 10000,
        })
      });
    getAllUsers();
  };
  useEffect(() => {
    refInput.current.focus();
  }, []);
  return (
    <>
    <Form
      id="manage__user-permissions"
      onSubmit={e => {
        updateProfileOnSubmit(e);
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '5px'}}>
        <h4 className="user-permissions-pop-up__title">User name:</h4>
        <Button
          type="button"
          color="success"
          onClick={e => {
            setToDefault();
          }}
          disabled={actualUserProfile ? false : true}
          style={boxStyle}
        >
          Reset to Default
        </Button>
      </div>
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
          innerRef={refInput}
          onFocus={e => {
            setIsInputFocus(true);
            setIsOpen(true);
          }}
          onChange={e => {
            onInputChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Shows only ACTIVE users"
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
                  if (user.isActive) {
                    return user;
                  }
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
          <PermissionList
            rolePermissions={userPermissions}
            immutablePermissions={actualUserRolePermission}
            editable={!!actualUserProfile}
            setPermissions={setUserPermissions}
          />
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
    </>
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
