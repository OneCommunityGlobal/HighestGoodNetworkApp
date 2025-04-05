/* eslint-disable no-alert */
import { useState, useEffect, useMemo, useRef } from 'react';
// import { getUserProfile } from '../../actions/userProfile'
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { getWeeklySummaries } from 'actions/weeklySummaries';
import { Link, useLocation } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
} from 'reactstrap';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import PopUpBar from 'components/PopUpBar';
import { fetchTaskEditSuggestions } from 'components/TaskEditSuggestions/thunks';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from 'styles';
import { getHeaderData } from '../../actions/authActions';
import { getAllRoles } from '../../actions/role';
import Timer from '../Timer/Timer';
import OwnerMessage from '../OwnerMessage/OwnerMessage';
import {
  DASHBOARD,
  TIMELOG,
  REPORTS,
  WEEKLY_SUMMARIES_REPORT,
  TEAM_LOCATIONS,
  OTHER_LINKS,
  USER_MANAGEMENT,
  BADGE_MANAGEMENT,
  PROJECTS,
  TEAMS,
  WELCOME,
  VIEW_PROFILE,
  UPDATE_PASSWORD,
  LOGOUT,
  PERMISSIONS_MANAGEMENT,
  SEND_EMAILS,
  TOTAL_ORG_SUMMARY,
  SCHEDULE_MEETINGS,
} from '../../languages/en/ui';
import Logout from '../Logout/Logout';
import './Header.css';
import hasPermission, { cantUpdateDevAdminDetails } from '../../utils/permissions';
import {
  getUnreadUserNotifications,
  resetNotificationError,
} from '../../actions/notificationAction';
import {
  getUnreadMeetingNotification,
  markMeetingNotificationAsRead,
} from '../../actions/meetingNotificationAction';
import NotificationCard from '../Notification/notificationCard';
import DarkModeButton from './DarkModeButton';

export function Header(props) {
  const location = useLocation();
  const { darkMode } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const { isAuthenticated, user } = props.auth;
  const [firstName, setFirstName] = useState(props.auth.firstName);
  const [profilePic, setProfilePic] = useState(props.auth.profilePic);
  const [displayUserId, setDisplayUserId] = useState(user.userid);
  const [popup, setPopup] = useState(false);
  const [isAuthUser, setIsAuthUser] = useState(true);

  const ALLOWED_ROLES_TO_INTERACT = useMemo(() => ['Owner', 'Administrator'], []);
  const canInteractWithViewingUser = useMemo(
    () => ALLOWED_ROLES_TO_INTERACT.includes(props.auth.user.role),
    [ALLOWED_ROLES_TO_INTERACT, props.auth.user.role],
  );

  // Reports
  const canGetReports = props.hasPermission(
    'getReports',
    !isAuthUser && canInteractWithViewingUser,
  );
  const canGetWeeklySummaries = props.hasPermission(
    'getWeeklySummaries',
    !isAuthUser && canInteractWithViewingUser,
  );
  const canGetWeeklyVolunteerSummary = props.hasPermission('getWeeklySummaries');

  // Users
  const canAccessUserManagement =
    props.hasPermission('postUserProfile', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteUserProfile', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('changeUserStatus', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('getUserProfiles', !isAuthUser && canInteractWithViewingUser);

  // Badges
  const canAccessBadgeManagement =
    props.hasPermission('seeBadges', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('createBadges', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('updateBadges', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteBadges', !isAuthUser && canInteractWithViewingUser);
  // Projects
  const canAccessProjects =
    props.hasPermission('postProject', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteProject', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('putProject', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('getProjectMembers', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('assignProjectToUsers', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('postWbs', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteWbs', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('postTask', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('updateTask', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteTask', !isAuthUser && canInteractWithViewingUser);
  // Tasks
  const canUpdateTask = props.hasPermission(
    'updateTask',
    !isAuthUser && canInteractWithViewingUser,
  );
  // Teams
  const canAccessTeams =
    props.hasPermission('postTeam', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('putTeam', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteTeam', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('assignTeamToUsers', !isAuthUser && canInteractWithViewingUser);
  // Popups
  const canAccessPopups =
    props.hasPermission('createPopup', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('updatePopup', !isAuthUser && canInteractWithViewingUser);
  // SendEmails
  const canAccessSendEmails = props.hasPermission('sendEmails', !isAuthUser);
  // ScheduleMeetings
  const canAccessScheduleMeetings = props.hasPermission('scheduleMeetings', !isAuthUser);
  // console.log("canAccessScheduleMeetings", canAccessScheduleMeetings);
  // Permissions
  const canAccessPermissionsManagement =
    props.hasPermission('postRole', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('putRole', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteRole', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('putUserProfilePermissions', !isAuthUser && canInteractWithViewingUser);

  const userId = user.userid;
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalContents, setModalContents] = useState('');
  const [userDashboardProfile, setUserDashboardProfile] = useState(undefined);
  const [hasProfileLoaded, setHasProfileLoaded] = useState(false);
  const dismissalKey = `lastDismissed_${userId}`;
  const [lastDismissed, setLastDismissed] = useState(localStorage.getItem(dismissalKey));
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingModalMessage, setMeetingModalMessage] = useState('');

  // const unreadNotifications = props.unreadNotifications; // List of unread notifications
  // eslint-disable-next-line no-unused-vars
  const { allUserProfiles, unreadNotifications, unreadMeetingNotifications } = props;
  // get the meeting notifications for the current user
  const userUnreadMeetings = unreadMeetingNotifications.filter(
    meeting => meeting.recipient === userId,
  );
  const dispatch = useDispatch();
  const history = useHistory();
  const MeetingNotificationAudioRef = useRef(null);

  useEffect(() => {
    const handleStorageEvent = () => {
      const sessionStorageData = JSON.parse(window.sessionStorage.getItem('viewingUser'));
      if (sessionStorageData) {
        setDisplayUserId(sessionStorageData.userId);
        setFirstName(sessionStorageData.firstName);
        setProfilePic(sessionStorageData.profilePic);
        setIsAuthUser(false);
      } else {
        setDisplayUserId(user.userid);
        setFirstName(props.auth.firstName);
        setProfilePic(props.auth.profilePic);
        setIsAuthUser(true);
      }
    };

    // Set the initial state when the component mounts
    handleStorageEvent();

    // Add the event listener
    window.addEventListener('storage', handleStorageEvent);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [user.userid, props.auth.firstName]);

  useEffect(() => {
    if (props.auth.isAuthenticated) {
      props.getHeaderData(props.auth.user.userid);
      if (props.auth.user.role === 'Owner' || props.auth.user.role === 'Administrator') {
        dispatch(fetchTaskEditSuggestions());
      }
    }
  }, [props.auth.isAuthenticated]);
  const roles = props.role?.roles;

  useEffect(() => {
    if (roles.length === 0 && isAuthenticated) {
      props.getAllRoles();
    }
    // Fetch unread notification
    if (isAuthenticated && userId) {
      dispatch(getUnreadUserNotifications(userId));
      dispatch(getUnreadMeetingNotification());
    }
  }, []);

  useEffect(() => {
    if (props.notification?.error) {
      toast.error(props.notification.error.message);
      dispatch(resetNotificationError());
    }
  }, [props.notification?.error]);

  // display the notification and enable the bell ring when there are unread meeting notifications
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
  
    const fetchMeetingDetails = async () => {
      if (unreadMeetingNotifications.length > 0) {
        const currMeeting = unreadMeetingNotifications[0];
  
        const currentDate = new Date();
        const meetingDate = new Date(currMeeting.dateTime);
        const threeDaysLater = new Date();
        threeDaysLater.setDate(currentDate.getDate() + 3);
  
        if (meetingDate <= threeDaysLater) {
          try {
            const { data } = await axios.get(
              `http://localhost:4500/api/meeting/${currMeeting.meetingId}/calendar`,
            );
  
            if (!meetingModalOpen) {
              setMeetingModalOpen(true);
  
              // Create downloadable ICS file
              const icsBlob = new Blob([data.icsContent], { type: 'text/calendar' });
              const icsUrl = URL.createObjectURL(icsBlob);
  
              setMeetingModalMessage(`
                <p>Reminder: You have an upcoming meeting! Please check the details and be prepared.</p>
                <p><strong>Time:</strong> ${meetingDate.toLocaleString()}</p>
                <p><strong>Organizer:</strong> ${data.organizerFullName}</p>
                ${currMeeting.notes ? `<p><strong>Notes:</strong> ${currMeeting.notes}</p>` : ''}
                <p><a href="${data.googleCalendarLink}" target="_blank">Add to Google Calendar</a></p>
                <p><button id="downloadButton"><strong>Download Calendar Event (.ics)</strong></button></p>
              `);
  
              // Delay to ensure DOM is updated before accessing the element
              setTimeout(() => {
                const downloadButton = document.getElementById('downloadButton');
                if (downloadButton) {
                  downloadButton.onclick = () => {
                    const link = document.createElement('a');
                    link.href = icsUrl;
                    link.download = 'meeting.ics';
                    link.click();
                  };
                }
              }, 0);
            }
  
            if (MeetingNotificationAudioRef.current) {
              MeetingNotificationAudioRef.current.play();
            }
          } catch (_) {
            setMeetingModalOpen(false);
            setMeetingModalMessage('');
          }
        }
      } else {
        if (meetingModalOpen) {
          setMeetingModalOpen(false);
          setMeetingModalMessage('');
        }
        if (MeetingNotificationAudioRef.current) {
          MeetingNotificationAudioRef.current.pause();
          MeetingNotificationAudioRef.current.currentTime = 0;
        }
      }
    };
  
    fetchMeetingDetails();
  }, [unreadMeetingNotifications]);

  const handleMeetingRead = () => {
    setMeetingModalOpen(!meetingModalOpen);
    if (userUnreadMeetings?.length > 0) {
      dispatch(markMeetingNotificationAsRead(userUnreadMeetings[0]));
    }
  };

  const toggle = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  const openModal = () => {
    setLogoutPopup(true);
  };

  const removeViewingUser = () => {
    setPopup(false);
    sessionStorage.removeItem('viewingUser');
    window.dispatchEvent(new Event('storage'));
    props.getWeeklySummaries(user.userid);
    history.push('/dashboard');
  };
  const closeModal = () => {
    setModalVisible(false);
    const today = new Date();
    localStorage.setItem(dismissalKey, today);
    setLastDismissed(today);
  };

  const getMostRecentThursday = date => {
    const mostRecentThursday = new Date(date);
    if (date.getDay() === 4) {
      // If today is Thursday, return today's date
      mostRecentThursday.setHours(0, 0, 0, 0);
      return mostRecentThursday;
    }
    // Otherwise, find the previous Thursday
    mostRecentThursday.setDate(date.getDate() - ((date.getDay() + 3) % 7));
    mostRecentThursday.setHours(0, 0, 0, 0);
    return mostRecentThursday;
  };

  const loadUserDashboardProfile = async () => {
    if (!userId || hasProfileLoaded) return;
    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const newUserProfile = response.data;
      setUserDashboardProfile(newUserProfile);
      setHasProfileLoaded(true); // Set flag to true after loading the profile
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('User Profile not loaded.', err);
    }
  };

  useEffect(() => {
    loadUserDashboardProfile();

    if (user.role === 'Owner' || user.role === 'Administrator' || user.role === 'Mentor') {
      setModalVisible(false);
      return;
    }

    const today = new Date();
    const lastDismissedDate = lastDismissed ? new Date(lastDismissed) : null;

    // Check if lastDismissed date is ahead of today
    if (lastDismissedDate > today) {
      // Clear lastDismissed in both the state and localStorage
      setLastDismissed(null);
      localStorage.removeItem(dismissalKey);
    }

    // Check if today is Thursday or the stored date is before the most recent Thursday
    if (!lastDismissed || lastDismissedDate < getMostRecentThursday(today)) {
      if (userDashboardProfile?.teams?.length > 0) {
        if (user.role === 'Assistant Manager' || user.role === 'Volunteer') {
          setModalVisible(true);
          // Assistant Manager or Volunteer message
          setModalContent(
            `If you are seeing this, it’s because you are on a team! As a member of a team, you need to turn in your work 24 hours earlier, i.e. FRIDAY night at midnight Pacific Time. This is so your manager has time to review it and submit and report on your entire team’s work by the usual Saturday night deadline. For any work you plan on completing Saturday, please take pictures as best you can and include it in your summary as if it were already done.\n\nBy dismissing this notice, you acknowledge you understand and will do this.`,
          );
        } else if (user.role === 'Manager') {
          setModalVisible(true);
          // Manager message
          setModalContent(`If you are seeing this, it’s because you are a Manager of a team! Remember to turn in your team’s work by the Saturday night at midnight (Pacific Time) deadline. Every member of your team gets a notice like this too. Theirs tells them to get you their work 24 hours early so you have time to review it and submit it. If you have to remind them repeatedly (4+ times, track it on their Google Doc), they should receive a blue square.
          `);
        }
      }
    } else {
      setModalVisible(false);
    }
  }, [lastDismissed, userId, userDashboardProfile]);
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
  
    loadUserDashboardProfile();
  
    const fetchUpcomingMeeting = async () => {
      try {
        const response = await axios.get(`http://localhost:4500/api/meetings/participant/${userId}`);
        if (response.status === 200) {
          const { lastMeeting, organizerName } = response.data;
          const { dateTime, notes, locationDetails } = lastMeeting;
          const formattedDate = new Date(dateTime).toLocaleString();
  
          setModalVisible(true);
          setModalContents(
            `This is your upcoming meeting with ${organizerName} on ${formattedDate} regarding: ${notes}.
            At Location: ${locationDetails}`,
          );
        } else {
          setModalVisible(false);
        }
      } catch (_) {
        // Do nothing (just pass)
        setModalVisible(false); // optional fallback
      }
    };
  
    fetchUpcomingMeeting();
  }, [lastDismissed, userId, userDashboardProfile]);

  const fontColor = darkMode ? 'text-white dropdown-item-hover' : '';

  if (location.pathname === '/login') return null;

  return (
    <div className="header-wrapper">
      <Navbar className="py-3 navbar" color="dark" dark expand="md">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}
        <div
          className="timer-message-section"
          style={user.role === 'Owner' ? { marginRight: '0.5rem' } : { marginRight: '1rem' }}
        >
          {isAuthenticated && <Timer darkMode={darkMode} />}
          {isAuthenticated && (
            <div className="owner-message">
              <OwnerMessage />
            </div>
          )}
        </div>
        <NavbarToggler onClick={toggle} />
        {isAuthenticated && (
          <Collapse isOpen={isOpen} navbar>
            <Nav className="ml-auto nav-links" navbar>
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ width: '100%' }}
              >
                {canUpdateTask && (
                  <NavItem className="responsive-spacing">
                    <NavLink tag={Link} to="/taskeditsuggestions">
                      <div className="redBackGroupHeader">
                        <span>{props.taskEditSuggestionCount}</span>
                      </div>
                    </NavLink>
                  </NavItem>
                )}
                <NavItem className="responsive-spacing">
                  <NavLink tag={Link} to="/dashboard">
                    <span className="dashboard-text-link">{DASHBOARD}</span>
                  </NavLink>
                </NavItem>
                <NavItem className="responsive-spacing">
                  <NavLink tag={Link} to="/timelog">
                    <span className="dashboard-text-link">{TIMELOG}</span>
                  </NavLink>
                </NavItem>
              </div>
              <div className="d-flex align-items-center justify-content-center">
                {canGetReports || canGetWeeklySummaries || canGetWeeklyVolunteerSummary ? (
                  <UncontrolledDropdown nav inNavbar className="responsive-spacing">
                    <DropdownToggle nav caret>
                      <span className="dashboard-text-link">{REPORTS}</span>
                    </DropdownToggle>
                    <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
                      {canGetReports && (
                        <DropdownItem tag={Link} to="/reports" className={`${fontColor}`}>
                          {REPORTS}
                        </DropdownItem>
                      )}
                      {canGetWeeklySummaries && (
                        <DropdownItem tag={Link} to="/weeklysummariesreport" className={fontColor}>
                          {WEEKLY_SUMMARIES_REPORT}
                        </DropdownItem>
                      )}
                      {canGetWeeklyVolunteerSummary && (
                        <DropdownItem tag={Link} to="/totalorgsummary" className={fontColor}>
                          {TOTAL_ORG_SUMMARY}
                        </DropdownItem>
                      )}
                      <DropdownItem tag={Link} to="/teamlocations" className={fontColor}>
                        {TEAM_LOCATIONS}
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                ) : (
                  <NavItem className="responsive-spacing">
                    <NavLink tag={Link} to="/teamlocations">
                      {TEAM_LOCATIONS}
                    </NavLink>
                  </NavItem>
                )}
                <NavItem className="responsive-spacing">
                  <NavLink tag={Link} to={`/timelog/${displayUserId}`}>
                    <i className="fa fa-bell i-large">
                      <i className="badge badge-pill badge-danger badge-notify">
                        {/* Pull number of unread messages */}
                      </i>
                      <span className="sr-only">unread messages</span>
                    </i>
                  </NavLink>
                </NavItem>
                {(canAccessUserManagement ||
                  canAccessBadgeManagement ||
                  canAccessProjects ||
                  canAccessTeams ||
                  canAccessPopups ||
                  canAccessSendEmails ||
                  canAccessScheduleMeetings ||
                  canAccessPermissionsManagement) && (
                  <UncontrolledDropdown nav inNavbar className="responsive-spacing">
                    <DropdownToggle nav caret>
                      <span className="dashboard-text-link">{OTHER_LINKS}</span>
                    </DropdownToggle>
                    <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
                      {canAccessUserManagement ? (
                        <DropdownItem tag={Link} to="/usermanagement" className={fontColor}>
                          {USER_MANAGEMENT}
                        </DropdownItem>
                      ) : (
                        `null`
                      )}
                      {canAccessBadgeManagement ? (
                        <DropdownItem tag={Link} to="/badgemanagement" className={fontColor}>
                          {BADGE_MANAGEMENT}
                        </DropdownItem>
                      ) : (
                        `null`
                      )}
                      {canAccessProjects && (
                        <DropdownItem tag={Link} to="/projects" className={fontColor}>
                          {PROJECTS}
                        </DropdownItem>
                      )}
                      {canAccessTeams && (
                        <DropdownItem tag={Link} to="/teams" className={fontColor}>
                          {TEAMS}
                        </DropdownItem>
                      )}
                      {canAccessSendEmails && (
                        <DropdownItem tag={Link} to="/announcements" className={fontColor}>
                          {SEND_EMAILS}
                        </DropdownItem>
                      )}
                      {canAccessScheduleMeetings && (
                        <DropdownItem tag={Link} to="/schedulemeetings" className={fontColor}>
                          {SCHEDULE_MEETINGS}
                        </DropdownItem>
                      )}
                      {canAccessPermissionsManagement && (
                        <>
                          <DropdownItem divider />
                          <DropdownItem
                            tag={Link}
                            to="/permissionsmanagement"
                            className={fontColor}
                          >
                            {PERMISSIONS_MANAGEMENT}
                          </DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}
                <NavItem className="responsive-spacing">
                  <NavLink tag={Link} to={`/userprofile/${displayUserId}`}>
                    <img
                      src={`${profilePic || '/pfp-default-header.png'}`}
                      alt=""
                      style={{ maxWidth: '60px', maxHeight: '60px' }}
                      className="dashboardimg"
                    />
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav className="responsive-spacing">
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">
                      {WELCOME}, {firstName}
                    </span>
                  </DropdownToggle>
                  <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <DropdownItem header className={darkMode ? 'text-custom-grey' : ''}>
                      Hello {firstName}
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem
                      tag={Link}
                      to={`/userprofile/${displayUserId}`}
                      className={fontColor}
                    >
                      {VIEW_PROFILE}
                    </DropdownItem>
                    {!cantUpdateDevAdminDetails(
                      props.userProfile.email,
                      props.userProfile.email,
                    ) && (
                      <DropdownItem
                        tag={Link}
                        to={`/updatepassword/${displayUserId}`}
                        className={fontColor}
                      >
                        {UPDATE_PASSWORD}
                      </DropdownItem>
                    )}
                    <DropdownItem className={fontColor}>
                      <DarkModeButton />
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={openModal} className={fontColor}>
                      {LOGOUT}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </Nav>
          </Collapse>
        )}
      </Navbar>
      {!isAuthUser && (
        <PopUpBar
          onClickClose={() => setPopup(prevPopup => !prevPopup)}
          viewingUser={JSON.parse(window.sessionStorage.getItem('viewingUser'))}
        />
      )}
      <div>
        <Modal isOpen={popup} className={darkMode ? 'text-light' : ''}>
          <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>
            Return to your Dashboard
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            <p>Are you sure you wish to return to your own dashboard?</p>
          </ModalBody>
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
            <Button variant="primary" onClick={removeViewingUser}>
              Ok
            </Button>{' '}
            <Button variant="secondary" onClick={() => setPopup(prevPopup => !prevPopup)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      {props.auth.isAuthenticated && isModalVisible && (
        <Card color="primary">
          <div className="close-button">
            <Button close onClick={closeModal} />
          </div>
          <div className="card-content">{modalContent}</div>
        </Card>
      )}
      <div>
        {props.auth.isAuthenticated && isModalVisible && (
          <Card color="warning">
            <div className="close-button">
              <Button close onClick={closeModal} />
            </div>
            <div className="card-contents">{modalContents}</div>
          </Card>
        )}
      </div>
      {/* Only render one unread message at a time */}
      {props.auth.isAuthenticated && unreadNotifications?.length > 0 ? (
        <NotificationCard
          key={unreadNotifications[0]._id || 'default-key'}
          notification={unreadNotifications[0]}
        />
      ) : null}
      <audio
        ref={MeetingNotificationAudioRef}
        key="meetingNotificationAudio"
        // loop
        preload="auto"
        src="https://bigsoundbank.com/UPLOAD/mp3/2554.mp3"
      >
        <track kind="captions" />
      </audio>
      <Modal
        isOpen={meetingModalOpen}
        toggle={handleMeetingRead}
        className={darkMode ? 'text-light' : ''}
      >
        <ModalHeader toggle={handleMeetingRead} className={darkMode ? 'bg-space-cadet' : ''}>
          Meeting Notification
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div style={{ lineHeight: '2' }}>
            <p>{parse(DOMPurify.sanitize(meetingModalMessage))}</p>
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-space-cadet' : ''}>
          <Button
            color="primary"
            onClick={handleMeetingRead}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  taskEditSuggestionCount: state.taskEditSuggestions.count,
  role: state.role,
  notification: state.notification,
  unreadNotifications: state.notification.unreadNotifications,
  unreadMeetingNotifications: state.meetingNotification.unreadMeetingNotifications,
  allUserProfiles: state.allUserProfiles.userProfiles,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {
  getHeaderData,
  getAllRoles,
  hasPermission,
  getWeeklySummaries,
})(Header);
