import axios from 'axios';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown
} from 'reactstrap';
import { FaCubes, FaShoppingCart, FaTools, FaRecycle, FaWrench, FaRulerCombined } from 'react-icons/fa';
import { getWeeklySummaries } from '~/actions/weeklySummaries';
import PopUpBar from '~/components/PopUpBar';
import { fetchTaskEditSuggestions } from '~/components/TaskEditSuggestions/thunks';
import { ENDPOINTS } from '~/utils/URL';
import httpService from '../../services/httpService';
import { getHeaderData } from '../../actions/authActions';
import {
  getUnreadMeetingNotification,
  markMeetingNotificationAsRead,
} from '../../actions/meetingNotificationAction';
import {
  getUnreadUserNotifications,
  resetNotificationError,
} from '../../actions/notificationAction';
import { getAllRoles } from '../../actions/role';
import { getUserProfile } from '../../actions/userProfile';
import '../../App.module.css';
import { boxStyle, boxStyleDark } from '../../styles';
import {
  ACTUAL_COST_BREAKDOWN,
  BADGE_MANAGEMENT,
  BLUE_SQUARE_EMAIL_MANAGEMENT,
  DASHBOARD,
  JOB_ANALYTICS_REPORT,
  LOGOUT,
  OTHER_LINKS,
  PERMISSIONS_MANAGEMENT,
  PR_PROMOTIONS,
  PROJECTS,
  REPORTS,
  SEND_EMAILS,
  TEAM_LOCATIONS,
  TEAMS,
  TIMELOG,
  TOTAL_CONSTRUCTION_SUMMARY,
  TOTAL_ORG_SUMMARY,
  TOTAL_ORG_SUMMARY_EMAIL,
  UPDATE_PASSWORD,
  USER_MANAGEMENT,
  VIEW_PROFILE,
  WEEKLY_SUMMARIES_REPORT,
  WELCOME,
} from '../../languages/en/ui';
import hasPermission, { cantUpdateDevAdminDetails } from '../../utils/permissions';
import PermissionWatcher from '../Auth/PermissionWatcher';
import Logout from '../Logout/Logout';
import NotificationCard from '../Notification/notificationCard';
import OwnerMessage from '../OwnerMessage/OwnerMessage';
import DisplayBox from '../PRPromotions/DisplayBox';
import Timer from '../Timer/Timer';
import BellNotification from './BellNotification';
import DarkModeButton from './DarkModeButton';
import styles from './Header.module.css';
import {
  formatMeetingDateTime,
  formatMeetingDuration,
  resolveUserTimeZone,
  stripHtmlToPlainText,
} from '../../utils/meetingTime';

const buildMeetingDetailsMessageHtml = (
  currMeeting,
  organizerName,
  totalMeetings,
  meetingIndex,
  viewerTimeZone,
  getMeetingCountLabel,
) => {
  const cleanNotes = stripHtmlToPlainText(currMeeting.notes);
  const countLabel = getMeetingCountLabel(totalMeetings, meetingIndex);
  const durationLabel = formatMeetingDuration(currMeeting.duration);
  const messageParts = [
    `Reminder: You have an upcoming meeting${countLabel}! Please check the details and be prepared.<br>`,
    `<strong>Time:</strong> ${formatMeetingDateTime(currMeeting.dateTime, viewerTimeZone)}<br>`,
  ];

  if (durationLabel) {
    messageParts.push(`<strong>Duration:</strong> ${durationLabel}<br>`);
  }

  messageParts.push(`<strong>Organizer:</strong> ${organizerName}<br>`);

  if (currMeeting.location) {
    messageParts.push(`<strong>Location:</strong> ${currMeeting.location}<br>`);
  }
  if (cleanNotes) {
    messageParts.push(`<strong>Notes:</strong> ${cleanNotes}<br>`);
  }

  return messageParts.join('');
};

function MeetingNotificationModalHeader({ children, onClose }) {
  return (
    <div className={styles.meetingNotificationCustomHeader}>
      <h5 className={styles.meetingNotificationCustomHeaderTitle}>{children}</h5>
      <button
        type="button"
        className={styles.meetingNotificationCustomHeaderClose}
        onClick={onClose}
        aria-label="Close"
      >
        <span aria-hidden="true">&#215;</span>
      </button>
    </div>
  );
}

MeetingNotificationModalHeader.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

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
  const collapseRef = useRef(null);
  const toggleRef = useRef(null);
  const [isAckLoading, setIsAckLoading] = useState(false);
  const [showPromotionsPopup, setShowPromotionsPopup] = useState(false);

  // BM Dashboard accordion state
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [bmProjectsOpen, setBmProjectsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const resetBMAccordion = () => {
    setBmProjectsOpen(false);
    setExpandedSection(null);
  };

  const ALLOWED_ROLES_TO_INTERACT = useMemo(() => ['Owner', 'Administrator'], []);
  const canInteractWithViewingUser = useMemo(
    () => ALLOWED_ROLES_TO_INTERACT.includes(props.auth.user.role),
    [ALLOWED_ROLES_TO_INTERACT, props.auth.user.role],
  );
  const headerDisabled = isAuthUser ? false : !canInteractWithViewingUser;

  const canGetReports = props.hasPermission('getReports', !isAuthUser);
  const canGetWeeklySummaries = props.hasPermission('getWeeklySummaries', !isAuthUser);
  const canGetWeeklyVolunteerSummary = props.hasPermission('getWeeklySummaries');
  const canGetJobAnalytics = props.hasPermission('getJobReports');

  const canAccessUserManagement =
    props.hasPermission('postUserProfile', !isAuthUser) ||
    props.hasPermission('deleteUserProfile', !isAuthUser) ||
    props.hasPermission('changeUserStatus', !isAuthUser) ||
    props.hasPermission('getUserProfiles', !isAuthUser) ||
    props.hasPermission('setFinalDay', !isAuthUser) ||
    props.hasPermission('interactWithPauseUserButton', !isAuthUser);

  const canAccessBadgeManagement =
    props.hasPermission('seeBadges', !isAuthUser) ||
    props.hasPermission('createBadges', !isAuthUser) ||
    props.hasPermission('updateBadges', !isAuthUser) ||
    props.hasPermission('deleteBadges', !isAuthUser);

  const canAccessProjects =
    props.hasPermission('postProject', !isAuthUser) ||
    props.hasPermission('deleteProject', !isAuthUser) ||
    props.hasPermission('putProject', !isAuthUser) ||
    props.hasPermission('getProjectMembers', !isAuthUser) ||
    props.hasPermission('assignProjectToUsers', !isAuthUser) ||
    props.hasPermission('postWbs', !isAuthUser) ||
    props.hasPermission('deleteWbs', !isAuthUser) ||
    props.hasPermission('postTask', !isAuthUser) ||
    props.hasPermission('updateTask', !isAuthUser) ||
    props.hasPermission('deleteTask', !isAuthUser);

  const canUpdateTask = props.hasPermission('updateTask', !isAuthUser);

  const canAccessTeams =
    props.hasPermission('postTeam', !isAuthUser) ||
    props.hasPermission('putTeam', !isAuthUser) ||
    props.hasPermission('deleteTeam', !isAuthUser) ||
    props.hasPermission('assignTeamToUsers', !isAuthUser);

  const canAccessPopups =
    props.hasPermission('createPopup', !isAuthUser) ||
    props.hasPermission('updatePopup', !isAuthUser);

  const canAccessSendEmails = props.hasPermission('sendEmails', !isAuthUser);

  const canAccessPermissionsManagement =
    props.hasPermission('postRole', !isAuthUser) ||
    props.hasPermission('putRole', !isAuthUser) ||
    props.hasPermission('deleteRole', !isAuthUser) ||
    props.hasPermission('putUserProfilePermissions', !isAuthUser);

  const canAccessBlueSquareEmailManagement = props.hasPermission('resendBlueSquareAndSummaryEmails', !isAuthUser);
  const canAccessPRDashboard = props.hasPermission('accessPRTeamDashboard', !isAuthUser);

  const userId = user.userid;
  const viewerTimeZone = resolveUserTimeZone(props.userProfile?.timeZone);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [meetingContents, setMeetingContents] = useState([]);
  const [meetingContentsNotification, setMeetingContentsNotification] = useState(false);
  const [userDashboardProfile, setUserDashboardProfile] = useState(undefined);
  const [hasProfileLoaded, setHasProfileLoaded] = useState(false);
  const dismissalKey = `lastDismissed_${userId}`;
  const [lastDismissed, setLastDismissed] = useState(localStorage.getItem(dismissalKey));
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingModalMessage, setMeetingModalMessage] = useState('');
  const [activeMeetingModalIndex, setActiveMeetingModalIndex] = useState(0);
  const [meetingCalendarLinks, setMeetingCalendarLinks] = useState(null);
  const [meetingAudioUnlocked, setMeetingAudioUnlocked] = useState(
    () => sessionStorage.getItem('meetingAudioUnlocked') === 'true',
  );
  const { allUserProfiles, unreadMeetingNotifications } = props;
  const userUnreadMeetings = useMemo(
    () =>
      unreadMeetingNotifications?.filter(
        meeting => String(meeting.recipient) === String(userId),
      ) || [],
    [unreadMeetingNotifications, userId],
  );
  const unreadNotifications = props.notification?.unreadNotifications;
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    const path = location.pathname;
    // BM Projects accordion: any BM dashboard route.
    setShowProjectDropdown(path === '/bmdashboard' || path.startsWith('/bmdashboard/'));
  }, [location.pathname]);

  // Injuries Tracking should only show in real BM Dashboard context — not on Report
  // pages that happen to live under /bmdashboard/* (e.g. Total Construction Summary).
  const showInjuriesTrackingLink = useMemo(() => {
    const path = location.pathname;
    if (path === '/bmdashboard' || path === '/bmdashboard/') return true;
    if (path.startsWith('/bmdashboard/injurychart')) return true;
    if (!path.startsWith('/bmdashboard/')) return false;
    const excludedPrefixes = ['/bmdashboard/totalconstructionsummary'];
    return !excludedPrefixes.some(prefix => path.startsWith(prefix));
  }, [location.pathname]);
  const MeetingNotificationAudioRef = useRef(null);
  const dismissedMeetingModalIdRef = useRef(null);
  const preventMeetingModalAutoOpenRef = useRef(false);
  const organizerNameCacheRef = useRef({});

  const resolveOrganizerName = useCallback(
    async organizerId => {
      if (!organizerId) return 'Unknown';

      const key = String(organizerId);
      if (organizerNameCacheRef.current[key]) {
        return organizerNameCacheRef.current[key];
      }

      const fromList = allUserProfiles?.find(profile => String(profile._id) === key);
      if (fromList) {
        const name = `${fromList.firstName} ${fromList.lastName}`.trim();
        organizerNameCacheRef.current[key] = name;
        return name;
      }

      try {
        const { data } = await httpService.get(ENDPOINTS.USER_PROFILE(key));
        const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown';
        organizerNameCacheRef.current[key] = name;
        return name;
      } catch {
        return 'Unknown';
      }
    },
    [allUserProfiles],
  );

  const pauseMeetingAudio = useCallback(() => {
    if (!MeetingNotificationAudioRef.current) return;
    try {
      MeetingNotificationAudioRef.current.pause();
      MeetingNotificationAudioRef.current.currentTime = 0;
    } catch {
      // jsdom does not implement HTMLMediaElement.pause
    }
  }, []);

  const playMeetingAudio = useCallback(() => {
    if (!MeetingNotificationAudioRef.current) return;
    MeetingNotificationAudioRef.current.play().catch(() => {});
  }, []);

  const getMeetingCountLabel = useCallback((totalMeetings, meetingIndex = 1) => {
    if (totalMeetings <= 1) return '';
    return ` (${meetingIndex} of ${totalMeetings})`;
  }, []);

  const clearMeetingCalendarLinks = useCallback(() => {
    setMeetingCalendarLinks(prev => {
      if (prev?.icsUrl) {
        URL.revokeObjectURL(prev.icsUrl);
      }
      return null;
    });
  }, []);

  const revokeMeetingBarUrls = useCallback(items => {
    items.forEach(item => {
      if (item?.icsUrl) {
        URL.revokeObjectURL(item.icsUrl);
      }
    });
  }, []);

  const buildCompactBarMessage = useCallback(
    (meeting, organizerName, calendarData) => {
      const formattedDate = formatMeetingDateTime(meeting.dateTime, viewerTimeZone);
      const locationPart = meeting.location ? ` · ${meeting.location}` : '';
      const linksPart = calendarData
        ? ` · <a href="${calendarData.googleCalendarLink}" target="_blank" rel="noreferrer">Google Calendar</a><span class="meeting-popup-action-separator"> · </span><a href="${calendarData.icsUrl}" download="meeting.ics">Download .ics</a>`
        : '';

      return `Upcoming meeting: <strong>${formattedDate}</strong> with ${organizerName}${locationPart}${linksPart}`;
    },
    [viewerTimeZone],
  );

  const syncAllMeetingPopupBars = useCallback(
    async meetings => {
      if (!meetings.length) {
        setMeetingContents(prev => {
          revokeMeetingBarUrls(prev);
          return [];
        });
        setMeetingContentsNotification(false);
        return;
      }

      const results = await Promise.all(
        meetings.map(async meeting => {
          const organizerName = await resolveOrganizerName(meeting.sender);
          let calendarData = null;

          try {
            const { data } = await httpService.get(ENDPOINTS.MEETING_CALENDAR(meeting.meetingId));
            const icsBlob = new Blob([data.icsContent], { type: 'text/calendar' });
            calendarData = {
              googleCalendarLink: data.googleCalendarLink,
              icsUrl: URL.createObjectURL(icsBlob),
            };
          } catch {
            // Calendar links are optional for the compact bar.
          }

          return {
            msg: buildCompactBarMessage(meeting, organizerName, calendarData),
            id: meeting.meetingId,
            recipient: meeting.recipient,
            icsUrl: calendarData?.icsUrl || null,
          };
        }),
      );

      setMeetingContents(prev => {
        revokeMeetingBarUrls(prev);
        return results;
      });
      setMeetingContentsNotification(true);
    },
    [buildCompactBarMessage, resolveOrganizerName, revokeMeetingBarUrls],
  );

  const loadMeetingCalendarLinks = useCallback(
    async meetingId => {
      if (!meetingId) {
        clearMeetingCalendarLinks();
        return;
      }

      try {
        const { data } = await httpService.get(ENDPOINTS.MEETING_CALENDAR(meetingId));
        const icsBlob = new Blob([data.icsContent], { type: 'text/calendar' });
        const icsUrl = URL.createObjectURL(icsBlob);

        clearMeetingCalendarLinks();
        setMeetingCalendarLinks({
          googleCalendarLink: data.googleCalendarLink,
          icsUrl,
        });
      } catch {
        clearMeetingCalendarLinks();
      }
    },
    [clearMeetingCalendarLinks],
  );

  const dismissMeetingNotification = useCallback(
    async (meetingId, recipient) => {
      setMeetingContents(prev => {
        const next = prev.filter(item => String(item.id) !== String(meetingId));
        const removed = prev.find(item => String(item.id) === String(meetingId));
        if (removed?.icsUrl) {
          URL.revokeObjectURL(removed.icsUrl);
        }
        setMeetingContentsNotification(next.length > 0);
        return next;
      });

      if (String(userUnreadMeetings[activeMeetingModalIndex]?.meetingId) === String(meetingId)) {
        setMeetingModalOpen(false);
        setMeetingModalMessage('');
        clearMeetingCalendarLinks();
        pauseMeetingAudio();
      }

      await dispatch(markMeetingNotificationAsRead({ meetingId, recipient }));
      dispatch(getUnreadUserNotifications(recipient));
      await dispatch(getUnreadMeetingNotification(userId));
    },
    [
      userUnreadMeetings,
      activeMeetingModalIndex,
      userId,
      dispatch,
      pauseMeetingAudio,
      clearMeetingCalendarLinks,
    ],
  );

  const buildMeetingDetailsMessage = useCallback(
    (currMeeting, organizerName, totalMeetings = 1, meetingIndex = 1) =>
      buildMeetingDetailsMessageHtml(
        currMeeting,
        organizerName,
        totalMeetings,
        meetingIndex,
        viewerTimeZone,
        getMeetingCountLabel,
      ),
    [viewerTimeZone, getMeetingCountLabel],
  );

  const showMeetingModalAtIndex = useCallback(
    async (index, { playSound = false } = {}) => {
      const meeting = userUnreadMeetings[index];
      if (!meeting) return;

      const organizerName = await resolveOrganizerName(meeting.sender);
      const totalMeetings = userUnreadMeetings.length;
      const meetingPosition = index + 1;

      if (meetingAudioUnlocked) {
        setMeetingModalMessage(
          buildMeetingDetailsMessage(meeting, organizerName, totalMeetings, meetingPosition),
        );
        await loadMeetingCalendarLinks(meeting.meetingId);
        if (playSound) {
          playMeetingAudio();
        }
      } else {
        setMeetingModalMessage(
          `You have an upcoming meeting scheduled within the next 3 days${getMeetingCountLabel(totalMeetings, meetingPosition)}.<br>
        Click "Enable Alerts &amp; View Meeting" to enable notification sounds and see meeting details.`,
        );
      }

      setActiveMeetingModalIndex(index);
    },
    [
      userUnreadMeetings,
      meetingAudioUnlocked,
      resolveOrganizerName,
      getMeetingCountLabel,
      buildMeetingDetailsMessage,
      loadMeetingCalendarLinks,
      playMeetingAudio,
    ],
  );

  const openMeetingNotification = useCallback(() => {
    if (userUnreadMeetings.length > 0) {
      preventMeetingModalAutoOpenRef.current = false;
      dismissedMeetingModalIdRef.current = null;
      const modalIndex = Math.min(activeMeetingModalIndex, userUnreadMeetings.length - 1);
      setMeetingModalOpen(true);
      showMeetingModalAtIndex(modalIndex);
    }
  }, [userUnreadMeetings, activeMeetingModalIndex, showMeetingModalAtIndex]);

  const handleMeetingRead = async () => {
    const activeMeeting = userUnreadMeetings[activeMeetingModalIndex];

    if (userUnreadMeetings?.length > 0 && !meetingAudioUnlocked) {
      sessionStorage.setItem('meetingAudioUnlocked', 'true');
      setMeetingAudioUnlocked(true);
      await showMeetingModalAtIndex(activeMeetingModalIndex, { playSound: true });
      return;
    }

    if (activeMeeting) {
      dismissedMeetingModalIdRef.current = String(activeMeeting.meetingId);
      preventMeetingModalAutoOpenRef.current = true;
    }

    setMeetingModalOpen(false);
    pauseMeetingAudio();
  };

  const goToPreviousMeeting = () => {
    if (activeMeetingModalIndex > 0) {
      showMeetingModalAtIndex(activeMeetingModalIndex - 1);
    }
  };

  const goToNextMeeting = () => {
    if (activeMeetingModalIndex < userUnreadMeetings.length - 1) {
      showMeetingModalAtIndex(activeMeetingModalIndex + 1);
    }
  };

  const CloseMeetingContentsNotification = async (meetingId, recipient) => {
    await dismissMeetingNotification(meetingId, recipient);
  };

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
    handleStorageEvent();
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [user.userid, props.auth.firstName]);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // eslint-disable-next-line no-console
      console.log(`[Header Debug] Window resized to: ${currentWidth}px`);
      if (currentWidth >= 1728) {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Large screen (90%+) - Owner message below timer`);
      } else if (currentWidth >= 1400) {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Desktop - Centered layout`);
      } else if (currentWidth >= 1200) {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Medium desktop - Centered layout`);
      } else if (currentWidth >= 768) {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Tablet - Stacked layout`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Mobile - Compact vertical layout`);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (roles.length === 0 && isAuthenticated) props.getAllRoles();
    if (isAuthenticated && user.userid) dispatch(getUnreadUserNotifications(user.userid));
  }, [isAuthenticated, user.userid, roles.length]);

  useEffect(() => {
    if (props.notification?.error) {
      toast.error(props.notification.error.message);
      dispatch(resetNotificationError());
    }
  }, [props.notification?.error]);

  useEffect(() => {
    if (props.meetingNotification?.error) {
      toast.error(props.meetingNotification.error.message);
    }
  }, [props.meetingNotification?.error]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    setMeetingContents([]);
    setMeetingContentsNotification(false);
    setMeetingModalOpen(false);
    setMeetingModalMessage('');

    dispatch(getUnreadUserNotifications(userId));
    dispatch(getUnreadMeetingNotification(userId));
  }, [isAuthenticated, userId, dispatch]);

  useEffect(() => {
    if (!isAuthenticated || !userId || !localStorage.getItem('token')) return;
    dispatch(getUnreadMeetingNotification(userId));
  }, [props.userProfile?.timeZone, isAuthenticated, userId, dispatch]);

  useEffect(() => {
    if (!userUnreadMeetings.length) {
      dismissedMeetingModalIdRef.current = null;
      preventMeetingModalAutoOpenRef.current = false;
      setActiveMeetingModalIndex(0);
      setMeetingModalOpen(false);
      setMeetingModalMessage('');
      setMeetingContents(prev => {
        revokeMeetingBarUrls(prev);
        return [];
      });
      setMeetingContentsNotification(false);
      clearMeetingCalendarLinks();
      pauseMeetingAudio();
      return;
    }

    let cancelled = false;

    const syncNotifications = async () => {
      await syncAllMeetingPopupBars(userUnreadMeetings);
      if (cancelled) return;

      setActiveMeetingModalIndex(prev => Math.min(prev, userUnreadMeetings.length - 1));

      const firstMeeting = userUnreadMeetings[0];
      const shouldAutoOpen =
        !preventMeetingModalAutoOpenRef.current &&
        dismissedMeetingModalIdRef.current !== String(firstMeeting.meetingId);

      if (shouldAutoOpen) {
        await showMeetingModalAtIndex(0, { playSound: meetingAudioUnlocked });
        if (!cancelled) {
          setMeetingModalOpen(true);
        }
      }
    };

    syncNotifications();

    return () => {
      cancelled = true;
    };
  }, [
    userUnreadMeetings,
    meetingAudioUnlocked,
    showMeetingModalAtIndex,
    syncAllMeetingPopupBars,
    clearMeetingCalendarLinks,
    revokeMeetingBarUrls,
    pauseMeetingAudio,
  ]);

  const toggle = () => {
  setIsOpen(prevIsOpen => !prevIsOpen);
};

  const openModal = () => {
    setLogoutPopup(true);
  };

  const handlePermissionChangeAck = async () => {
      setIsAckLoading(true);
      const { firstName: name, lastName, personalLinks, adminLinks, _id } = props.userProfile;
      axios.put(ENDPOINTS.USER_PROFILE(_id), { firstName: name, lastName, personalLinks, adminLinks, isAcknowledged: true })
        .then(() => { setIsAckLoading(false); dispatch(getUserProfile(_id)); });
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
    if (date.getDay() === 4) { mostRecentThursday.setHours(0, 0, 0, 0); return mostRecentThursday; }
    mostRecentThursday.setDate(date.getDate() - ((date.getDay() + 3) % 7));
    mostRecentThursday.setHours(0, 0, 0, 0);
    return mostRecentThursday;
  };

  const loadUserDashboardProfile = async () => {
    if (!userId || hasProfileLoaded) return;
    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      setUserDashboardProfile(response?.data);
      setHasProfileLoaded(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('User Profile not loaded.', err);
    }
  };

  useEffect(() => {
    loadUserDashboardProfile();
    if (user.role === 'Owner' || user.role === 'Administrator' || user.role === 'Mentor') { setModalVisible(false); return; }
    const today = new Date();
    const lastDismissedDate = lastDismissed ? new Date(lastDismissed) : null;
    if (lastDismissedDate > today) { setLastDismissed(null); localStorage.removeItem(dismissalKey); }
    if (!lastDismissed || lastDismissedDate < getMostRecentThursday(today)) {
      if (userDashboardProfile?.teams?.length > 0) {
        if (user.role === 'Assistant Manager' || user.role === 'Volunteer') {
          setModalVisible(true);
          setModalContent(`If you are seeing this, it's because you are on a team! As a member of a team, you need to turn in your work 24 hours earlier, i.e. FRIDAY night at midnight Pacific Time. This is so your manager has time to review it and submit and report on your entire team's work by the usual Saturday night deadline. For any work you plan on completing Saturday, please take pictures as best you can and include it in your summary as if it were already done.\n\nBy dismissing this notice, you acknowledge you understand and will do this.`);
        } else if (user.role === 'Manager') {
          setModalVisible(true);
          setModalContent(`If you are seeing this, it's because you are a Manager of a team! Remember to turn in your team's work by the Saturday night at midnight (Pacific Time) deadline. Every member of your team gets a notice like this too. Theirs tells them to get you their work 24 hours early so you have time to review it and submit it. If you have to remind them repeatedly (4+ times, track it on their Google Doc), they should receive a blue square.`);
        }
      }
    } else { setModalVisible(false); }
  }, [lastDismissed, userId, userDashboardProfile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (collapseRef.current?.contains(event.target)) return;
      if (toggleRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    const timer = setTimeout(() => { document.addEventListener('click', handleClickOutside); }, 0);
    return () => { clearTimeout(timer); document.removeEventListener('click', handleClickOutside); };
  }, [isOpen]);

  const fontColor = darkMode ? `${styles.darkDropdownText} ${styles.darkDropdownItem}` : `${styles.mobileDropdownText} ${styles.mobileDropdownItem}`;

  if (location.pathname === '/login') return null;

  const viewingUser = JSON.parse(window.sessionStorage.getItem('viewingUser'));

  return (
    <div className={`${styles.headerWrapper}`} data-testid="header">
      <Navbar className={`py-3 ${styles.navbar}`} color="dark" dark expand="xl">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}
        {showPromotionsPopup && (
          // Header launches this modal outside the PR Promotions page, so pass the theme explicitly.
          <DisplayBox onClose={() => setShowPromotionsPopup(false)} darkMode={darkMode} />
        )}

        <div className={styles.headerRow}>
          <div className={styles.leftSection}>{isAuthenticated && <Timer darkMode={darkMode} />}</div>
          <div className={styles.centerSection}>{isAuthenticated && <OwnerMessage />}</div>
          <div className={styles.rightSection}>
               
            <NavbarToggler
              onClick={toggle}
              ref={toggleRef}
              className={styles.navbarToggler}
              aria-label="Toggle navigation"
            />
            <div
              ref={collapseRef}
              className={`${styles.navCollapse} ${isOpen ? styles.navCollapseOpen : ''}`}
              role="menu"
              tabIndex={-1}
              onKeyDown={e => { if (e.key === 'Escape') setIsOpen(false); }}
            >
                <Nav className={`ml-auto ${styles.menuContainer} mr-3`} navbar>                
                <NavItem className={styles.showInMobile}>
                  <NavLink tag={Link} to={`/userprofile/${displayUserId}`}>
                    <img src={`${profilePic || '/pfp-default-header.png'}`} alt="" style={{ maxWidth: '60px', maxHeight: '60px' }} className="dashboardimg" />
                  </NavLink>
                </NavItem>

                <UncontrolledDropdown nav inNavbar className={styles.showInMobile}>
                  <DropdownToggle nav caret><span>{WELCOME}, {firstName}</span></DropdownToggle>
                  <DropdownMenu className={`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`}>
                    <DropdownItem tag={Link} to={`/userprofile/${displayUserId}`} className={fontColor}>{VIEW_PROFILE}</DropdownItem>
                    {!cantUpdateDevAdminDetails(props.userProfile.email, props.userProfile.email) && (
                      <DropdownItem tag={Link} to={`/updatepassword/${displayUserId}`} className={fontColor}>{UPDATE_PASSWORD}</DropdownItem>
                    )}
                    <DropdownItem className={fontColor}><DarkModeButton /></DropdownItem>
                    <DropdownItem onClick={openModal} className={fontColor}>{LOGOUT}</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>

                {canUpdateTask && (
                  <NavItem>
                    <NavLink tag={Link} to="/taskeditsuggestions" disabled={headerDisabled}>
                      <div className={`${styles.redBackGroupHeader} ${styles.hideInMobile}`}><span>{props.taskEditSuggestionCount}</span></div>
                      <span className={styles.showInMobile}>Task Edit Suggestion ({props.taskEditSuggestionCount})</span>
                    </NavLink>
                  </NavItem>
                )}

                <NavItem>
                  <NavLink tag={Link} to="/dashboard" disabled={headerDisabled}><span>{DASHBOARD}</span></NavLink>
                </NavItem>

                <NavItem>
                  <NavLink tag={Link} to="/timelog#currentWeek" disabled={headerDisabled}><span>{TIMELOG}</span></NavLink>
                </NavItem>

                {canGetReports || canGetWeeklySummaries || canGetWeeklyVolunteerSummary ? (
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret><span>{REPORTS}</span></DropdownToggle>
                    <DropdownMenu className={`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`}>
                      {canGetReports && <DropdownItem tag={Link} to="/reports" className={fontColor} disabled={headerDisabled}>{REPORTS}</DropdownItem>}
                      {canGetWeeklySummaries && <DropdownItem tag={Link} to="/weeklysummariesreport" className={fontColor} disabled={headerDisabled}>{WEEKLY_SUMMARIES_REPORT}</DropdownItem>}
                      {canGetWeeklyVolunteerSummary && <DropdownItem tag={Link} to="/totalorgsummary" className={fontColor} disabled={headerDisabled}>{TOTAL_ORG_SUMMARY}</DropdownItem>}
                      <DropdownItem tag={Link} to="/actual-cost-breakdown" className={fontColor} disabled={headerDisabled}>{ACTUAL_COST_BREAKDOWN}</DropdownItem>
                      {canGetWeeklyVolunteerSummary && <DropdownItem tag={Link} to="/TotalOrgSummaryEmail" className={fontColor}>{TOTAL_ORG_SUMMARY_EMAIL}</DropdownItem>}
                      {canGetJobAnalytics && <DropdownItem tag={Link} to="/application/analytics" className={fontColor} disabled={headerDisabled}>{JOB_ANALYTICS_REPORT}</DropdownItem>}
                      <DropdownItem tag={Link} to="/teamlocations" className={fontColor} disabled={headerDisabled}>{TEAM_LOCATIONS}</DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/totalconstructionsummary" className={fontColor} disabled={headerDisabled}>{TOTAL_CONSTRUCTION_SUMMARY}</DropdownItem>
                      <DropdownItem onClick={() => setShowPromotionsPopup(true)} className={fontColor} disabled={headerDisabled}>{PR_PROMOTIONS}</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                ) : (
                  <NavItem>
                    <NavLink tag={Link} to="/teamlocations" disabled={headerDisabled}><span>{TEAM_LOCATIONS}</span></NavLink>
                  </NavItem>
                )}

                {(canAccessUserManagement || canAccessBadgeManagement || canAccessProjects || canAccessTeams || canAccessPopups || canAccessSendEmails || canAccessPermissionsManagement || canAccessBlueSquareEmailManagement) && (
                  <UncontrolledDropdown
                    nav
                    inNavbar
                    onToggle={(event, isDropdownOpen) => { if (!isDropdownOpen) resetBMAccordion(); }}
                  >
                    <DropdownToggle nav caret><span>{OTHER_LINKS}</span></DropdownToggle>
                    <DropdownMenu className={`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`}>
                      {canAccessUserManagement && <DropdownItem tag={Link} to="/usermanagement" className={fontColor} disabled={headerDisabled}>{USER_MANAGEMENT}</DropdownItem>}
                      {canAccessBadgeManagement && <DropdownItem tag={Link} to="/badgemanagement" className={fontColor} disabled={headerDisabled}>{BADGE_MANAGEMENT}</DropdownItem>}
                      {canAccessProjects && <DropdownItem tag={Link} to="/projects" className={fontColor} disabled={headerDisabled}>{PROJECTS}</DropdownItem>}
                      {canAccessTeams && <DropdownItem tag={Link} to="/teams" className={fontColor} disabled={headerDisabled}>{TEAMS}</DropdownItem>}
                      {canAccessSendEmails && <DropdownItem tag={Link} to="/announcements" className={fontColor} disabled={headerDisabled}>{SEND_EMAILS}</DropdownItem>}
                      {canAccessPermissionsManagement && (
                        <>
                          <DropdownItem divider className={styles.hideInMobile} />
                          <DropdownItem tag={Link} to="/permissionsmanagement" className={fontColor} disabled={headerDisabled}>{PERMISSIONS_MANAGEMENT}</DropdownItem>
                        </>
                      )}
                      {canAccessBlueSquareEmailManagement && (
                        <DropdownItem tag={Link} to="/bluesquare-email-management" className={fontColor} disabled={headerDisabled}>{BLUE_SQUARE_EMAIL_MANAGEMENT}</DropdownItem>
                      )}

                      {/* ── BM Dashboard Section ── */}
                      <DropdownItem divider />

                      {/* BM Dashboard main link */}
                      <DropdownItem tag={Link} to="/bmdashboard" className={fontColor}>
                        BM Dashboard
                      </DropdownItem>

                      {/* Visible only in BM Dashboard context; route stays /bmdashboard/injurychart. */}
                      {showInjuriesTrackingLink && (
                        <DropdownItem
                          tag={Link}
                          to="/bmdashboard/injurychart"
                          className={`${fontColor} ${styles.bmSubItem}`}
                        >
                          Injuries Tracking
                        </DropdownItem>
                      )}

                      {/* BM Projects accordion — only shown when on a bmdashboard route */}
                      {showProjectDropdown && (
                        <>
                          {/* BM Projects toggle */}
                          <DropdownItem
                            toggle={false}
                            className={`${fontColor} ${styles.accordionToggle}`}
                            onClick={() => { setBmProjectsOpen(prev => !prev); setExpandedSection(null); }}
                          >
                            <span>BM Projects</span>
                            <span className={`${styles.accordionArrow} ${bmProjectsOpen ? styles.accordionArrowOpen : ''}`} />
                          </DropdownItem>

                          {bmProjectsOpen && (
                            <>
                              {/* All Inventory Types */}
                              <DropdownItem tag={Link} to="/bmdashboard/inventorytypes" className={`${fontColor} ${styles.bmSubItem}`}>
                                All Inventory Types
                              </DropdownItem>

                              {/* Materials */}
                              <DropdownItem toggle={false} className={`${fontColor} ${styles.bmSubItem} ${styles.accordionToggle}`} onClick={() => toggleSection('materials')}>
                                <span className={styles.bmIconLabel}><FaCubes className={styles.bmIcon} /> Materials</span>
                                <span className={`${styles.accordionArrow} ${expandedSection === 'materials' ? styles.accordionArrowOpen : ''}`} />
                              </DropdownItem>
                              {expandedSection === 'materials' && (
                                <>
                                  <DropdownItem tag={Link} to="/bmdashboard/materials" className={`${fontColor} ${styles.bmSubSubItem}`}>Material List</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/materials/add" className={`${fontColor} ${styles.bmSubSubItem}`}>Add Material</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/logMaterial" className={`${fontColor} ${styles.bmSubSubItem}`}>Log Material</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/materials/update" className={`${fontColor} ${styles.bmSubSubItem}`}>Update Materials</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/materials/purchase" className={`${fontColor} ${styles.bmSubSubItem}`}>Purchase Materials</DropdownItem>
                                </>
                              )}

                              {/* Consumables */}
                              <DropdownItem toggle={false} className={`${fontColor} ${styles.bmSubItem} ${styles.accordionToggle}`} onClick={() => toggleSection('consumables')}>
                                <span className={styles.bmIconLabel}><FaShoppingCart className={styles.bmIcon} /> Consumables</span>
                                <span className={`${styles.accordionArrow} ${expandedSection === 'consumables' ? styles.accordionArrowOpen : ''}`} />
                              </DropdownItem>
                              {expandedSection === 'consumables' && (
                                <>
                                  <DropdownItem tag={Link} to="/bmdashboard/consumables" className={`${fontColor} ${styles.bmSubSubItem}`}>Consumable List</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/consumables/add" className={`${fontColor} ${styles.bmSubSubItem}`}>Add Consumable</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/consumables/purchase" className={`${fontColor} ${styles.bmSubSubItem}`}>Purchase Consumables</DropdownItem>
                                </>
                              )}

                              {/* Equipment */}
                              <DropdownItem toggle={false} className={`${fontColor} ${styles.bmSubItem} ${styles.accordionToggle}`} onClick={() => toggleSection('equipment')}>
                                <span className={styles.bmIconLabel}><FaTools className={styles.bmIcon} /> Equipment</span>
                                <span className={`${styles.accordionArrow} ${expandedSection === 'equipment' ? styles.accordionArrowOpen : ''}`} />
                              </DropdownItem>
                              {expandedSection === 'equipment' && (
                                <>
                                  <DropdownItem tag={Link} to="/bmdashboard/equipment" className={`${fontColor} ${styles.bmSubSubItem}`}>Equipment List</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/equipment/add" className={`${fontColor} ${styles.bmSubSubItem}`}>Add Equipment</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/equipment/purchase" className={`${fontColor} ${styles.bmSubSubItem}`}>Purchase Equipment</DropdownItem>
                                </>
                              )}

                              {/* Reusables */}
                              <DropdownItem toggle={false} className={`${fontColor} ${styles.bmSubItem} ${styles.accordionToggle}`} onClick={() => toggleSection('reusables')}>
                                <span className={styles.bmIconLabel}><FaRecycle className={styles.bmIcon} /> Reusables</span>
                                <span className={`${styles.accordionArrow} ${expandedSection === 'reusables' ? styles.accordionArrowOpen : ''}`} />
                              </DropdownItem>
                              {expandedSection === 'reusables' && (
                                <>
                                  <DropdownItem tag={Link} to="/bmdashboard/reusables" className={`${fontColor} ${styles.bmSubSubItem}`}>Reusable List</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/reusables/update" className={`${fontColor} ${styles.bmSubSubItem}`}>Update Reusables</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/reusables/purchase" className={`${fontColor} ${styles.bmSubSubItem}`}>Purchase Reusables</DropdownItem>
                                </>
                              )}

                              {/* Tools */}
                              <DropdownItem toggle={false} className={`${fontColor} ${styles.bmSubItem} ${styles.accordionToggle}`} onClick={() => toggleSection('tools')}>
                                <span className={styles.bmIconLabel}><FaWrench className={styles.bmIcon} /> Tools</span>
                                <span className={`${styles.accordionArrow} ${expandedSection === 'tools' ? styles.accordionArrowOpen : ''}`} />
                              </DropdownItem>
                              {expandedSection === 'tools' && (
                                <>
                                  <DropdownItem tag={Link} to="/bmdashboard/tools" className={`${fontColor} ${styles.bmSubSubItem}`}>Tool List</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/tools/add" className={`${fontColor} ${styles.bmSubSubItem}`}>Add Tool</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/tools/log" className={`${fontColor} ${styles.bmSubSubItem}`}>Log Tools</DropdownItem>
                                  <DropdownItem tag={Link} to="/bmdashboard/tools/purchase" className={`${fontColor} ${styles.bmSubSubItem}`}>Purchase Tools</DropdownItem>
                                </>
                              )}

                              {/* Unit of Measurement */}
                              <DropdownItem tag={Link} to="/bmdashboard/units" className={`${fontColor} ${styles.bmSubItem}`}>
                                <span className={styles.bmIconLabel}><FaRulerCombined className={styles.bmIcon} /> Unit of Measurement</span>
                              </DropdownItem>


                              {/* Other BM pages */}
                              <DropdownItem tag={Link} to="/bmdashboard/Issue" className={`${fontColor} ${styles.bmSubItem}`}>Issues</DropdownItem>
                              <DropdownItem tag={Link} to="/bmdashboard/lessonform" className={`${fontColor} ${styles.bmSubItem}`}>Lessons</DropdownItem>
                              <DropdownItem tag={Link} to="/teams" className={`${fontColor} ${styles.bmSubItem}`}>Teams</DropdownItem>
                            </>
                          )}
                        </>
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}

                {canAccessPRDashboard && (
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret><span>PR Dashboard</span></DropdownToggle>
                    <DropdownMenu className={`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`}>
                      <DropdownItem tag={Link} to="/pr-dashboard" className={fontColor} disabled={headerDisabled}>PR Team Analysis Dashboard</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem tag={Link} to="/pr-dashboard/overview" className={fontColor} disabled={headerDisabled}>PR Team Analytics</DropdownItem>
                      <DropdownItem tag={Link} to="/pr-dashboard/analytics" className={fontColor} disabled={headerDisabled}>PR Analytics</DropdownItem>
                      <DropdownItem
                        tag={Link}
                        to="/pr-dashboard/reviewers"
                        className={fontColor}
                        disabled={headerDisabled}
                      >
                        Reviewers by Requirement
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/pr-dashboard/promotion-eligibility" className={fontColor} disabled={headerDisabled}>Promotion Eligibility</DropdownItem>
                      <DropdownItem tag={Link} to="/pr-dashboard/top-reviewed-prs" className={fontColor} disabled={headerDisabled}>Top Reviewed PRs</DropdownItem>
                      <DropdownItem tag={Link} to="/pr-dashboard/details" className={fontColor} disabled={headerDisabled}>PR Details</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}

                <NavItem className={styles.hideInMobile}>
                  <BellNotification
                    userId={displayUserId}
                    hasMeetingNotification={userUnreadMeetings.length > 0}
                    meetingNotificationCount={userUnreadMeetings.length}
                    onMeetingNotificationClick={openMeetingNotification}
                  />
                </NavItem>

                <NavItem className={styles.hideInMobile}>
                  <NavLink tag={Link} to={`/userprofile/${displayUserId}`}>
                    <div style={{ width: '60px', height: '60px', minWidth: '60px', minHeight: '60px', backgroundImage: `url(${profilePic || '/pfp-default-header.png'})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} className="dashboardimg" />
                  </NavLink>
                </NavItem>

                <UncontrolledDropdown nav className={styles.hideInMobile}>
                  <DropdownToggle nav caret><span>{WELCOME}, {firstName}</span></DropdownToggle>
                  <DropdownMenu className={`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`}>
                    <DropdownItem header className={darkMode ? 'text-custom-grey' : styles.mobileDropdownText}>Hello {firstName}</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem tag={Link} to={`/userprofile/${displayUserId}`} className={fontColor} disabled={headerDisabled}>{VIEW_PROFILE}</DropdownItem>
                    {!cantUpdateDevAdminDetails(props.userProfile.email, props.userProfile.email) && (
                      <DropdownItem tag={Link} to={`/updatepassword/${displayUserId}`} className={fontColor}>{UPDATE_PASSWORD}</DropdownItem>
                    )}
                    <DropdownItem className={fontColor}><DarkModeButton /></DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={openModal} className={fontColor} disabled={headerDisabled}>{LOGOUT}</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Nav>
            </div>
          </div>
        </div>
      </Navbar>

      {!isAuthUser && (
        <PopUpBar
          firstName={viewingUser.firstName}
          lastName={viewingUser.lastName}
          message={`You are currently viewing the header for ${viewingUser.firstName} ${viewingUser.lastName}`}
          onClickClose={() => setPopup(prevPopup => !prevPopup)}
        />
      )}
      {meetingContentsNotification &&
        meetingContents.map(item => (
          <PopUpBar
            key={item.id}
            firstName={viewingUser?.firstName || firstName}
            lastName={viewingUser?.lastName}
            message={item.msg}
            onClickClose={() => CloseMeetingContentsNotification(item.id, item.recipient)}
            textColor="black_text"
            isMeetingNotification
          />
        ))}
      <PermissionWatcher props={props} />
      <div>
        <Modal
          isOpen={popup}
          className={darkMode ? 'text-light hgn-themed-modal--dark' : 'hgn-themed-modal'}
        >
          <ModalHeader className={darkMode ? 'bg-space-cadet text-white' : ''}>Return to your Dashboard</ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}><p>Are you sure you wish to return to your own dashboard?</p></ModalBody>
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
            <Button variant="primary" onClick={removeViewingUser}>Ok</Button>{' '}
            <Button variant="secondary" onClick={() => setPopup(prevPopup => !prevPopup)}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
      {props.auth.isAuthenticated && isModalVisible && (
        <div className={`${darkMode ? 'bg-oxford-blue' : ''} ${styles.cardWrapper}`}>
          <Card color="primary" className={`${styles.headerCard} ${styles.dashboardHeader}`}>
            <div className="close-button" style={{ paddingRight: '5px'}}>
              <Button close onClick={closeModal} />
            </div>
            <div className={`${styles.cardContent}`}>{modalContent}</div>
          </Card>
        </div>
      )}
      {props.auth.isAuthenticated && (
        <div className={styles.notificationOverlay}>
          {unreadNotifications?.length > 0 ? <NotificationCard notification={unreadNotifications[0]} /> : null}
        </div>
      )}
      <audio
        ref={MeetingNotificationAudioRef}
        key="meetingNotificationAudio"
        preload="auto"
        src="https://bigsoundbank.com/UPLOAD/mp3/2554.mp3"
      >
        <track kind="captions" />
      </audio>
      <Modal
        isOpen={meetingModalOpen}
        toggle={handleMeetingRead}
        className={
          darkMode
            ? 'text-light meeting-notification-modal meeting-notification-modal--dark'
            : 'meeting-notification-modal'
        }
        contentClassName={darkMode ? 'meeting-notification-modal-panel--dark' : ''}
      >
        {darkMode ? (
          <MeetingNotificationModalHeader onClose={handleMeetingRead}>
            Meeting Notification
            {userUnreadMeetings.length > 1 ? ` (${userUnreadMeetings.length} upcoming)` : ''}
          </MeetingNotificationModalHeader>
        ) : (
          <ModalHeader toggle={handleMeetingRead}>
            Meeting Notification
            {userUnreadMeetings.length > 1 ? ` (${userUnreadMeetings.length} upcoming)` : ''}
          </ModalHeader>
        )}
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div className={styles.meetingNotificationModalBody}>
            <p>{parse(DOMPurify.sanitize(meetingModalMessage))}</p>
            {meetingCalendarLinks && (
              <div className={styles.meetingNotificationModalActions}>
                <a
                  href={meetingCalendarLinks.googleCalendarLink}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.meetingCalendarLink}
                >
                  Add to Google Calendar
                </a>
                <a
                  href={meetingCalendarLinks.icsUrl}
                  download="meeting.ics"
                  className={styles.meetingCalendarLink}
                >
                  Download .ics
                </a>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter
          className={`${styles.meetingNotificationModalFooter}${
            darkMode ? ' bg-yinmn-blue text-white' : ''
          }`}
        >
          {userUnreadMeetings.length > 1 && meetingAudioUnlocked && (
            <div className={styles.meetingNotificationNav}>
              <Button
                color="secondary"
                onClick={goToPreviousMeeting}
                disabled={activeMeetingModalIndex === 0}
                aria-label="Previous meeting notification"
              >
                &lt;
              </Button>
              <span className={styles.meetingNotificationNavCount}>
                {activeMeetingModalIndex + 1} / {userUnreadMeetings.length}
              </span>
              <Button
                color="secondary"
                onClick={goToNextMeeting}
                disabled={activeMeetingModalIndex >= userUnreadMeetings.length - 1}
                aria-label="Next meeting notification"
              >
                &gt;
              </Button>
            </div>
          )}
          <Button
            color="primary"
            onClick={handleMeetingRead}
            style={darkMode ? boxStyleDark : boxStyle}
            className={styles.meetingNotificationCloseBtn}
          >
            {userUnreadMeetings?.length > 0 && !meetingAudioUnlocked
              ? 'Enable Alerts & View Meeting'
              : 'Close'}
          </Button>
        </ModalFooter>
      </Modal>
      <div className={darkMode ? styles.headerMargin : styles.headerMarginLight} />
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
  meetingNotification: state.meetingNotification,
  allUserProfiles: state.allUserProfiles.userProfiles,
  darkMode: state.theme.darkMode,
});

Header.propTypes = {
  hasPermission: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    user: PropTypes.shape({
      userid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      role: PropTypes.string
    }),
    firstName: PropTypes.string,
    profilePic: PropTypes.string
  }),
  getHeaderData: PropTypes.func,
  getAllRoles: PropTypes.func,
  getWeeklySummaries: PropTypes.func,
  role: PropTypes.shape({ roles: PropTypes.array }),
  notification: PropTypes.object,
  unreadMeetingNotifications: PropTypes.arrayOf(PropTypes.object),
  meetingNotification: PropTypes.shape({
    error: PropTypes.shape({
      message: PropTypes.string,
    }),
  }),
  allUserProfiles: PropTypes.arrayOf(PropTypes.object),
  userProfile: PropTypes.object,
  darkMode: PropTypes.bool,
  taskEditSuggestionCount: PropTypes.number,
};

export default connect(mapStateToProps, {
  getHeaderData,
  getAllRoles,
  hasPermission,
  getWeeklySummaries,
  getUserProfile,
})(Header);