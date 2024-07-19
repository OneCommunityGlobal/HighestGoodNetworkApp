import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import './PermissionsManagement.css';
import { connect } from 'react-redux';
import { updateUserProfile, getUserProfile } from 'actions/userProfile';
import { getAllUserProfile } from 'actions/userManagement';
import { useHistory } from 'react-router-dom';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { ENDPOINTS } from 'utils/URL';
import { ModalContext } from 'context/ModalContext';
import UserPermissionsPopUp from './UserPermissionsPopUp';
import { getAllRoles } from '../../actions/role';
import { getInfoCollections } from '../../actions/information';
import hasPermission from '../../utils/permissions';
import CreateNewRolePopup from './NewRolePopUp';
import PermissionChangeLogTable from './PermissionChangeLogTable';

function PermissionsManagement(props) {
  const { auth, getUserRole, userProfile, darkMode } = props;
  let { roles } = props;
  const [isNewRolePopUpOpen, setIsNewRolePopUpOpen] = useState(false);
  const [isUserPermissionsOpen, setIsUserPermissionsOpen] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const { modalStatus, reminderUser } = useContext(ModalContext);

  const canPostRole = props.hasPermission('postRole');
  const canPutRole = props.hasPermission('putRole');
  const canManageUserPermissions = props.hasPermission('putUserProfilePermissions');

  // Added permissionChangeLogs state management
  const [changeLogs, setChangeLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const history = useHistory();
  const togglePopUpNewRole = () => {
    setIsNewRolePopUpOpen(previousState => !previousState);
  };

  // eslint-disable-next-line
  roles = roles.filter(role => {
    if (role != null) return role;
  });

  useEffect(() => {
    if (reminderUser !== null) {
      // console.log(reminderUser);
    }
  }, [reminderUser]);

  useEffect(() => {
    getAllRoles();
    getInfoCollections();
    getUserRole(auth?.user.userid);

    const getChangeLogs = async () => {
      try {
        const response = await axios.get(ENDPOINTS.PERMISSION_CHANGE_LOGS(auth?.user.userid));
        setChangeLogs(response.data);
        setLoading(false);
      } catch (error) {
        // Removed console.error statement
      }
    };

    getChangeLogs();
  }, []);

  const togglePopUpUserPermissions = () => {
    if (modalStatus === false) {
      setIsUserPermissionsOpen(previousState => !previousState);
    } else {
      setReminderModal(!reminderModal);
    }
  };
  const role = userProfile?.role;
  // eslint-disable-next-line no-shadow
  const roleNames = roles?.map(role => role.roleName);

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light' : ''}
      style={{ minHeight: '100%', border: '1px solid #1B2A41' }}
    >
      <div
        key={`${role}+permission`}
        className={
          darkMode ? 'permissions-management-dark bg-yinmn-blue' : 'permissions-management'
        }
      >
        <h1 className="permissions-management__title">User Roles</h1>
        <div key={`${role}_header`} className="permissions-management__header">
          {canPutRole && (
            <div key={`${role}_name`} className="role-name-container">
              {roleNames?.map(roleName => {
                const roleNameLC = roleName.toLowerCase().replace(' ', '-');
                return (
                  <div key={roleNameLC} className={`role-name ${darkMode ? 'role-name-dark' : ''}`}>
                    <button
                      onClick={() => history.push(`/permissionsmanagement/${roleNameLC}`)}
                      key={roleName}
                      type="button"
                      className={`role-btn ${darkMode ? 'text-light' : ''}`}
                    >
                      {roleName}
                    </button>
                    <div className="infos">
                      <EditableInfoModal
                        role={role}
                        areaName={`${roleName} Info`}
                        areaTitle={`${roleName} User Role`}
                        fontSize={18}
                        darkMode={darkMode}
                        isPermissionPage
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {(canPostRole || canManageUserPermissions) && (
            <div className="buttons-container">
              {canPostRole && (
                <Button
                  className="permissions-management__button"
                  type="button"
                  color="success"
                  onClick={() => togglePopUpNewRole()}
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Add New Role
                </Button>
              )}
              {canManageUserPermissions && (
                <Button
                  color="primary"
                  className="permissions-management__button"
                  type="button"
                  onClick={() => {
                    togglePopUpUserPermissions();
                  }}
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Manage User Permissions
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="permissions-management--flex">
          <Modal
            isOpen={isNewRolePopUpOpen}
            toggle={togglePopUpNewRole}
            id="modal-content__new-role"
            className={darkMode ? 'dark-mode text-light' : ''}
          >
            <ModalHeader
              toggle={togglePopUpNewRole}
              cssModule={{ 'modal-title': 'w-100 text-center my-auto' }}
              className={darkMode ? 'bg-space-cadet' : ''}
            >
              Create New Role
            </ModalHeader>
            <ModalBody
              id="modal-body_new-role--padding"
              className={darkMode ? 'bg-yinmn-blue' : ''}
            >
              <CreateNewRolePopup toggle={togglePopUpNewRole} roleNames={roleNames} />
            </ModalBody>
          </Modal>
          <Modal
            isOpen={isUserPermissionsOpen}
            toggle={togglePopUpUserPermissions}
            id="modal-content__new-role"
            className={darkMode ? 'text-light dark-mode' : ''}
          >
            <ModalHeader
              toggle={togglePopUpUserPermissions}
              cssModule={{ 'modal-title': 'w-100 text-center my-auto' }}
              className={darkMode ? 'bg-space-cadet' : ''}
            >
              Manage User Permissions
            </ModalHeader>
            <ModalBody id="modal-body_new-role--padding">
              <UserPermissionsPopUp
                toggle={togglePopUpUserPermissions}
                setReminderModal={setReminderModal}
                reminderModal={reminderModal}
                modalStatus={modalStatus}
              />
            </ModalBody>
          </Modal>
        </div>
      </div>
      {loading && <p className="loading-message">Loading...</p>}
      {changeLogs?.length > 0 && (
        <PermissionChangeLogTable changeLogs={changeLogs.slice().reverse()} darkMode={darkMode} />
      )}
      <br />
      <br />
    </div>
  );
}

// export default PermissionsManagement;
const mapStateToProps = state => ({
  roles: state.role.roles,
  auth: state.auth,
  userProfile: state.userProfile,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getInfoCollections: () => dispatch(getInfoCollections()),
  getAllRoles: () => dispatch(getAllRoles()),
  updateUserProfile: data => dispatch(updateUserProfile(data)),
  getAllUsers: () => dispatch(getAllUserProfile()),
  getUserRole: id => dispatch(getUserProfile(id)),
  hasPermission: action => dispatch(hasPermission(action)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsManagement);
