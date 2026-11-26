import { useState, useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CalendarWidget from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './Register.module.css';
import EventDescription from './EventDescription';
import ShareAvailability from './ShareAvailability';

const MOCK_ACTIVITIES = [
  {
    id: 1,
    name: 'Yoga Class',
    rating: 4,
    type: 'Fitness',
    date: '03-10-2025',
    time: '10:00 AM',
    organizer: 'Alex Brian',
    location: 'Community Center',
    capacity: 10,
    image: 'https://cdn.pixabay.com/photo/2024/06/21/07/46/yoga-8843808_1280.jpg',
    description: 'A relaxing yoga session to improve flexibility and mindfulness.',
    faqs: [
      { question: 'What should I bring?', answer: 'A yoga mat and a water bottle.' },
      { question: 'Is it beginner-friendly?', answer: 'Yes, it is suitable for all levels.' },
    ],
    participants: ['John Doe', 'Jane Smith', 'Alice Brown'],
    comments: [
      { author: 'John Doe', comment: 'Looking forward to this!' },
      { author: 'Jane Smith', comment: 'This will be my first yoga session!' },
    ],
  },
  {
    id: 2,
    name: 'Book Club',
    rating: 5,
    type: 'Social',
    date: '03-15-2025',
    time: '5:00 PM',
    organizer: 'Bob',
    location: 'Library',
    capacity: 5,
    image: 'https://cdn.pixabay.com/photo/2019/01/30/08/30/book-3964050_1280.jpg',
    description: 'A book club discussion on the latest bestsellers.',
    faqs: [
      { question: 'Do I need to read the book beforehand?', answer: "Yes, it's recommended." },
      { question: 'Are snacks provided?', answer: 'Yes, light refreshments will be available.' },
    ],
    participants: ['Emily White', 'Michael Green'],
    comments: [
      { author: 'Emily White', comment: 'Excited to discuss my favorite book!' },
      { author: 'Michael Green', comment: 'What book are we reading?' },
    ],
  },
];

const MOCK_BOOKED_DATES = [
  new Date(2025, 11, 15),
  new Date(2025, 11, 20),
  new Date(2025, 11, 25),
  new Date(2026, 0, 5),
];

const MOCK_AVAILABLE_DATES = [
  new Date(2026, 4, 10),
  new Date(2026, 4, 15),
  new Date(2026, 4, 22),
  new Date(2026, 5, 5),
  new Date(2026, 5, 12),
];

function Register() {
  const { activityId } = useParams();
  const history = useHistory();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const userProfile = useSelector(state => state.userProfile);
  const authUser = useSelector(state => state.auth?.user);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityDate, setActivityDate] = useState('');
  const [activityStartTime, setActivityStartTime] = useState('');
  const [activityEndTime, setActivityEndTime] = useState('');
  const [availability, setAvailability] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrants, setRegistrants] = useState([]);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const storageKey = useMemo(() => `activity-${activityId}-registrants`, [activityId]);

  const tokenPayload = useMemo(() => {
    if (typeof globalThis === 'undefined' || typeof globalThis.atob !== 'function') return null;
    try {
      const token = globalThis.localStorage.getItem('token');
      if (!token) return null;
      const segment = token.split('.')[1];
      if (!segment) return null;
      const normalized = segment.replaceAll('-', '+').replaceAll('_', '/');
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        '=',
      );
      return JSON.parse(globalThis.atob(padded));
    } catch {
      return null;
    }
  }, [authUser?.userid]);

  // Load registrants from localStorage
  useEffect(() => {
    if (typeof globalThis === 'undefined') return;
    try {
      const stored = globalThis.localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      setRegistrants(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRegistrants([]);
    }
  }, [storageKey]);

  // Persist registrants to localStorage
  useEffect(() => {
    if (typeof globalThis === 'undefined') return;
    try {
      globalThis.localStorage.setItem(storageKey, JSON.stringify(registrants));
    } catch {
      // ignore
    }
  }, [registrants, storageKey]);

  // Fetch activity — try API first, fall back to mock data
  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(ENDPOINTS.EVENTS_BY_ID(activityId));
        setActivity(response.data || null);
      } catch (err) {
        const numericId = Number.parseInt(activityId, 10);
        const mockActivity = /^\d+$/.test(activityId)
          ? MOCK_ACTIVITIES.find(a => a.id === numericId)
          : null;
        if (mockActivity) {
          setActivity(mockActivity);
        } else if (err?.response?.status === 404) {
          setError('Activity not found.');
        } else {
          setError('Failed to load activity details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [activityId]);

  // Format date/time for API activities (have startTime/endTime ISO strings)
  useEffect(() => {
    if (!activity?.startTime) return;
    const eventDateTime = new Date(activity.startTime);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const eventDate = new Date(
      new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(eventDateTime),
    );
    setActivityDate(eventDate.toLocaleDateString());
    setActivityStartTime(
      new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: tz,
      }).format(eventDateTime),
    );
    setActivityEndTime(
      new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: tz,
      }).format(new Date(activity.endTime)),
    );
  }, [activity]);

  // Compute availability
  useEffect(() => {
    if (!activity) return;
    if (activity.maxAttendees !== undefined && activity.currentAttendees !== undefined) {
      const remaining = activity.maxAttendees - activity.currentAttendees;
      setAvailability(remaining > 0 ? remaining : 0);
    } else if (activity.capacity !== undefined) {
      setAvailability(Math.max(0, activity.capacity - registrants.length));
    }
  }, [activity, registrants]);

  // Calendar helpers
  const isDateBooked = date =>
    MOCK_BOOKED_DATES.some(
      b =>
        b.getDate() === date.getDate() &&
        b.getMonth() === date.getMonth() &&
        b.getFullYear() === date.getFullYear(),
    );

  const isDateAvailable = date =>
    MOCK_AVAILABLE_DATES.some(
      a =>
        a.getDate() === date.getDate() &&
        a.getMonth() === date.getMonth() &&
        a.getFullYear() === date.getFullYear(),
    );

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    if (isDateBooked(date)) return 'booked-date';
    if (isDateAvailable(date)) return 'available-date';
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    if (isDateBooked(date)) return <div className={styles['booked-indicator']}>●</div>;
    if (isDateAvailable(date)) return <div className={styles['available-indicator']}>●</div>;
    return null;
  };

  // User resolution helpers
  const resolveUserId = () =>
    authUser?.userid || authUser?._id || tokenPayload?.userId || tokenPayload?._id || null;

  const resolveNameFromToken = () => {
    if (!tokenPayload) return null;
    const first = tokenPayload.firstName || tokenPayload.firstname || tokenPayload.given_name;
    const last = tokenPayload.lastName || tokenPayload.lastname || tokenPayload.family_name;
    if (first && last) return `${first} ${last}`.trim();
    if (first) return first.trim();
    if (tokenPayload.name) return tokenPayload.name.trim();
    if (tokenPayload.email) {
      const [local] = tokenPayload.email.split('@');
      return local ? local.replaceAll(/[._-]+/gu, ' ').trim() : null;
    }
    return null;
  };

  // state.userProfile can be the last profile viewed, so only use it when it belongs to the logged-in user
  const getOwnProfile = () => {
    const id = resolveUserId();
    return id && String(userProfile?._id) === String(id) ? userProfile : null;
  };

  const resolveUserName = () => {
    const ownProfile = getOwnProfile();
    const firstName =
      authUser?.firstName ||
      tokenPayload?.firstName ||
      tokenPayload?.firstname ||
      ownProfile?.firstName;
    const lastName =
      authUser?.lastName ||
      tokenPayload?.lastName ||
      tokenPayload?.lastname ||
      ownProfile?.lastName;
    if (firstName && lastName) return `${firstName} ${lastName}`.trim();
    if (firstName) return firstName.trim();
    return resolveNameFromToken() || 'Participant';
  };

  const resolveJobTitle = () =>
    getOwnProfile()?.jobTitle ||
    tokenPayload?.jobTitle ||
    tokenPayload?.title ||
    tokenPayload?.position ||
    'Participant';

  // Check if user is already registered (from API resources or local registrants)
  useEffect(() => {
    const userId = resolveUserId();
    const name = (resolveUserName() || '').toLowerCase();

    // Check API resources first (match on userID; fall back to name only when no user ID is known)
    const inApiResources = activity?.resources?.some(p =>
      userId
        ? String(p.userID?._id ?? p.userID ?? '') === String(userId)
        : p.name?.toLowerCase() === name,
    );

    // Check local registrants
    const inLocalRegistrants = registrants.some(reg =>
      userId ? reg.userId === userId : reg.name?.toLowerCase() === name,
    );

    setIsAlreadyRegistered(inApiResources || inLocalRegistrants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, registrants, authUser, userProfile, tokenPayload]);

  const handleRegister = async () => {
    if (!activity) return;
    if (availability === 0) {
      toast.error('Unable to confirm attendance. No spots available.');
      return;
    }
    if (isAlreadyRegistered) {
      toast.info('You have already confirmed attendance for this event.');
      return;
    }
    if (isRegistering) return;

    const userId = resolveUserId();
    const displayName = resolveUserName();
    const jobTitle = resolveJobTitle();

    setIsRegistering(true);
    try {
      // Try API registration first if we have an _id
      if (activity._id) {
        const response = await axios.post(ENDPOINTS.REGISTER_FOR_EVENT(activity._id), {
          userId,
          name: displayName,
          profilePic: null,
          location: activity.location || 'TBD',
        });

        if (response.status === 200) {
          const updatedActivity = response.data?.activity || response.data;
          if (updatedActivity?.currentAttendees) {
            setActivity(updatedActivity);
          } else {
            setActivity(prev => ({
              ...prev,
              currentAttendees: (prev.currentAttendees || 0) + 1,
              resources: [
                ...(prev.resources || []),
                {
                  userID: userId,
                  name: displayName,
                  profilePic: '',
                  location: activity.location || 'Virtual',
                },
              ],
            }));
          }
          setIsAlreadyRegistered(true);
          toast.success('Your attendance has been confirmed.');
        }
      } else {
        // Fallback to local registration for mock activities
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRegistrants(prev => [
          ...prev,
          {
            userId: userId || `guest-${Date.now()}`,
            name: displayName,
            jobTitle,
            registeredAt: new Date().toISOString(),
          },
        ]);
        setIsAlreadyRegistered(true);
        toast.success('Your attendance has been confirmed.');
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        setIsAlreadyRegistered(true);
        toast.info('You have already confirmed attendance for this event.');
      } else {
        const serverMessage = err?.response?.data?.error || err?.response?.data?.message;
        toast.error(serverMessage || 'Failed to confirm attendance. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className={`${styles['main-container']} ${darkMode ? styles['bg-oxford-blue'] : ''}`}>
        <div className={`${styles['register-container']} ${darkMode ? styles['dark-mode'] : ''}`}>
          <div className={styles['loading-container']}>
            <div
              className={`${styles['loading-spinner']} ${
                darkMode ? styles['loading-spinner-dark'] : ''
              }`}
            />
            <p
              className={`${styles['loading-text']} ${darkMode ? styles['loading-text-dark'] : ''}`}
            >
              Loading activity details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No activity found
  if (error || !activity) {
    return (
      <div className={`${styles['main-container']} ${darkMode ? styles['bg-oxford-blue'] : ''}`}>
        <div className={`${styles['register-container']} ${darkMode ? styles['dark-mode'] : ''}`}>
          <div className={styles['error-container']}>
            <div className={styles['error-icon']}>❌</div>
            <p className={`${styles['error-text']} ${darkMode ? styles['error-text-dark'] : ''}`}>
              {error || 'Activity not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayTitle = activity.title || activity.name;
  const displayImage = activity.coverImage || activity.image;
  const displayDate = activityDate || activity.date || '';
  const displayStartTime = activityStartTime || activity.time || '';
  const displayEndTime = activityEndTime ? ` - ${activityEndTime}` : '';
  const registeredCount = activity._id ? activity.currentAttendees || 0 : registrants.length;
  // ShareAvailability expects name/date/time fields; API events use title/startTime instead
  const shareActivity = {
    ...activity,
    name: displayTitle,
    date: displayDate,
    time: `${displayStartTime}${displayEndTime}`,
  };

  return (
    <div className={`${styles['main-container']} ${darkMode ? styles['bg-oxford-blue'] : ''}`}>
      <div className={`${styles['register-container']} ${darkMode ? styles['dark-mode'] : ''}`}>
        {/* Left Column: Image + Register Button */}
        <div className={styles['left-column']}>
          <img src={displayImage} alt={displayTitle} className={styles['event-image']} />
          <button
            type="button"
            className={styles['register-button']}
            onClick={handleRegister}
            disabled={availability === 0 || isRegistering || isAlreadyRegistered}
          >
            {// eslint-disable-next-line no-nested-ternary
            (() => {
              if (isRegistering) return 'Registering...';
              if (isAlreadyRegistered) return 'Registered';
              if (availability === 0) return 'Event Full';
              return 'Register';
            })()}
          </button>
          <button
            type="button"
            className={styles['register-button']}
            onClick={() => history.push(`/communityportal/activity/${activityId}/attendance`)}
          >
            Attendance
          </button>
          <ShareAvailability
            activity={shareActivity}
            availability={availability}
            activityId={activityId}
          />
        </div>

        {/* Middle Column: Event Details */}
        <div className={styles['middle-column']}>
          <h1>{displayTitle}</h1>
          {(activity.type || activity.status) && (
            <div className={styles['badge-row']}>
              {activity.type && <span className={styles['type-badge']}>{activity.type}</span>}
              {activity.status && <span className={styles['status-badge']}>{activity.status}</span>}
            </div>
          )}
          <div className={styles['details-grid']}>
            <div className={styles['details-row']}>
              <p>
                <strong>Date:</strong> {displayDate}
              </p>
              <p>
                <strong>Time:</strong> {displayStartTime}
                {displayEndTime}
              </p>
              <p>
                <strong>Organizer:</strong> {activity.organizer || 'Not Specified'}
              </p>
            </div>
            <div className={styles['details-row']}>
              <p>
                <strong>Availability:</strong> {availability} spots left
              </p>
              {activity.rating !== undefined && (
                <p className={styles['rating-container']}>
                  <strong>Overall Rating:</strong>
                  <span className={styles['star-rating']}>
                    {Array.from({ length: 5 }).map((_, starIndex) => {
                      const key = `star-${activity.id || activity._id}-${starIndex}`;
                      return (
                        <span
                          key={key}
                          className={
                            starIndex < activity.rating
                              ? styles['filled-star']
                              : styles['empty-star']
                          }
                        >
                          {starIndex < activity.rating ? '★' : '☆'}
                        </span>
                      );
                    })}
                  </span>
                </p>
              )}
              <p>
                <strong>Status:</strong>{' '}
                {activity.status || (availability > 0 ? 'Available' : 'Full')}
              </p>
            </div>
            {activity.location && (
              <div className={styles['details-row']}>
                <p>
                  <strong>Location:</strong> {activity.location}
                </p>
              </div>
            )}
          </div>
          {registeredCount > 0 && (
            <div className={styles['registrants-summary']}>
              {/* wrapped in a span so the flex container doesn't drop the space after the number */}
              <span>
                <strong>{registeredCount}</strong> participant{registeredCount === 1 ? '' : 's'}{' '}
                registered
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Calendar */}
        <div className={styles['right-column']}>
          <div className={styles['calendar-container']}>
            <CalendarWidget
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              tileContent={tileContent}
            />
          </div>
          <p className={styles['selected-date']}>Selected Date: {selectedDate.toDateString()}</p>
          <div className={styles['calendar-legend']}>
            <div className={styles['legend-item']}>
              <span
                className={
                  darkMode
                    ? styles['indicator-available-dark']
                    : `${styles['legend-indicator']} ${styles['available']}`
                }
              >
                ●
              </span>
              <span className={styles['legend-text']}>Available</span>
            </div>
            <div className={styles['legend-item']}>
              <span
                className={
                  darkMode
                    ? styles['indicator-booked-dark']
                    : `${styles['legend-indicator']} ${styles['booked']}`
                }
              >
                ●
              </span>
              <span className={styles['legend-text']}>Booked/Unavailable</span>
            </div>
            <div className={styles['legend-item']}>
              <span
                className={
                  darkMode
                    ? styles['indicator-today-dark']
                    : `${styles['legend-indicator']} ${styles['today']}`
                }
              >
                ■
              </span>
              <span className={styles['legend-text']}>Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description / Tabs Section */}
      <div className={styles['description-section-wrapper']}>
        <EventDescription activity={activity} registrants={registrants} />
      </div>
    </div>
  );
}
export default Register;
