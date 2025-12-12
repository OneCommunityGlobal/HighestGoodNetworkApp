import { useEffect, useState, useRef } from 'react';
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { getAllUserProfile } from '~/actions/userManagement';
import styles from './PermissionsManagement.module.css';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
// eslint-disable-next-line no-unused-vars
import { boxStyle, boxStyleDark } from '~/styles';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from '../../utils/constants';
import { cantUpdateDevAdminDetails } from '../../utils/permissions';
import PermissionList from './PermissionList';
import { addNewRole, getAllRoles } from '../../actions/role';

import ReminderModal from './ReminderModal';
import { permissionLabelKeyMappingObj, getAllPermissionKeys } from './PermissionsConst';

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
  getChangeLogs,
}) {
  const [searchText, onInputChange] = useState('');
  const [actualUserProfile, setActualUserProfile] = useState();
  const [userPermissions, setUserPermissions] = useState();
  const [userRemovedDefaultPermissions, setUserRemovedDefaultPermissions] = useState(); // defulat perms taht were deleted
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [actualUserRolePermission, setActualUserRolePermission] = useState();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [toastShown, setToastShown] = useState(false);
  const [infoRoleModal, setinfoRoleModal] = useState(false);
  const [modalContent, setContent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setToDefault = () => {
    setUserPermissions([]);
    setUserRemovedDefaultPermissions([]);
  };

  useEffect(() => {
    setUserPermissions(actualUserProfile?.permissions?.frontPermissions);
    setUserRemovedDefaultPermissions(
      actualUserProfile?.permissions?.removedDefaultPermissions || [],
    );
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

  const updateProfileOnSubmit = async e => {
    e.preventDefault();
    const shouldPreventEdit = cantUpdateDevAdminDetails(actualUserProfile?.email, authUser.email);
    if (shouldPreventEdit) {
      setIsSubmitting(false);
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

    const url = `${ENDPOINTS.PERMISSION_MANAGEMENT_UPDATE()}/user/${userId}`;
    const permissionData = {
      permissions: {
        frontPermissions: userPermissions,
        removedDefaultPermissions: userRemovedDefaultPermissions,
        defaultPermissions: actualUserRolePermission,
      },
      requestor: authUser, // Fixed: use authUser instead of req.body.requestor
    };

    axios
      .patch(url, permissionData)
      .then(() => {
        if (!toastShown) {
          const SUCCESS_MESSAGE = `
            Permissions have been updated successfully. 
            Please inform the user to log out and log back in for the new permissions to take effect.`;
          toast.success(SUCCESS_MESSAGE, {
            autoClose: 10000,
          });
          setToastShown(true);
        }
        toggle();
        getAllUsers();
        getChangeLogs();
      })
      .catch(err => {
        const ERROR_MESSAGE = `
          Permission update failed. ${err}
        `;
        toast.error(ERROR_MESSAGE, {
          autoClose: 10000,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleModalOpen = () => {
    if (userPermissions?.length > 0 || userRemovedDefaultPermissions?.length > 0) {
      const matchingPermissions = [
        ...new Set(
          getAllPermissionKeys().filter(
            key => userPermissions.includes(key) || userRemovedDefaultPermissions.includes(key),
          ),
        ),
      ];

      const permissionNames = matchingPermissions.map(key => permissionLabelKeyMappingObj[key]);

      const description = `Clicking reset to default will return the user to the default permissions of this role: ${
        actualUserProfile?.role
      }.\n
      The following permissions that had been changed (also indicated by a Star icon below) are: ${permissionNames.join(
        ', ',
      )}`;
      setContent(description);
      setinfoRoleModal(true);
    }
  };

  const toggleInfoRoleModal = () => {
    setinfoRoleModal(!infoRoleModal);
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
        id={styles['manage__user-permissions']}
        onSubmit={e => {
          updateProfileOnSubmit(e);
        }}
        autoComplete="off"
      >
        <div
          className={darkMode ? styles['text-space-cadet'] : ''}
          style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '5px' }}
        >
          <h4 className={styles['user-permissions-pop-up__title']}>
            User name<span className="red-asterisk">* </span>:
          </h4>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="infos">
              <i
                data-toggle="tooltip"
                data-placement="center"
                title="Click for more information"
                aria-hidden="true"
                className="fa fa-info-circle"
                onClick={() => {
                  handleModalOpen();
                }}
                style={{
                  color: darkMode ? 'white' : 'black',
                  fontSize: '25px',
                  marginRight: '10px',
                }}
              />
            </div>
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
        </div>
        <Dropdown
          isOpen={isOpen}
          toggle={() => {
            setIsOpen(!isOpen);
          }}
          style={{ width: '100%', marginRight: '5px' }}
        >
          <Input
            type="search"
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
            className={darkMode ? styles['bg-darkmode-liblack text-light border-0'] : ''}
            autoComplete="off"
            name="user-search"
          />
          {isInputFocus || (searchText !== '' && allUserProfiles && allUserProfiles.length > 0) ? (
            <div
              tabIndex="-1"
              role="menu"
              aria-hidden="false"
              className={`dropdown-menu${isOpen ? ` show ${styles['dropdown__user-perms']}` : ''} ${
                darkMode ? styles['bg-darkmode-liblack text-light'] : ''
              }`}
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
                    className={styles['user__auto-complete']}
                    key={user._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      onInputChange(`${user.firstName} ${user.lastName}`);
                      setIsOpen(false);
                      setActualUserProfile(user);
                      getUserData(user._id);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onInputChange(`${user.firstName} ${user.lastName}`);
                        setIsOpen(false);
                        setActualUserProfile(user);
                        getUserData(user._id);
                      }
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </div>
                ))}
            </div>
          ) : (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <></>
          )}
        </Dropdown>
        <div>
          <h4
            className={`${styles['user-permissions-pop-up__title']} ${
              darkMode ? styles['text-space-cadet'] : ''
            }`}
          >
            Permissions:
          </h4>
          <ul className={styles['user-role-tab__permission-list']}>
            <PermissionList
              rolePermissions={userPermissions}
              immutablePermissions={actualUserRolePermission}
              editable={!!actualUserProfile}
              setPermissions={setUserPermissions}
              removedDefaultPermissions={userRemovedDefaultPermissions}
              setRemovedDefaultPermissions={setUserRemovedDefaultPermissions}
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
      <Modal
        isOpen={infoRoleModal}
        toggle={toggleInfoRoleModal}
        id="#modal2-body_new-role--padding"
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader toggle={toggleInfoRoleModal} className={darkMode ? 'bg-space-cadet' : ''}>
          Reset to Default Info
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <p style={{ whiteSpace: 'pre-line' }}>{modalContent}</p>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button onClick={toggleInfoRoleModal} color="secondary" className="float-left">
            {' '}
            Ok{' '}
          </Button>
        </ModalFooter>
      </Modal>
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
