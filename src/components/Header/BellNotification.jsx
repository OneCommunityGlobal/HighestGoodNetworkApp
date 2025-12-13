// PST week fix, 48/24 thresholds, dev time-travel (no reload), week-safe localStorage
// + Task progress alerts at 50% / 75% / 90% with modal list & view-to-reset
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { getMessagingSocket } from '../../utils/messagingSocket';
import {
  clearDBNotifications,
  clearNotifications,
} from '../../actions/lbdashboard/messagingActions';
import { ENDPOINTS } from '../../utils/URL';

// Import getUserTasks action for fetching user-specific tasks
import { getUserTasks } from '../../actions/userProfile';

// Pacific Time week boundary helpers
const toLA = d => new Date(d.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

// Start of Pacific week = Sunday 00:00 PT for the given instant `d`
const startOfPSTWeek = (d = new Date()) => {
  const laNow = toLA(d);
  const laStart = new Date(laNow);
  laStart.setHours(0, 0, 0, 0);
  laStart.setDate(laStart.getDate() - laNow.getDay()); // back to Sunday 00:00 LA
  const offsetMs = d.getTime() - laNow.getTime(); // convert LA wall time back to true instant
  return new Date(laStart.getTime() + offsetMs);
};

// End of Pacific week = next Sunday 00:00 PT
const endOfPSTWeek = d => new Date(startOfPSTWeek(d).getTime() + 7 * 24 * 60 * 60 * 1000);

// Key for week-scoped storage, anchored to PT Sunday 00:00
const weekKey = d => startOfPSTWeek(d).toISOString();

// Task progress helpers (HOURS-based buckets)
const pick = (...vals) => vals.find(v => v != null);

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

const taskNameOf = t => pick(t.taskName, t.name, t.title, '(unnamed task)');

export default function BellNotification({ userId }) {
  const [isDataReady, setIsDataReady] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const notificationRef = useRef(null);

  const [dbNotifications, setDbNotifications] = useState([]); // DB notifications
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [hasMessageNotification, setHasMessageNotification] = useState(false);

  // State to force re-render when localStorage changes
  const [taskAlertsVersion, setTaskAlertsVersion] = useState(0);

  const dispatch = useDispatch();

  // Redux selectors
  const notifications = useSelector(state => state.messages?.notifications || []);
  const timeEntries = useSelector(state => state.timeEntries?.weeks?.[0] || []);
  const weeklycommittedHours = useSelector(state => state.userProfile?.weeklycommittedHours || 0);
  const darkMode = useSelector(state => state.theme?.darkMode);

  // check state.userTask
  const tasksFromStore = useSelector(state => {
    // Check state.userTask
    if (state.userTask) {
      // The API returns an object with a 'tasks' array inside
      if (state.userTask.tasks && Array.isArray(state.userTask.tasks)) {
        if (state.userTask.tasks.length > 0) {
        }
        return state.userTask.tasks;
      }
      if (Array.isArray(state.userTask)) {
        return state.userTask;
      }
    }

    // Fallback to other possible locations
    const possiblePaths = [
      state.tasks?.assignedTasks,
      state.tasks?.taskItems,
      state.tasks?.list,
      state.tasks?.tasks,
      state.myTasks,
    ];

    for (const path of possiblePaths) {
      if (Array.isArray(path) && path.length > 0) {
        return path;
      }
    }

    return [];
  });

  // Fetch user-specific tasks using getUserTasks action
  useEffect(() => {
    if (!userId) {
      return;
    }

    dispatch(getUserTasks(userId));

    // Refetch every 5 minutes to keep data fresh
    const interval = setInterval(() => {
      dispatch(getUserTasks(userId));
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch, userId]);

  // Time source
  // Tick every hour so time-based UI updates naturally
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Choose "now": dev override or live clock
  const testNow = (typeof window !== 'undefined' && window.__BELL_TEST_NOW) || null;
  const now = testNow ? new Date(testNow) : new Date(nowTick);

  // Deadline (Pacific): Sunday 00:00 PT
  const deadline = endOfPSTWeek(now);
  const msLeft = deadline - now;
  const hoursLeft = Math.max(0, Math.floor(msLeft / 36e5));
  const minutesLeft = Math.max(0, Math.floor((msLeft % 36e5) / 6e4));

  // Hours math
  const totalEffort = useMemo(() => {
    return timeEntries.reduce((total, entry) => {
      const hours = parseInt(entry.hours, 10) || 0;
      const minutes = parseInt(entry.minutes, 10) || 0;
      return total + hours + minutes / 60;
    }, 0);
  }, [timeEntries]);

  const underGoal = weeklycommittedHours > 0 && totalEffort < weeklycommittedHours;

  // Per-week "seen" flags
  const currentWeekKey = weekKey(now);
  const base = `${userId}::${currentWeekKey}`;
  const SEEN_48 = `${base}::hours::seen48`;
  const SEEN_24 = `${base}::hours::seen24`;
  const LAST_WEEK_KEY = `${userId}::lastWeekKey`;

  // Reset week-scoped flags when the Pacific week flips
  useEffect(() => {
    const last = localStorage.getItem(LAST_WEEK_KEY);
    if (last !== currentWeekKey) {
      // Clear both hours and task progress flags for this user
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
    if (weeklycommittedHours > 0 && !underGoal) {
      localStorage.setItem(SEEN_48, '1');
      localStorage.setItem(SEEN_24, '1');
    }
  }, [underGoal, weeklycommittedHours, SEEN_24, SEEN_48]);

  // HOURS-logged vs task estimate
  // Enhanced logging for debugging
  const loggedByTask = useMemo(() => {
    const map = new Map();

    for (const e of timeEntries) {
      // Log first entry to see structure
      if (map.size === 0 && timeEntries.length > 0) {
      }

      // The time entry should reference the task ID somehow
      // Try these fields in order
      const taskId =
        e.projectTaskId ||
        e.taskId ||
        e.task ||
        e.taskID ||
        e.task_id ||
        e.taskObj?._id ||
        e.taskObj?.id;

      if (!taskId) continue;

      const h = parseInt(e.hours, 10) || 0;
      const m = parseInt(e.minutes, 10) || 0;
      const totalHours = h + m / 60;

      if (totalHours > 0) {
        map.set(taskId, (map.get(taskId) || 0) + totalHours);
      }
    }

    return map;
  }, [timeEntries]);

  // Use whatever array we actually got from Redux
  const tasks = tasksFromStore;

  // Enhanced task normalization with better debugging
  const normalizedTasks = useMemo(() => {
    const normalized = (tasks || [])
      .map(t => {
        const id = t._id || t.id || t.taskId;
        const name = taskNameOf(t);

        // Try multiple field names for estimated hours
        const estimatedHours =
          Number(
            pick(
              t.estimatedHours,
              t.hoursEstimated,
              t.hoursMost,
              t.mostHours,
              t.hoursBest,
              t.hoursWorst,
              t.totalHours,
              t.plannedHours,
              0,
            ),
          ) || 0;

        // Debug log for tasks with estimates
        if (estimatedHours > 0) {
        }

        return { id, name, estimatedHours };
      })
      .filter(t => t.id && t.estimatedHours > 0);

    return normalized;
  }, [tasks]);

  // Add taskAlertsVersion to dependencies to force recalculation
  const taskHoursAlerts = useMemo(() => {
    const list = [];

    for (const t of normalizedTasks) {
      const logged = loggedByTask.get(t.id) || 0;
      const pct = hoursPercent(logged, t.estimatedHours); // 0..100

      if (pct >= 100) continue; // task effectively done

      const bucket = bucketForHoursPct(pct); // 50 / 75 / 90 / null
      if (!bucket) continue;

      const seenKey = `${userId}::${currentWeekKey}::taskHours::${t.id}::seen::${bucket}`;
      if (localStorage.getItem(seenKey)) {
        continue;
      }

      list.push({
        id: t.id,
        name: t.name,
        logged,
        estimate: t.estimatedHours,
        percent: pct,
        bucket,
        seenKey,
      });
    }

    // Sort: highest bucket first, then by biggest remaining gap
    list.sort((a, b) => {
      if (b.bucket !== a.bucket) return b.bucket - a.bucket;
      const aRemain = a.estimate - a.logged;
      const bRemain = b.estimate - b.logged;
      return bRemain - aRemain;
    });

    return list;
  }, [normalizedTasks, loggedByTask, userId, currentWeekKey, taskAlertsVersion]); // Added taskAlertsVersion

  const hasTaskAlerts = taskHoursAlerts.length > 0;

  // ---------- DB + socket notifications ----------
  useEffect(() => {
    if (!userId) return;
    const fetchDbNotifications = async () => {
      try {
        const { data } = await axios.get(`${ENDPOINTS.NOTIFICATIONS}/unread/user/${userId}`);
        const notifications = Array.isArray(data) ? data : [];
        setDbNotifications(notifications);
        if (notifications.length > 0) setHasMessageNotification(true);
      } catch (error) {
        console.error('Error fetching notifications from DB:', error);
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
    setHasMessageNotification(false);

    // Clear any message notifications if needed
    try {
      dispatch(clearNotifications());
      dispatch(clearDBNotifications());
    } catch (e) {
      console.error('Error clearing notifications:', e);
    }
  };

  const handleNotificationClick = () => {
    // Resolve hours thresholds that are currently active (Part A)
    if (show48) localStorage.setItem(SEEN_48, '1');
    if (show24) localStorage.setItem(SEEN_24, '1');

    setShowNotification(false);
    setHasMessageNotification(false);
    try {
      dispatch(clearNotifications());
      dispatch(clearDBNotifications());
    } catch (e) {
      console.error('Error clearing notifications:', e);
    }
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        //to close notification panel without marking as read
        setShowNotification(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // formatting
  const formatTime = (hours, minutes) => {
    const hoursStr = `${hours} hour${hours !== 1 ? 's' : ''}`;
    const minutesStr = minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? 's' : ''}` : '';
    return `${hoursStr}${minutesStr}`;
  };

  const getFormattedEffort = () => {
    const effortHours = Math.floor(totalEffort);
    const effortMinutes = Math.round((totalEffort % 1) * 60);
    return formatTime(effortHours, effortMinutes);
  };

  const getFormattedLeftToWork = () => {
    const left = Math.max(0, weeklycommittedHours - totalEffort);
    const leftHours = Math.floor(left);
    const leftMinutes = Math.round((left % 1) * 60);
    return formatTime(leftHours, leftMinutes);
  };

  const bellHasDot = hasHoursAlert || hasTaskAlerts || hasMessageNotification;

  // render
  return (
    <>
      {isDataReady && (
        <button
          type="button"
          onClick={handleMessageNotificationClick}
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
            <span
              style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                transform: 'translateX(50%) translateY(-50%)',
                backgroundColor: 'red',
                borderRadius: '50%',
                width: '10px',
                height: '10px',
                pointerEvents: 'none',
              }}
            />
          )}
        </button>
      )}

      {showNotification && (
        <div
          ref={notificationRef}
          style={{
            position: 'absolute',
            top: '75%',
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
          {hasHoursAlert && (
            <div style={{ marginBottom: 12, borderBottom: '1px solid #e0e0e0', paddingBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>⏰ Hours Reminder</div>
              You&apos;ve completed {getFormattedEffort()} out of the {weeklycommittedHours} hours
              you need. Only {getFormattedLeftToWork()} left to go.
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
                  <div style={{ marginBottom: 4 }}>
                    Hey! Your <strong>{a.name}</strong> is <strong>{a.bucket}%</strong> complete.
                  </div>
                  <div style={{ marginBottom: 4, fontSize: '14px' }}>
                    How are you doing? Please communicate with your manager if you need more time.
                    If you do, include the specific reason.
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                    📈 Progress: {a.percent}% ({a.logged.toFixed(1)} / {a.estimate.toFixed(1)} hrs)
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
            </div>
          )}

          {!hasHoursAlert && !hasTaskAlerts && !hasMessageNotification && (
            <div style={{ padding: '10px', textAlign: 'center', opacity: 0.7 }}>
              No new notifications.
            </div>
          )}
        </div>
      )}
    </>
  );
}
// ===== (Optional) Console test helpers =====
// Keep your existing bellTest block if you like. You can also add helpers to clear per-task seen:
// Object.keys(localStorage)
//   .filter(k => k.includes('::task::') && k.includes('::seen::'))
//   .forEach(k => localStorage.removeItem(k));

// To test the feature time travel in browser you can paste this iife in the console and then you can use function calls for bellTest.goto(48)/(24)
// ==== Bell test helpers (no reloads needed) ====
// (() => {
//   const toLA = d => new Date(d.toLocaleString('en-US',{ timeZone: 'America/Los_Angeles' }));
//   const startOfPSTWeek = d => {
//     const laNow = toLA(d);
//     const laStart = new Date(laNow);
//     laStart.setHours(0,0,0,0);
//     laStart.setDate(laStart.getDate() - laNow.getDay());
//     const offset = d.getTime() - laNow.getTime();
//     return new Date(laStart.getTime() + offset); // true Sun 00:00 PT instant
//   };
//   const endOfPSTWeek = d => new Date(startOfPSTWeek(d).getTime() + 7*24*3600*1000);

//   window.bellTest = {
//     toLA, startOfPSTWeek, endOfPSTWeek,
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
