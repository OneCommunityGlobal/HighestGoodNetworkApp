import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CalendarWidget from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

import styles from './Register.module.css';
import { ENDPOINTS } from '../../../../utils/URL';

import EventDescription from './EventDescription';
import ShareAvailability from './ShareAvailability';

/* =========================
   MOCK DATA (KEEP ONLY ONCE)
========================= */

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

const formatDateOnly = value => {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const formatTimeOnly = value => {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

function Register() {
  const { activityId } = useParams();

  const darkMode = useSelector(state => state.theme?.darkMode);
  const userProfile = useSelector(state => state.userProfile);
  const authUser = useSelector(state => state.auth?.user);

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrants, setRegistrants] = useState([]);

  const storageKey = useMemo(() => `activity-${activityId}-registrants`, [activityId]);

  /* =========================
     LOCAL STORAGE
  ========================= */

  useEffect(() => {
    try {
      const stored = globalThis.localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      setRegistrants(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRegistrants([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      globalThis.localStorage.setItem(storageKey, JSON.stringify(registrants));
    } catch {}
  }, [registrants, storageKey]);

  /* =========================
     FETCH ACTIVITY
  ========================= */

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(ENDPOINTS.EVENTS_BY_ID(activityId));

        const raw = res.data;

        const normalized = {
          id: raw.id,
          name: raw.title || raw.name,
          date: formatDateOnly(raw.date || raw.startDate),
          time: formatTimeOnly(raw.time || raw.startTime || raw.date),
          location: raw.location || raw.venue,
          organizer: raw.organizer,
          capacity: Number(raw.capacity ?? 0),
          rating: raw.rating,
          description: raw.description,
          image: raw.coverImage || raw.image,
        };

        setActivity(normalized);
      } catch {
        const mock = MOCK_ACTIVITIES.find(a => a.id === Number(activityId));

        if (mock) setActivity(mock);
        else setError('Activity not found');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

  /* =========================
     AVAILABILITY
  ========================= */

  useEffect(() => {
    if (!activity) return;

    const capacity = Number(activity.capacity ?? 0);
    const used = registrants.length;

    setAvailability(Math.max(0, capacity - used));
  }, [activity, registrants]);

  /* =========================
     CALENDAR
  ========================= */

  const isDateBooked = date =>
    MOCK_BOOKED_DATES.some(
      d =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear(),
    );

  const isDateAvailable = date =>
    MOCK_AVAILABLE_DATES.some(
      d =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear(),
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

  /* =========================
     USER NAME
  ========================= */

  const resolveUserName = () => {
    const first = userProfile?.firstName || authUser?.firstName;
    const last = userProfile?.lastName || authUser?.lastName;

    if (first && last) return `${first} ${last}`;
    return authUser?.email || 'Participant';
  };

  /* =========================
     REGISTER
  ========================= */

  const handleRegister = async () => {
    if (availability === 0) return toast.error('No spots available');

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

  /* =========================
     LOADING / ERROR
  ========================= */

  if (loading) return <div className={styles.mainContainer}>Loading...</div>;

  if (error || !activity) return <div className={styles.mainContainer}>Activity not found</div>;

  const displayTitle = activity.title || activity.name;
  const displayImage = activity.coverImage || activity.image;

  /* =========================
     RENDER
  ========================= */

  return (
    <div className={`${styles['main-container']} ${darkMode ? styles['dark-mode'] : ''}`}>
      <div className={styles['register-container']}>
        {/* LEFT */}
        <div className={styles['left-column']}>
          <img src={displayImage} alt={displayTitle} className={styles['event-image']} />

          <button
            className={styles['register-button']}
            onClick={handleRegister}
            disabled={availability === 0 || isRegistering}
          >
            {isRegistering ? 'Registering...' : 'Register'}
          </button>

          <ShareAvailability
            activity={activity}
            availability={availability}
            activityId={activityId}
          />
        </div>

        {/* MIDDLE */}
        <div className={styles['middle-column']}>
          <h1>{displayTitle}</h1>
          <p>{activity.description}</p>
        </div>

        {/* RIGHT */}
        <div className={styles['right-column']}>
          <div className={styles['calendar-container']}>
            <CalendarWidget
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              tileContent={tileContent}
            />
          </div>
        </div>
      </div>

      <EventDescription activity={activity} registrants={registrants} />
    </div>
  );
}

export default Register;
