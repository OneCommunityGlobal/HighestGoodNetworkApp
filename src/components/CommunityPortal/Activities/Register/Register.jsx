import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import styles from './Register.module.css';
import { ENDPOINTS } from '../../../../utils/URL';
import EventDescription from './EventDescription';
import ShareAvailability from './ShareAvailability';

// Optional helpers (kept from development branch)
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

  // Decode token safely
  const tokenPayload = useMemo(() => {
    try {
      const token = window.localStorage.getItem('token');
      if (!token) return null;
      const segment = token.split('.')[1];
      const decoded = window.atob(segment);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }, []);

  // Load registrants
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setRegistrants(stored ? JSON.parse(stored) : []);
    } catch {
      setRegistrants([]);
    }
  }, [storageKey]);

  // Save registrants
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(registrants));
  }, [registrants, storageKey]);

  // Fetch activity
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const res = await axios.get(ENDPOINTS.EVENTS_BY_ID(activityId));
        setActivity(res.data);
      } catch {
        setError('Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

  // Format date/time
  useEffect(() => {
    if (!activity) return;

    const start = new Date(activity.startTime);
    const end = new Date(activity.endTime);

    setActivityDate(start.toLocaleDateString());
    setActivityStartTime(start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setActivityEndTime(end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [activity]);

  // Availability
  useEffect(() => {
    if (!activity) return;
    const remaining = activity.maxAttendees - activity.currentAttendees;
    setAvailability(remaining > 0 ? remaining : 0);
  }, [activity, registrants]);

  const resolveUserName = () =>
    userProfile?.firstName
      ? `${userProfile.firstName} ${userProfile.lastName || ''}`
      : authUser?.email || 'Participant';

  const isAlreadyRegistered = useMemo(() => {
    const name = resolveUserName();
    return registrants.some(r => r.name === name);
  }, [registrants]);

  const handleRegister = async () => {
    if (availability === 0) return toast.error('No spots available');
    if (isAlreadyRegistered) return toast.error('Already registered');

    setIsRegistering(true);

    setTimeout(() => {
      setRegistrants(prev => [
        ...prev,
        {
          name: resolveUserName(),
          registeredAt: new Date().toISOString(),
        },
      ]);
      toast.success('Registered!');
      setIsRegistering(false);
    }, 1000);
  };

  const handleShareAvailability = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: activity.title,
          text: `Join me for ${activity.title}`,
          url: window.location.href,
        });
      } else {
        toast.info('Sharing not supported');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Loading
  if (loading) {
    return <div className={styles.mainContainer}>Loading...</div>;
  }

  // Error
  if (error || !activity) {
    return <div className={styles.mainContainer}>Activity not found</div>;
  }

  return (
    <div className={`${styles.mainContainer} ${darkMode ? styles.mainContainerDark : ''}`}>
      <div className={styles.contentWrapper}>
        <div className={styles.eventPage}>
          {/* HERO */}
          <section className={styles.heroSection}>
            <img src={activity.coverImage} alt={activity.title} className={styles.heroImage} />

            <h1>{activity.title}</h1>

            <p>{activityDate}</p>
            <p>{activityStartTime} - {activityEndTime}</p>

            <button onClick={handleRegister} disabled={isAlreadyRegistered || availability === 0}>
              {isAlreadyRegistered ? 'Registered' : 'Register'}
            </button>

            <button onClick={handleShareAvailability}>
              Share Availability
            </button>

            <p>{availability} spots left</p>
          </section>

          {/* MAIN CONTENT */}
          <section className={styles.contentSection}>
            <div className={styles.mainContent}>
              <div className={styles.infoCard}>
                <h2>About</h2>
                <p>{activity.description}</p>
              </div>

              <div className={styles.infoCard}>
                <h2>Details</h2>
                <p>Location: {activity.location}</p>
                <p>Organizer: {activity.organizer}</p>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
              <div className={styles.sideCard}>
                <p>Attendees: {activity.currentAttendees}</p>
                <p>Max: {activity.maxAttendees}</p>
                <p>Left: {availability}</p>
              </div>

              <ShareAvailability
                activity={activity}
                availability={availability}
                activityId={activityId}
              />
            </aside>
          </section>

          {/* DESCRIPTION */}
          <div className={styles.descriptionSection}>
            <EventDescription activity={activity} registrants={registrants} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;