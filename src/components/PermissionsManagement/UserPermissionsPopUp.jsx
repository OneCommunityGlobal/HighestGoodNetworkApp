import { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, Form, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { getAllUserProfile } from 'actions/userManagement';
import './PermissionsManagement.css';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
// eslint-disable-next-line no-unused-vars
import { boxStyle, boxStyleDark } from 'styles';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from 'utils/constants';
import PermissionList from './PermissionList';
import { addNewRole, getAllRoles } from '../../actions/role';
import { cantUpdateDevAdminDetails } from '../../utils/permissions';
import ReminderModal from './ReminderModal';

function UserPermissionsPopUp({
  allUserProfiles,
  // eslint-disable-next-line no-unused-vars
  toggle,
  getAllUsers,
  roles,
  authUser,
  setReminderModal,
  reminderModal,
  modalStatus,
  darkMode,
}) {
  const [searchText, onInputChange] = useState('');
  const [actualUserProfile, setActualUserProfile] = useState();
  const [userPermissions, setUserPermissions] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [actualUserRolePermission, setActualUserRolePermission] = useState();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [toastShown, setToastShown] = useState(false);

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
    setSelectedAccount(`${allUserInfo.firstName} ${allUserInfo.lastName}`);
  };

  useEffect(() => {
    getAllUsers();
    if (actualUserProfile?.role && roles) {
      const roleIndex = roles?.findIndex(({ roleName }) => roleName === actualUserProfile?.role);
      const permissions = roleIndex !== -1 ? roles[roleIndex].permissions : [];
      setActualUserRolePermission(permissions);
    }
  }, [actualUserProfile]);

  const logPermissionChanges = async (logPermissionChangesUrl, permissionChangeLog) => {
    try {
      await axios.post(logPermissionChangesUrl, permissionChangeLog);
    } catch (error) {
      toast.error('Error logging permissions:', {
        autoClose: 10000,
      });
    }
  };

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
    const logPermissionChangesUrl = ENDPOINTS.POST_USER_PERMISSION_CHANGE_LOGS;
    const allUserInfo = await axios.get(url).then(res => res.data);
    const newUserInfo = { ...allUserInfo, permissions: { frontPermissions: userPermissions } };

    let existingPermissions = allUserInfo.permissions?.frontPermissions || [];
    const existingPermissionsSet = new Set(existingPermissions || []);
    const newPermissionsSet = new Set(userPermissions || []);
    const addedPermissions = (userPermissions || []).filter(
      permission => !existingPermissionsSet.has(permission),
    );
    const removedPermissions = (existingPermissions || []).filter(
      permission => !newPermissionsSet.has(permission),
    );

    existingPermissions = [
      ...existingPermissions.filter(permission => !removedPermissions.includes(permission)),
      ...addedPermissions,
    ];

    const permissionChangeLog = {
      actualUserProfile: {
        firstName: actualUserProfile.firstName,
        lastName: actualUserProfile.lastName,
      },
      authUser: {
        email: authUser.email,
        role: authUser.role,
      },
      userId,
      existingPermissions, // Existing permissions before change
      addedPermissions, // New permissions added
      removedPermissions, // Permissions removed
    };

    await axios
      .put(url, newUserInfo)
      .then(() => {
        if (!toastShown) {
          const SUCCESS_MESSAGE = `
        Permissions have been updated successfully. 
        Please inform the user to log out and log back in for the new permissions to take effect.`;
          toast.success(SUCCESS_MESSAGE, {
            autoClose: 10000,
          });
          setToastShown(true);
          logPermissionChanges(logPermissionChangesUrl, permissionChangeLog);
        }
        toggle();
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
  useEffect(() => {
    if (!modalStatus) {
      setToastShown(false);
    }
  }, [modalStatus]);
  return (
    <>
      {modalStatus && (
        <ReminderModal
          setReminderModal={setReminderModal}
          reminderModal={reminderModal}
          updateProfileOnSubmit={updateProfileOnSubmit}
          changedAccount={selectedAccount}
          darkMode={darkMode}
        />
      )}
      <Form
        id="manage__user-permissions"
        onSubmit={e => {
          updateProfileOnSubmit(e);
        }}
      >
        <div
          className={darkMode ? 'text-space-cadet' : ''}
          style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '5px' }}
        >
          <h4 className="user-permissions-pop-up__title">User name:</h4>
          <Button
            type="button"
            color="success"
            // eslint-disable-next-line no-unused-vars
            onClick={e => {
              setToDefault();
            }}
            disabled={!actualUserProfile}
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
            // eslint-disable-next-line no-unused-vars
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
                // eslint-disable-next-line array-callback-return, consistent-return
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
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <></>
          )}
        </Dropdown>
        <div>
          <h4 className={`user-permissions-pop-up__title ${darkMode ? 'text-space-cadet' : ''}`}>
            Permissions:
          </h4>
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
