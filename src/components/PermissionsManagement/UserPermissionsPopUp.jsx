import { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, Form, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { getAllUserProfile } from 'actions/userManagement';
import './PermissionsManagement.css';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { boxStyle, boxStyleDark } from 'styles';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from 'utils/constants';
import PermissionList from './PermissionList';
import { addNewRole, getAllRoles } from '../../actions/role';
import { cantUpdateDevAdminDetails } from '../../utils/permissions';

function UserPermissionsPopUp({ toggle, allUserProfiles, getAllUsers, roles, authUser, darkMode }) {
  const a = 1;
  const [searchText, onInputChange] = useState('');
  const [actualUserProfile, setActualUserProfile] = useState();
  const [userPermissions, setUserPermissions] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [actualUserRolePermission, setActualUserRolePermission] = useState();

  const setToDefault = () => {
    setUserPermissions([]);
  };

  useEffect(() => {
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
    const shouldPreventEdit = cantUpdateDevAdminDetails(actualUserProfile?.email, authUser.email);
    if (shouldPreventEdit) {
      if (actualUserProfile?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
        // eslint-disable-next-line no-alert, prettier/prettier
        alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
      } else {
        // eslint-disable-next-line no-alert, prettier/prettier
        alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      }
      return;
    }
    const userId = actualUserProfile?._id;

    const url = ENDPOINTS.USER_PROFILE(userId);
    const allUserInfo = await axios.get(url).then(res => res.data);
    const newUserInfo = { ...allUserInfo, permissions: { frontPermissions: userPermissions } };

    await axios
      .put(url, newUserInfo)
      .then(() => {
        const SUCCESS_MESSAGE = `
        Permission has been updated successfully. Be sure to tell them that you are changing these
        permissions and for that they need to log out and log back in for their new permissions to take
        place.`;
        toast.success(SUCCESS_MESSAGE, {
          autoClose: 10000,
        });
        toggle();
        console.log("here");
      })
      .catch(err => {
        const ERROR_MESSAGE = `
        Permission updated failed. ${err}
        `;
        toast.error(ERROR_MESSAGE, {
          autoClose: 10000,
        });
      });
    getAllUsers();
  };
  useEffect(() => {
    refInput.current.focus();
  }, []);
  return (
    <Form
      id="manage__user-permissions"
      onSubmit={e => {
        updateProfileOnSubmit(e);
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '5px' }}>
        <h4 className="user-permissions-pop-up__title">User name:</h4>
        <Button
          type="button"
          color="success"
          onClick={() => {
            setToDefault();
          }}
          disabled={!actualUserProfile}
          style={darkMode ? boxStyleDark : boxStyle}
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
          onFocus={() => {
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
                return null;
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
        ) : null}
      </Dropdown>
      <div>
        <h4 className="user-permissions-pop-up__title">Permissions:</h4>
        <ul className="user-role-tab__permission-list">
          <PermissionList
            rolePermissions={userPermissions}
            immutablePermissions={actualUserRolePermission}
            editable={!!actualUserProfile}
            setPermissions={setUserPermissions}
            darkMode={darkMode}
          />
        </ul>
      </div>
      <Button
        type="submit"
        id="manage__user-permissions"
        color="primary"
        size="lg"
        block
        style={
          darkMode ? { ...boxStyleDark, marginTop: '1rem' } : { ...boxStyle, marginTop: '1rem' }
        }
      >
        Submit
      </Button>
    </Form>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  roles: state.role.roles,
  allUserProfiles: state.allUserProfiles.userProfiles,
  permissionsUser: state.auth.permissions,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  addNewRole: newRole => dispatch(addNewRole(newRole)),
  getAllUsers: () => dispatch(getAllUserProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserPermissionsPopUp);
