// PST week fix, 48/24 thresholds, dev time-travel (no reload), week-safe localStorage
// + Task progress alerts at 50% / 75% / 90% with modal list & view-to-reset
import axios from 'axios';
import moment from 'moment-timezone';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearDBNotifications,
  clearNotifications,
} from '../../actions/lbdashboard/messagingActions';
import { getMessagingSocket } from '../../utils/messagingSocket';
import { ENDPOINTS } from '../../utils/URL';

// Pacific Time week boundary helpers
const LA_TZ = 'America/Los_Angeles';
const DAY_MS = 24 * 60 * 60 * 1000;

const laFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: LA_TZ,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

// LA wall-clock time at instant `d`, encoded as a UTC timestamp (independent of the browser's TZ)
const laWallMs = d => {
  const p = Object.fromEntries(
    laFormatter.formatToParts(d).map(({ type, value }) => [type, Number(value)]),
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
};

// LA offset from UTC at instant `t` (whole seconds, so no stray milliseconds leak in)
const laOffsetMs = t => laWallMs(new Date(t)) - Math.floor(t / 1000) * 1000;

// Start of Pacific week = Sunday 00:00 PT for the given instant `d`
const startOfPSTWeek = (d = new Date()) => {
  const wall = new Date(laWallMs(d));
  const sundayWall = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate() - wall.getUTCDay(),
  );
  // Use the offset in effect at Sunday 00:00 itself (DST switches at 2am, so this is DST-safe)
  const guess = sundayWall - laOffsetMs(d.getTime());
  return new Date(sundayWall - laOffsetMs(guess));
};

// End of Pacific week = next Sunday 00:00 PT (weeks with a DST switch are 167h / 169h long)
const endOfPSTWeek = d => startOfPSTWeek(new Date(startOfPSTWeek(d).getTime() + 8 * DAY_MS));

// Key for week-scoped storage, anchored to PT Sunday 00:00
const weekKey = d => startOfPSTWeek(d).toISOString();


// Round to nearest whole percent, clamp 0..100
const hoursPercent = (logged, est) => {
  if (!est || est <= 0) return 0;
  const pct = Math.min(1, Math.max(0, logged / est));
  return Math.round(pct * 100);
};

// Highest bucket reached so far (notify once per bucket)
const bucketForHoursPct = p => {
  if (p >= 90) return 90;
  if (p >= 75) return 75;
  if (p >= 50) return 50;
  return null;
};


import PropTypes from 'prop-types';

const formatBellTime = (hours, minutes) => {
  const hoursStr = `${hours} hour${hours !== 1 ? 's' : ''}`;
  const minutesStr = minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? 's' : ''}` : '';
  return `${hoursStr}${minutesStr}`;
};

const getProgressColor = percent => {
  if (percent >= 90) return '#dc3545';
  if (percent >= 75) return '#ffc107';
  return '#28a745';
};

function BellMeetingBadge({ hasMeetingNotification, meetingNotificationCount }) {
  if (!hasMeetingNotification) {
    return null;
  }

  return (
    <span
      style={{
        position: 'absolute',
        top: '0px',
        right: '0px',
        transform: 'translateX(50%) translateY(-50%)',
        backgroundColor: 'red',
        borderRadius: meetingNotificationCount > 1 ? '10px' : '50%',
        minWidth: meetingNotificationCount > 1 ? '18px' : '10px',
        height: meetingNotificationCount > 1 ? '18px' : '10px',
        width: meetingNotificationCount > 1 ? 'auto' : '10px',
        padding: meetingNotificationCount > 1 ? '0 4px' : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 700,
        lineHeight: 1,
        color: '#fff',
        pointerEvents: 'none',
      }}
    >
      {meetingNotificationCount > 1 ? meetingNotificationCount : null}
    </span>
  );
}

BellMeetingBadge.propTypes = {
  hasMeetingNotification: PropTypes.bool.isRequired,
  meetingNotificationCount: PropTypes.number.isRequired,
};

function BellNotificationPanel({
  darkMode,
  hasHoursAlert,
  hasTaskAlerts,
  hasMessageNotification,
  getFormattedEffort,
  weeklycommittedHours,
  getFormattedLeftToWork,
  hoursLeft,
  handleNotificationClick,
  taskHoursAlerts,
  handleMarkTaskAlertsAsRead,
  handleMarkMessagesAsRead,
  allNotifications,
}) {
  return (
    <>
      {hasHoursAlert && (
        <div style={{ marginBottom: 12, borderBottom: '1px solid #e0e0e0', paddingBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>⏰ Hours Reminder</div>
          You&apos;ve completed {getFormattedEffort()} out of the {weeklycommittedHours} hours you
          need. Only {getFormattedLeftToWork()} left to go.
          {hoursLeft > 0 &&
            ` There are ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} left in this week.`}
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={handleNotificationClick}
              className="btn btn-sm btn-primary"
            >
              Mark as read
            </button>
          </div>
        </div>
      )}

      {hasTaskAlerts && (
        <div style={{ marginBottom: 12, borderBottom: '1px solid #e0e0e0', paddingBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>📊 Task Progress Alerts</div>
          {taskHoursAlerts.map(a => (
            <div
              key={`${a.id}-${a.bucket}`}
              style={{
                marginBottom: 10,
                padding: '8px',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: '4px',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}
            >
              <div style={{ marginBottom: 6, fontSize: '14px' }}>
                Hey! Your <strong>{a.name}</strong> is <strong>{a.bucket}%</strong> complete. How
                are you doing? Please, communicate with your manager if you need more time. If you
                do, be sure to include the specific reason why.
              </div>
              <div style={{ fontSize: '13px', marginBottom: 4 }}>
                <strong>
                  {a.task.num ? `${a.task.num} ` : ''}
                  {a.name}
                </strong>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: 4 }}>
                {a.logged.toFixed(2)} of {a.estimate.toFixed(2)} hours
              </div>
              <div
                style={{
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : '#e9ecef',
                  overflow: 'hidden',
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(a.percent, 100)}%`,
                    backgroundColor: getProgressColor(a.percent),
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={handleMarkTaskAlertsAsRead}
              className="btn btn-sm btn-primary"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}

      {hasMessageNotification && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>💬 New Messages</div>
          {allNotifications.map((notification, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={notification._id || index}>{notification.message || notification}</div>
          ))}
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={handleMarkMessagesAsRead}
              className="btn btn-sm btn-primary"
            >
              Mark as read
            </button>
          </div>
        </div>
      )}

      {!hasHoursAlert && !hasTaskAlerts && !hasMessageNotification && (
        <div style={{ padding: '10px', textAlign: 'center', opacity: 0.7 }}>
          No new notifications.
        </div>
      )}
    </>
  );
}

BellNotificationPanel.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  hasHoursAlert: PropTypes.bool.isRequired,
  hasTaskAlerts: PropTypes.bool.isRequired,
  hasMessageNotification: PropTypes.bool.isRequired,
  getFormattedEffort: PropTypes.func.isRequired,
  weeklycommittedHours: PropTypes.number.isRequired,
  getFormattedLeftToWork: PropTypes.func.isRequired,
  hoursLeft: PropTypes.number.isRequired,
  handleNotificationClick: PropTypes.func.isRequired,
  taskHoursAlerts: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleMarkTaskAlertsAsRead: PropTypes.func.isRequired,
  handleMarkMessagesAsRead: PropTypes.func.isRequired,
  allNotifications: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string]))
    .isRequired,
};

export default function BellNotification({
  userId,
  hasMeetingNotification = false,
  meetingNotificationCount = 0,
  onMeetingNotificationClick,
}) {
  const [isDataReady, setIsDataReady] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  const [dbNotifications, setDbNotifications] = useState([]); // DB notifications
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [hasMessageNotification, setHasMessageNotification] = useState(false);

  // State to force re-render when localStorage changes
  const [taskAlertsVersion, setTaskAlertsVersion] = useState(0);

  const dispatch = useDispatch();

  // Redux selectors
  const notifications = useSelector(state => state.messages?.notifications || []);
  const darkMode = useSelector(state => state.theme?.darkMode);

  // Shared Redux slices can hold another user's data (Timelog / PeopleReport for a viewed user),
  // so the bell fetches its own copy and only uses these as "something changed, refetch" signals.
  const timeEntriesSignal = useSelector(state => state.timeEntries?.weeks?.[0]);
  const tasksSignal = useSelector(state => state.userTask);

  // Time source
  // Tick every hour so time-based UI updates naturally
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Dev time-travel: window.__setBellNow(iso) re-renders every mounted bell, null resets
  const [testNowOverride, setTestNowOverride] = useState(null);
  useEffect(() => {
    const onSetNow = e => setTestNowOverride(e.detail || null);
    window.addEventListener('bell:setNow', onSetNow);
    window.__setBellNow = iso => {
      if (iso) window.__BELL_TEST_NOW = iso;
      else delete window.__BELL_TEST_NOW;
      window.dispatchEvent(new CustomEvent('bell:setNow', { detail: iso || null }));
    };
    window.__bellStartOfPSTWeek = startOfPSTWeek;
    window.__bellEndOfPSTWeek = endOfPSTWeek;
    return () => window.removeEventListener('bell:setNow', onSetNow);
  }, []);

  // Choose "now": dev override or live clock
  const testNow =
    testNowOverride || (typeof window !== 'undefined' && window.__BELL_TEST_NOW) || null;
  const now = testNow ? new Date(testNow) : new Date(nowTick);

  // Deadline (Pacific): Sunday 00:00 PT
  const deadline = endOfPSTWeek(now);
  const msLeft = deadline - now;
  const hoursLeft = Math.max(0, Math.floor(msLeft / 36e5));
  const minutesLeft = Math.max(0, Math.floor((msLeft % 36e5) / 6e4));

  const currentWeekKey = weekKey(now);

  // The bell user's own committed hours
  const [weeklycommittedHours, setWeeklyCommittedHours] = useState(0);
  const [profileLoaded, setProfileLoaded] = useState(false);
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    setProfileLoaded(false);
    const fetchProfile = async () => {
      try {
        const res = await axios.get(ENDPOINTS.USER_PROFILE(userId));
        if (cancelled) return;
        setWeeklyCommittedHours(Number(res?.data?.weeklycommittedHours) || 0);
        setProfileLoaded(true);
      } catch (error) {
        console.error('Error fetching bell user profile:', error);
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // The bell user's own time entries for the current PT week
  const [weekEntries, setWeekEntries] = useState({ week: null, entries: [] });
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    const weekStart = moment(currentWeekKey).tz(LA_TZ);
    const fromDate = weekStart.format('YYYY-MM-DDTHH:mm:ss');
    const toDate = weekStart
      .clone()
      .add(6, 'days')
      .endOf('day')
      .format('YYYY-MM-DDTHH:mm:ss');
    const fetchEntries = async () => {
      try {
        const res = await axios.get(ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate));
        if (cancelled) return;
        setWeekEntries({
          week: currentWeekKey,
          entries: Array.isArray(res?.data) ? res.data : [],
        });
      } catch (error) {
        console.error('Error fetching bell time entries:', error);
      }
    };
    fetchEntries();
    return () => {
      cancelled = true;
    };
  }, [userId, currentWeekKey, timeEntriesSignal]);

  // The bell user's own tasks (refetch every 5 minutes and whenever tasks change elsewhere)
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    const fetchTasks = async () => {
      try {
        const res = await axios.get(ENDPOINTS.TASKS_BY_USERID(userId));
        if (!cancelled) setTasks(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        console.error('Error fetching bell tasks:', error);
      }
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId, tasksSignal]);

  // Hours math (tangible only, same as committed hours)
  const totalEffort = useMemo(() => {
    return weekEntries.entries.reduce((total, entry) => {
      if (!entry.isTangible) return total;
      const hours = parseInt(entry.hours, 10) || 0;
      const minutes = parseInt(entry.minutes, 10) || 0;
      return total + hours + minutes / 60;
    }, 0);
  }, [weekEntries]);

  // Only judge hours once this user's profile and this week's entries are loaded
  const hoursDataReady = profileLoaded && weekEntries.week === currentWeekKey;
  const underGoal =
    hoursDataReady && weeklycommittedHours > 0 && totalEffort < weeklycommittedHours;
  const goalMet = hoursDataReady && weeklycommittedHours > 0 && !underGoal;

  // Per-week "seen" flags
  const base = `${userId}::${currentWeekKey}`;
  const SEEN_48 = `${base}::hours::seen48`;
  const SEEN_24 = `${base}::hours::seen24`;
  const LAST_WEEK_KEY = `${userId}::lastWeekKey`;

  // Reset week-scoped hours flags when the Pacific week flips.
  // Task flags (::taskProgress::) are kept on purpose: a task only re-alerts when it reaches a
  // higher bucket. ::taskHours:: is a legacy key from the first version of this PR.
  useEffect(() => {
    if (!userId) return;
    const last = localStorage.getItem(LAST_WEEK_KEY);
    if (last !== currentWeekKey) {
      Object.keys(localStorage)
        .filter(
          k =>
            k.startsWith(`${userId}::`) && (k.includes('::hours::') || k.includes('::taskHours::')),
        )
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem(LAST_WEEK_KEY, currentWeekKey);
    }
  }, [currentWeekKey, userId, LAST_WEEK_KEY]);

  // Thresholds: show at 48h, and again at 24h if still under goal
  const show48 = underGoal && hoursLeft <= 48 && hoursLeft > 24 && !localStorage.getItem(SEEN_48);
  const show24 = underGoal && hoursLeft <= 24 && !localStorage.getItem(SEEN_24);
  const hasHoursAlert = show48 || show24;

  // If they meet the goal, auto-resolve both thresholds for this week
  useEffect(() => {
    if (userId && goalMet) {
      localStorage.setItem(SEEN_48, '1');
      localStorage.setItem(SEEN_24, '1');
    }
  }, [userId, goalMet, SEEN_24, SEEN_48]);

  // Task progress: current bucket for every open task with an estimate
  const taskProgress = useMemo(() => {
    const list = [];
    for (const t of tasks) {
      const id = t._id || t.id;
      const name = t.taskName || t.name || '(unnamed task)';
      const logged = Number(t.hoursLogged) || 0;
      const estimate = Number(t.estimatedHours) || 0;
      if (!id || estimate <= 0) continue;

      // Skip completed/submitted tasks
      const isDone = t.resources?.some(r => r.completedTask || r.reviewStatus === 'Submitted');
      if (isDone) continue;

      const pct = hoursPercent(logged, estimate);
      if (pct >= 100) continue;

      const bucket = bucketForHoursPct(pct) || 0; // 50 / 75 / 90 / 0
      list.push({ id, name, logged, estimate, percent: pct, bucket, task: t });
    }
    return list;
  }, [tasks]);

  // Per-task week state: { week, baseline, last }. `baseline` is the bucket the task had at the
  // end of the previous week, so a new week only alerts when the task actually progressed.
  const taskWeekStateKey = id => `${userId}::taskProgress::${id}::weekState`;
  const readTaskWeekState = id => {
    try {
      return JSON.parse(localStorage.getItem(taskWeekStateKey(id)));
    } catch (e) {
      return null;
    }
  };

  const taskHoursAlerts = useMemo(() => {
    const list = [];
    for (const p of taskProgress) {
      const { id, bucket } = p;
      if (!bucket) continue;

      const state = readTaskWeekState(id);
      let baseline = 0;
      if (state) baseline = state.week === currentWeekKey ? state.baseline : state.last;
      if (bucket <= (Number(baseline) || 0)) continue;

      // If this or a higher bucket was already marked as read, skip
      const seenKey = `${userId}::taskProgress::${id}::seen::${bucket}`;
      const seen = [90, 75, 50]
        .filter(b => b >= bucket)
        .some(b => localStorage.getItem(`${userId}::taskProgress::${id}::seen::${b}`));
      if (seen) continue;

      list.push({ ...p, seenKey });
    }

    // Sort: highest bucket first
    list.sort((a, b) => b.bucket - a.bucket);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskProgress, userId, currentWeekKey, taskAlertsVersion]);

  // Record each task's bucket for this week (feeds next week's baseline)
  useEffect(() => {
    if (!userId) return;
    taskProgress.forEach(({ id, bucket }) => {
      const state = readTaskWeekState(id);
      let next;
      if (!state) next = { week: currentWeekKey, baseline: 0, last: bucket };
      else if (state.week !== currentWeekKey)
        next = { week: currentWeekKey, baseline: state.last, last: bucket };
      else next = { ...state, last: bucket };
      try {
        localStorage.setItem(taskWeekStateKey(id), JSON.stringify(next));
      } catch (e) {
        console.error('Error setting localStorage:', e);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskProgress, userId, currentWeekKey]);

  const hasTaskAlerts = taskHoursAlerts.length > 0;

  // ---------- DB + socket notifications ----------

  useEffect(() => {
  if (!userId) return;
  const fetchDbNotifications = async () => {
    try {
      const response = await axios.get(`${ENDPOINTS.NOTIFICATIONS}/unread/user/${userId}`);
      const notificationsData = response?.data || [];
      // Ensure it's always an array
      setDbNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      if (Array.isArray(notificationsData) && notificationsData.length > 0) {
        setHasMessageNotification(true);
      }
    } catch (error) {
      console.error('Error fetching notifications from DB:', error);
      // Ensure we set an empty array on error
      setDbNotifications([]);
    }
  };
  fetchDbNotifications();
}, [userId]);


  useEffect(() => {
    if (notifications.length > 0) {
      setMessageNotifications(notifications);
      setHasMessageNotification(true);
    }
  }, [notifications]);

  useEffect(() => {
    const socket = getMessagingSocket();
    const handleNewMessageNotification = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === 'NEW_NOTIFICATION') {
          setMessageNotifications(prev => [...prev, { message: data.payload }]);
          setHasMessageNotification(true);
        }
      } catch (error) {
        console.error('Error handling WebSocket notification:', error);
      }
    };

    if (socket) {
      socket.addEventListener('message', handleNewMessageNotification);
    } else {
      console.error('WebSocket is not connected.');
    }

    return () => {
      if (socket) socket.removeEventListener('message', handleNewMessageNotification);
    };
  }, [messageNotifications]);

  const allNotifications = [
  ...(Array.isArray(dbNotifications) ? dbNotifications : []),
  ...(Array.isArray(messageNotifications) ? messageNotifications : []),
];

  // Ready after first mount
  useEffect(() => setIsDataReady(true), []);

  const handleMessageNotificationClick = async () => {
    setShowNotification(prev => !prev);

    if (!showNotification) {
      try {
        const notificationIds = (Array.isArray(dbNotifications) ? dbNotifications : []).map(n => n._id);
        if (notificationIds.length > 0) {
          await axios.post(`${ENDPOINTS.MSG_NOTIFICATION}/mark-as-read`, { notificationIds });
        }
      } catch (error) {
        console.error('Error marking message notifications as read:', error);
      }
    }
  };

  // Handler for marking task alerts as read
  const handleMarkTaskAlertsAsRead = () => {
    // Mark all current task alerts as seen
    taskHoursAlerts.forEach(a => {
      try {
        localStorage.setItem(a.seenKey, '1');
      } catch (e) {
        console.error('Error setting localStorage:', e);
      }
    });

    // Force re-render to update the bell icon
    setTaskAlertsVersion(v => v + 1);

    // Close the notification panel
    setShowNotification(false);
  };

  const handleNotificationClick = () => {
    // Resolve hours thresholds that are currently active (Part A)
    if (show48) localStorage.setItem(SEEN_48, '1');
    if (show24) localStorage.setItem(SEEN_24, '1');

    setShowNotification(false);
  };

  const handleMarkMessagesAsRead = () => {
    setShowNotification(false);
    setHasMessageNotification(false);
    setDbNotifications([]);
    setMessageNotifications([]);
    try {
      dispatch(clearNotifications());
      dispatch(clearDBNotifications());
    } catch (e) {
      console.error('Error clearing notifications:', e);
    }
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (notificationRef.current && !notificationRef.current.contains(event.target) && !bellRef.current.contains(event.target)) {
        //to close notification panel without marking as read
        setShowNotification(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // formatting
  const getFormattedEffort = () => {
    const effortHours = Math.floor(totalEffort);
    const effortMinutes = Math.round((totalEffort % 1) * 60);
    return formatBellTime(effortHours, effortMinutes);
  };

  const getFormattedLeftToWork = () => {
    const left = Math.max(0, weeklycommittedHours - totalEffort);
    const leftHours = Math.floor(left);
    const leftMinutes = Math.round((left % 1) * 60);
    return formatBellTime(leftHours, leftMinutes);
  };

  const bellHasDot =
    hasHoursAlert || hasTaskAlerts || hasMessageNotification || hasMeetingNotification;

  const handleBellClick = async () => {
    if (hasMeetingNotification && onMeetingNotificationClick) {
      onMeetingNotificationClick();
      return;
    }
    await handleMessageNotificationClick();
  };

  // render
  return (
    <>
      {isDataReady && (
        <button
          ref={bellRef}
          type="button"
          onClick={handleBellClick}
          className={`fa fa-bell i-large ${bellHasDot ? 'has-notification' : ''}`}
          style={{
            position: 'relative',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: bellHasDot ? 'white' : 'rgba(255, 255, 255, .5)',
            padding: 0,
          }}
          aria-label={bellHasDot ? 'You have new notifications' : 'No new notifications'}
          title={bellHasDot ? 'You have new notifications' : 'No new notifications'}
        >
          {bellHasDot && (
            <BellMeetingBadge
              hasMeetingNotification={hasMeetingNotification}
              meetingNotificationCount={meetingNotificationCount}
            />
          )}
        </button>
      )}

      {showNotification && (
        <div
          ref={notificationRef}
          style={{
            position: 'absolute',
            top: '4rem',
            right: '5%',
            transform: 'translateX(0)',
            backgroundColor: darkMode ? '#3A506B' : 'white',
            color: darkMode ? '#FFFFFF' : 'black',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.5',
            textAlign: 'left',
          }}
        >
          <BellNotificationPanel
            darkMode={darkMode}
            hasHoursAlert={hasHoursAlert}
            hasTaskAlerts={hasTaskAlerts}
            hasMessageNotification={hasMessageNotification}
            getFormattedEffort={getFormattedEffort}
            weeklycommittedHours={weeklycommittedHours}
            getFormattedLeftToWork={getFormattedLeftToWork}
            hoursLeft={hoursLeft}
            handleNotificationClick={handleNotificationClick}
            taskHoursAlerts={taskHoursAlerts}
            handleMarkTaskAlertsAsRead={handleMarkTaskAlertsAsRead}
            handleMarkMessagesAsRead={handleMarkMessagesAsRead}
            allNotifications={allNotifications}
          />
        </div>
      )}
    </>
  );
}
BellNotification.propTypes = {
  userId: PropTypes.string.isRequired,
  hasMeetingNotification: PropTypes.bool,
  meetingNotificationCount: PropTypes.number,
  onMeetingNotificationClick: PropTypes.func,
};
// ===== (Optional) Console test helpers =====
// Keep your existing bellTest block if you like. You can also add helpers to clear per-task seen:
// Object.keys(localStorage)
//   .filter(k => k.includes('::task::') && k.includes('::seen::'))
//   .forEach(k => localStorage.removeItem(k));

// To test the feature time travel in browser you can paste this iife in the console and then you can use function calls for bellTest.goto(48)/(24)
// ==== Bell test helpers (no reloads needed) ====
// (() => {
//   // Same week helpers the component uses (exposed once the bell is mounted)
//   const startOfPSTWeek = d => window.__bellStartOfPSTWeek(d);
//   const endOfPSTWeek = d => window.__bellEndOfPSTWeek(d);

//   window.bellTest = {
//     startOfPSTWeek, endOfPSTWeek,
//     setNow(iso) {
//       if (!window.__setBellNow) throw new Error('Component not mounted yet');
//       window.__setBellNow(iso);
//       return iso;
//     },
//     keys() {
//       const uid =
//         Object.keys(localStorage).find(k => k.endsWith('::lastWeekKey'))?.split('::')[0] || null;
//       const now = new Date(window.__BELL_TEST_NOW || Date.now());
//       const wk = startOfPSTWeek(now).toISOString();
//       const base = uid ? `${uid}::${wk}` : null;
//       return { uid, wk, base };
//     },
//     listKeys() {
//       const { uid } = bellTest.keys();
//       return Object.keys(localStorage).filter(k =>
//         (uid ? k.startsWith(uid + '::') : true) &&
//         (k.includes('::hours::') || k.endsWith('::lastWeekKey'))
//       );
//     },
//     clearSeen() {
//       const { base } = bellTest.keys();
//       if (!base) return [];
//       const ks = [`${base}::hours::seen48`, `${base}::hours::seen24`];
//       ks.forEach(k => localStorage.removeItem(k));
//       return ks;
//     },
//     nukeAllHours() {
//       const { uid } = bellTest.keys();
//       const removed = [];
//       Object.keys(localStorage).forEach(k => {
//         if (k.startsWith(`${uid}::`) && (k.includes('::hours::') || k.endsWith('::lastWeekKey'))) {
//           removed.push(k);
//           localStorage.removeItem(k);
//         }
//       });
//       return removed;
//     },
//     // convenience: jump relative to this week's PT deadline
//     goTo(hoursBefore = 0, minutesBefore = 0) {
//       const baseNow = new Date(window.__BELL_TEST_NOW || Date.now());
//       const end = endOfPSTWeek(baseNow);
//       const t = new Date(end.getTime() - (hoursBefore*3600 + minutesBefore*60)*1000);
//       return bellTest.setNow(t.toISOString());
//     }
//   };
//   console.log('bellTest loaded:', bellTest);
// })();
