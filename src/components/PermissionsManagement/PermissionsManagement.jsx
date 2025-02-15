import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import './PermissionsManagement.css';
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa'; // Importing react-icons for the info icon
import ReactTooltip from 'react-tooltip'; // Importing react-tooltip for tooltip functionality
// eslint-disable-next-line import/named
import { getAllUserProfile } from '../../actions/userProfile';
import { updateUserProfile, getUserProfile } from '../../actions/userProfile';
import { boxStyle, boxStyleDark } from '../../styles';
import '../Header/DarkMode.css';
import { ENDPOINTS } from '../../utils/URL';
import { ModalContext } from '../../context/ModalContext';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';
import UserPermissionsPopUp from './UserPermissionsPopUp';
import { getAllRoles } from '../../actions/role';
import { addNewRole } from '../../actions/role';
import { getInfoCollections } from '../../actions/information';
import hasPermission from '../../utils/permissions';
import CreateNewRolePopup from './NewRolePopUp';
import PermissionChangeLogTable from './PermissionChangeLogTable';

function PermissionsManagement({ roles, auth, getUserRole, userProfile, darkMode }) {
  const [isNewRolePopUpOpen, setIsNewRolePopUpOpen] = useState(false);
  const [isUserPermissionsOpen, setIsUserPermissionsOpen] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const { modalStatus, reminderUser } = useContext(ModalContext);

  const canPostRole = hasPermission('postRole');
  const canPutRole = hasPermission('putRole');
  const canManageUserPermissions = hasPermission('putUserProfilePermissions');

  // Added permissionChangeLogs state management
  const [changeLogs, setChangeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state for fetching logs

  const history = useHistory();
  const togglePopUpNewRole = () => {
    setIsNewRolePopUpOpen(previousState => !previousState);
  };

  const togglePopUpUserPermissions = () => {
    if (modalStatus === false) {
      setIsUserPermissionsOpen(previousState => !previousState);
    } else {
      setReminderModal(!reminderModal);
    }
  };

  // eslint-disable-next-line
  roles = roles.filter(role => {
    if (role != null) return role;
  });

  const dispatch = useDispatch();

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
      } catch (fetchError) {
        setError('Failed to fetch logs'); // Ensure error message updates the state
      } finally {
        setLoading(false); // Ensure re-render
      }
    };

    getChangeLogs();
  }, [auth?.user.userid]);

  const role = userProfile?.role;
  // eslint-disable-next-line no-shadow
  const roleNames = roles?.map(role => role.roleName);

  useEffect(() => {
    dispatch(getAllRoles());
  }, [dispatch]);

  const addRole = async newRole => {
    // Add the new role
    const response = await addNewRole(newRole);
    return response;
  };

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light' : ''}
      style={{ minHeight: '100%', border: '1px solid #1B2A41' }}
    >
      <div
        key={`${role}+permission`}
        className={`permissions-management ${darkMode ? 'bg-yinmn-blue dark-box-shadow' : ''}`}
      >
        <h1 className="permissions-management__title">
          User Roles
          {/* Added description for the i icon of permissions management page */}
          <FaInfoCircle
            data-tip="<div style='text-align: left;'>
                      <p>Welcome to the Permissions Management Page!</p>
                      <p>This page gives access to all the One Community Roles, and the ability to create and delete Roles. Each Role has various permissions within the system, categorized by functionality. These permissions relate to:</p>
                      <ul>
                        <li>Reports: 📊 Viewing and editing analytics and summaries.</li>
                        <li>User Management: 👤 Managing user accounts, statuses, and blue squares.</li>
                        <li>Badge Management: 🏅 Creating, editing, and assigning badges.</li>
                        <li>Project Management: 🛠️ Adding, editing, and assigning projects.</li>
                        <li>Work Breakdown Structures: 🗂️ Adding and deleting WBS.</li>
                        <li>Tasks: 📋 Managing tasks and interactions.</li>
                        <li>Teams Management: 👥 Creating, editing, and assigning teams.</li>
                        <li>Timelog Management: 🕒 Managing time entries and logs.</li>
                        <li>Permissions Management: 🔑 Editing roles and user permissions.</li>
                      </ul>
                    </div>"
            style={{
              fontSize: '24px',
              cursor: 'pointer',
              color: 'rgb(0, 204, 255)',
              marginLeft: '10px',
            }}
          />
          <ReactTooltip place="right" type="dark" effect="solid" html />
        </h1>
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
                        loading={false} // Pass loading prop
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
              <CreateNewRolePopup
                toggle={togglePopUpNewRole}
                roleNames={roleNames}
                addRole={addRole}
              />
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
              className={darkMode ? 'bg-oxford-blue text-light' : ''}
            >
              Manage User Permissions
            </ModalHeader>
            <ModalBody id="modal-body_new-role--padding">
              <UserPermissionsPopUp
                toggle={togglePopUpUserPermissions}
                setReminderModal={setReminderModal}
                reminderModal={reminderModal}
                modalStatus={modalStatus}
                darkMode={darkMode}
              />
            </ModalBody>
          </Modal>
        </div>
      </div>
      {loading && <p className="loading-message">Loading...</p>}
      {error && (
        <p data-testid="error-message" className="error-message">
          {error}
        </p>
      )}{' '}
      {/* Add data-testid for testing */}
      {changeLogs?.length > 0 && (
        <PermissionChangeLogTable changeLogs={changeLogs} darkMode={darkMode} />
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
  addNewRole: newRole => dispatch(addNewRole(newRole)),
  getUserRole: id => dispatch(getUserProfile(id)),
  hasPermission: action => dispatch(hasPermission(action)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionsManagement);
