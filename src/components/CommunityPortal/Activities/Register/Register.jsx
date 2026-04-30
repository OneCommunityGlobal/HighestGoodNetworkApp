import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './Register.module.css';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';

function isTomorrow(dateString) {
  const input = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return input >= tomorrow && input < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
}

function isComingWeekend(dateString) {
  const input = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);
  return input >= saturday && input <= sunday;
}

function Register() {
  const { activityId } = useParams();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const userProfile = useSelector(state => state.userProfile);
  const authUser = useSelector(state => state.auth?.user);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityDate, setActivityDate] = useState('');
  const [activityStartTime, setActivityStartTime] = useState('');
  const [activityEndTime, setActivityEndTime] = useState('');
  const [availability, setAvailability] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrants, setRegistrants] = useState([]);
  const storageKey = useMemo(() => `activity-${activityId}-registrants`, [activityId]);

  const tokenPayload = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.atob !== 'function') {
      return null;
    }
    try {
      const token = window.localStorage.getItem('token');
      if (!token) return null;
      const segment = token.split('.')[1];
      if (!segment) return null;
      const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        '=',
      );
      const decoded = window.atob(padded);
      return JSON.parse(decoded);
    } catch (err) {
      return null;
    }
  }, [authUser?.userid]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) {
        setRegistrants([]);
        return;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setRegistrants(parsed);
      } else {
        setRegistrants([]);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load saved registrants', err);
      setRegistrants([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(registrants));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to persist registrants', err);
    }
  }, [registrants, storageKey]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(ENDPOINTS.EVENTS_BY_ID(activityId));
        setActivity(response.data || []);
      } catch (err) {
        setError('Failed to load activity details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

  useEffect(() => {
    if (!activity) return;
    const eventDateTime = new Date(activity.startTime);
    const eventDate = new Date(
      new Intl.DateTimeFormat('en-US', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(eventDateTime),
    );
    setActivityDate(eventDate.toLocaleDateString());

    const timeString = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(new Date(eventDateTime));
    setActivityStartTime(timeString);

    const endTimeString = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(new Date(activity.endTime));
    setActivityEndTime(endTimeString);
  }, [activity]);

  useEffect(() => {
    if (!activity) return;
    const baseCount = activity.currentAttendees;
    const remaining = activity.maxAttendees - baseCount;
    setAvailability(remaining > 0 ? remaining : 0);
  }, [activity, registrants]);

  const resolveUserId = () =>
    authUser?.userid ||
    authUser?._id ||
    userProfile?._id ||
    tokenPayload?.userId ||
    tokenPayload?._id ||
    null;

  const resolveNameFromStorage = () => {
    if (typeof window === 'undefined') return null;
    const candidate =
      window.localStorage.getItem('preferredName') ||
      window.localStorage.getItem('firstName') ||
      window.localStorage.getItem('name');
    if (candidate) return candidate.trim();
    const email = authUser?.email || userProfile?.email || tokenPayload?.email;
    if (!email) return null;
    const [localPart] = email.split('@');
    return localPart ? localPart.replace(/[._-]+/g, ' ').trim() : null;
  };

  const resolveNameFromToken = () => {
    if (!tokenPayload) return null;
    const first = tokenPayload.firstName || tokenPayload.firstname || tokenPayload.given_name;
    const last = tokenPayload.lastName || tokenPayload.lastname || tokenPayload.family_name;
    if (first && last) return `${first} ${last}`.trim();
    if (first) return first.trim();
    if (last) return last.trim();
    if (tokenPayload.name) return tokenPayload.name.trim();
    if (tokenPayload.email) {
      const [localPart] = tokenPayload.email.split('@');
      return localPart ? localPart.replace(/[._-]+/g, ' ').trim() : null;
    }
    return null;
  };

  const resolveUserName = () => {
    const firstName =
      userProfile?.firstName ||
      authUser?.firstName ||
      tokenPayload?.firstName ||
      tokenPayload?.firstname;
    const lastName =
      userProfile?.lastName ||
      authUser?.lastName ||
      tokenPayload?.lastName ||
      tokenPayload?.lastname;
    if (firstName && lastName) return `${firstName} ${lastName}`.trim();
    if (firstName) return firstName.trim();
    if (lastName) return lastName.trim();
    const tokenName = resolveNameFromToken();
    if (tokenName) return tokenName;
    const fallback = resolveNameFromStorage();
    return fallback || 'Participant';
  };

  const resolveJobTitleFromToken = () =>
    tokenPayload?.jobTitle || tokenPayload?.title || tokenPayload?.position || null;

  const resolveJobTitle = () =>
    userProfile?.jobTitle || resolveJobTitleFromToken() || 'Participant';

  const isAlreadyRegistered = useMemo(() => {
    if (!registrants.length) return false;
    const userId = resolveUserId();
    const name = resolveUserName().toLowerCase();
    return registrants.some(reg => {
      if (userId) return reg.userId === userId;
      return reg.name.toLowerCase() === name;
    });
  }, [registrants, authUser, userProfile, tokenPayload]);

  const handleRegister = async () => {
    if (!activity) return;
    if (availability === 0) {
      toast.error('Registration failed. No spots available.');
      return;
    }

    if (isRegistering) return;

    const userId = resolveUserId();
    const displayName = resolveUserName();
    const jobTitle = resolveJobTitle();

    if (isAlreadyRegistered) {
      toast.error('You are already registered for this event.');
      return;
    }

    setIsRegistering(true);

    try {
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

      toast.success('Registration successful! See you at the event.');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShareAvailability = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: activity.title,
          text: `I'm available for ${activity.title}. Join me!`,
          url: window.location.href,
        });
      } else {
        toast.info('Sharing is not supported on this device.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Share failed:', err);
    }
  };

  if (loading) {
    return (
      <div className={`${styles.mainContainer} ${darkMode ? styles.mainContainerDark : ''}`}>
        <div className={`${styles.contentWrapper} ${darkMode ? styles.contentWrapperDark : ''}`}>
          <div className={styles.loadingContainer}>
            <div
              className={`${styles.loadingSpinner} ${darkMode ? styles.loadingSpinnerDark : ''}`}
            />
            <p className={`${styles.loadingText} ${darkMode ? styles.loadingTextDark : ''}`}>
              Loading activity details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className={`${styles.mainContainer} ${darkMode ? styles.mainContainerDark : ''}`}>
        <div className={`${styles.contentWrapper} ${darkMode ? styles.contentWrapperDark : ''}`}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>❌</div>
            <p className={`${styles.errorText} ${darkMode ? styles.errorTextDark : ''}`}>
              Activity not found
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContainer} ${darkMode ? styles.mainContainerDark : ''}`}>
      <div className={`${styles.contentWrapper} ${darkMode ? styles.contentWrapperDark : ''}`}>
        <div className={`${styles.eventPage} ${darkMode ? styles.eventPageDark : ''}`}>
          <section className={styles.heroSection}>
            <div className={styles.heroImageWrapper}>
              <img src={activity.coverImage} alt={activity.title} className={styles.heroImage} />
            </div>

            <div className={styles.heroContent}>
              <div className={styles.heroHeader}>
                <span className={styles.typeBadge}>{activity.type}</span>
                <span className={styles.statusBadge}>{activity.status}</span>
              </div>

              <h1 className={styles.eventTitle}>{activity.title}</h1>

              <div className={styles.metaGrid}>
                <div>
                  <strong>Date:</strong> {activityDate}
                </div>
                <div>
                  <strong>Time:</strong> {activityStartTime} - {activityEndTime}
                </div>
                <div>
                  <strong>Location:</strong> {activity.location || 'To Be Decided'}
                </div>
                <div>
                  <strong>Organizer:</strong> {activity.organizer || 'Not Specified'}
                </div>
              </div>

              <div className={styles.heroActions}>
                <button
                  type="button"
                  className={`${styles.registerButton} ${
                    darkMode ? styles.registerButtonDark : ''
                  }`}
                  onClick={handleRegister}
                  disabled={availability === 0 || isRegistering || isAlreadyRegistered}
                >
                  {isRegistering
                    ? 'Registering...'
                    : isAlreadyRegistered
                    ? 'Registered'
                    : 'Register'}
                </button>

                <button
                  type="button"
                  className={`${styles.secondaryButton} ${
                    darkMode ? styles.secondaryButtonDark : ''
                  }`}
                  onClick={handleShareAvailability}
                >
                  Share Availability
                </button>

                <div className={styles.quickStats}>
                  <span>{availability} spots left</span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.contentSection}>
            <div className={styles.mainContent}>
              <div className={styles.infoCard}>
                <h2>About this event</h2>
                <p>{activity.description}</p>
              </div>

              <div className={styles.infoCard}>
                <h2>Event details</h2>
                <div className={styles.detailsList}>
                  <p>
                    <strong>Type:</strong> {activity.type}
                  </p>
                  <p>
                    <strong>Location:</strong> {activity.location}
                  </p>
                  <p>
                    <strong>Status:</strong> {activity.status}
                  </p>
                  <p>
                    <strong>Active:</strong> {activity.isActive ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Organizer:</strong> {activity.organizer || 'Organizer not specified'}
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <h2>Facilitators / Resources</h2>
                <div className={styles.resourceList}>
                  {activity.resources?.map(person => (
                    <div key={person._id} className={styles.resourceCard}>
                      <div>
                        <p className={styles.resourceName}>{person.name}</p>
                        <p className={styles.resourceLocation}>{person.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sideCard}>
                <h3>Registration summary</h3>
                <p>
                  <strong>Current attendees:</strong> {activity.currentAttendees}
                </p>
                <p>
                  <strong>Max attendees:</strong> {activity.maxAttendees}
                </p>
                <p>
                  <strong>Spots left:</strong> {availability}
                </p>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Register;
