import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './Register.module.css';
import EventDescription from './EventDescription';
import Calendar from 'react-calendar';

function Register() {
  const { activityId } = useParams();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const userProfile = useSelector(state => state.userProfile);
  const authUser = useSelector(state => state.auth?.user);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [availability, setAvailability] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrants, setRegistrants] = useState([]);
  const feedbackTimeoutRef = useRef(null);
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
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

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
      console.error('Failed to load saved registrants', err);
      setRegistrants([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(registrants));
    } catch (err) {
      console.error('Failed to persist registrants', err);
    }
  }, [registrants, storageKey]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const fetchedActivities = [
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
              {
                question: 'Is it beginner-friendly?',
                answer: 'Yes, it is suitable for all levels.',
              },
            ],
            participants: ['John Doe', 'Jane Smith', 'Alice Brown'],
            comments: ['Looking forward to this!', 'This will be my first yoga session!'],
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
              {
                question: 'Do I need to read the book beforehand?',
                answer: "Yes, it's recommended.",
              },
              {
                question: 'Are snacks provided?',
                answer: 'Yes, light refreshments will be available.',
              },
            ],
            participants: ['Emily White', 'Michael Green'],
            comments: ['Excited to discuss my favorite book!', 'What book are we reading?'],
          },
        ];

        const selectedActivity = fetchedActivities.find(
          fetchedActivity => fetchedActivity.id === parseInt(activityId, 10),
        );

        if (selectedActivity) {
          setActivity(selectedActivity);
          let savedCount = 0;
          if (typeof window !== 'undefined') {
            try {
              const existing = window.localStorage.getItem(storageKey);
              if (existing) {
                const parsed = JSON.parse(existing);
                if (Array.isArray(parsed)) {
                  savedCount = parsed.length;
                }
              }
            } catch (storageErr) {
              console.error('Failed to read saved registrants during fetch', storageErr);
            }
          }
          const baseCount = Array.isArray(selectedActivity.participants)
            ? selectedActivity.participants.length
            : 0;
          const remaining = selectedActivity.capacity - baseCount - savedCount;
          setAvailability(remaining > 0 ? remaining : 0);
        } else {
          setError('Activity not found');
        }
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
    const baseCount = Array.isArray(activity.participants) ? activity.participants.length : 0;
    const remaining = activity.capacity - baseCount - registrants.length;
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

  const scheduleFeedbackClear = () => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackMessage(null);
    }, 5000);
  };

  const isAlreadyRegistered = useMemo(() => {
    if (!registrants.length) return false;
    const userId = resolveUserId();
    const name = resolveUserName().toLowerCase();
    return registrants.some(reg => {
      if (userId) return reg.userId === userId;
      return reg.name.toLowerCase() === name;
    });
  }, [registrants, authUser, userProfile, tokenPayload]);

  const participantList = useMemo(() => {
    const base = Array.isArray(activity?.participants) ? activity.participants : [];
    const dynamic = registrants.map(r => r?.name).filter(Boolean);
    const combined = [...dynamic, ...base];
    const seen = new Set();
    return combined
      .map(name => (typeof name === 'string' ? name.trim() : ''))
      .filter(name => {
        const key = name.toLowerCase();
        if (!name || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [activity?.participants, registrants]);

  const handleRegister = async () => {
    if (!activity) return;
    if (availability === 0) {
      setFeedbackMessage({ type: 'error', text: 'Registration failed. No spots available.' });
      scheduleFeedbackClear();
      return;
    }

    if (isRegistering) return;

    const userId = resolveUserId();
    const displayName = resolveUserName();
    const jobTitle = resolveJobTitle();

    if (isAlreadyRegistered) {
      setFeedbackMessage({ type: 'error', text: 'You are already registered for this event.' });
      scheduleFeedbackClear();
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

      setFeedbackMessage({
        type: 'success',
        text: 'Registration successful! See you at the event.',
      });
      scheduleFeedbackClear();
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: 'Registration failed. Please try again.',
      });
      scheduleFeedbackClear();
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShareAvailability = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: activity.name,
          text: `I'm available for ${activity.name}. Join me!`,
          url: window.location.href,
        });
      } else {
        setFeedbackMessage({
          type: 'info',
          text: 'Sharing is not supported on this device.',
        });
        scheduleFeedbackClear();
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.mainContainer} ${darkMode ? styles.mainContainerDark : ''}`}>
        <div className={`${styles.contentWrapper} ${darkMode ? styles.contentWrapperDark : ''}`}>
          <div className={styles.loadingContainer}>
            <div
              className={`${styles.loadingSpinner} ${darkMode ? styles.loadingSpinnerDark : ''}`}
            ></div>
            <p className={`${styles.loadingText} ${darkMode ? styles.loadingTextDark : ''}`}>
              Loading activity details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${styles.mainContainer} ${darkMode ? styles.mainContainerDark : ''}`}>
        <div className={`${styles.contentWrapper} ${darkMode ? styles.contentWrapperDark : ''}`}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={`${styles.errorText} ${darkMode ? styles.errorTextDark : ''}`}>{error}</p>
            <button
              className={`${styles.retryButton} ${darkMode ? styles.retryButtonDark : ''}`}
              onClick={handleRetry}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No activity found
  if (!activity) {
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
        <div
          className={`${styles.registerContainer} ${darkMode ? styles.registerContainerDark : ''}`}
        >
          {/* Event Header: Image | Details | Calendar */}
          <div className={`${styles.eventHeader} ${darkMode ? styles.eventHeaderDark : ''}`}>
            {/* Left Section: Image + Register Button */}
            <div className={styles.eventImageSection}>
              <img src={activity.image} alt={activity.name} className={styles.eventImage} />
              <button
                type="button"
                className={`${styles.registerButton} ${darkMode ? styles.registerButtonDark : ''} ${
                  isRegistering ? styles.registerButtonRegistering : ''
                }`}
                onClick={handleRegister}
                disabled={availability === 0 || isRegistering || isAlreadyRegistered}
              >
                {isRegistering ? 'Registering...' : isAlreadyRegistered ? 'Registered' : 'Register'}
              </button>
              {feedbackMessage && (
                <div
                  className={`${styles.feedbackMessage} ${
                    feedbackMessage.type === 'success'
                      ? `${styles.feedbackMessageSuccess} ${
                          darkMode ? styles.feedbackMessageSuccessDark : ''
                        }`
                      : `${styles.feedbackMessageError} ${
                          darkMode ? styles.feedbackMessageErrorDark : ''
                        }`
                  }`}
                >
                  {feedbackMessage.text}
                </div>
              )}
            </div>

            {/* Center Section: Event Details & Metadata */}
            <div
              className={`${styles.eventDetailsSection} ${
                darkMode ? styles.eventDetailsSectionDark : ''
              }`}
            >
              {/* Title and Status Badge */}
              <div className={styles.eventHeaderTop}>
                <div>
                  <p className={`${styles.eventType} ${darkMode ? styles.eventTypeDark : ''}`}>
                    {activity.type}
                  </p>
                  <h1 className={`${styles.eventTitle} ${darkMode ? styles.eventTitleDark : ''}`}>
                    {activity.name}
                  </h1>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    availability > 0 ? styles.statusBadgeActive : styles.statusBadgeFull
                  } ${
                    darkMode
                      ? availability > 0
                        ? styles.statusBadgeActiveDark
                        : styles.statusBadgeFullDark
                      : ''
                  }`}
                >
                  {availability > 0 ? 'Available' : 'Full'}
                </span>
              </div>

              {/* Metadata Grid */}
              <div className={styles.metadataGrid}>
                {/* First Row: Date, Time, Organizer */}
                <div className={styles.metadataRow}>
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Date</span>
                    <span
                      className={`${styles.metadataValue} ${
                        darkMode ? styles.metadataValueDark : ''
                      }`}
                    >
                      {activity.date}
                    </span>
                  </div>
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Time</span>
                    <span
                      className={`${styles.metadataValue} ${
                        darkMode ? styles.metadataValueDark : ''
                      }`}
                    >
                      {activity.time}
                    </span>
                  </div>
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Organizer</span>
                    <span
                      className={`${styles.metadataValue} ${
                        darkMode ? styles.metadataValueDark : ''
                      }`}
                    >
                      {activity.organizer}
                    </span>
                  </div>
                </div>

                {/* Second Row: Capacity, Rating, Availability */}
                <div className={styles.metadataRow}>
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Capacity</span>
                    <span
                      className={`${styles.metadataValue} ${
                        darkMode ? styles.metadataValueDark : ''
                      } ${styles.capacityValue}`}
                    >
                      {(activity.participants?.length || 0) + registrants.length}/
                      {activity.capacity}
                    </span>
                  </div>
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Rating</span>
                    <span className={styles.starRating}>
                      {[...Array(5)].map((_, starIndex) => (
                        <span
                          key={`star-${activity.id}-${starIndex}`}
                          className={
                            starIndex < activity.rating
                              ? styles.filledStar
                              : `${styles.emptyStar} ${darkMode ? styles.emptyStarDark : ''}`
                          }
                        >
                          {starIndex < activity.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Availability</span>
                    <span className={styles.availabilityContainer}>
                      <span
                        className={`${styles.availabilityBadge} ${
                          availability > 5
                            ? styles.availabilityBadgeHigh
                            : availability > 0
                            ? styles.availabilityBadgeLow
                            : styles.availabilityBadgeNone
                        } ${
                          darkMode
                            ? availability > 5
                              ? styles.availabilityBadgeHighDark
                              : availability > 0
                              ? styles.availabilityBadgeLowDark
                              : styles.availabilityBadgeNoneDark
                            : ''
                        }`}
                      >
                        {availability} spots
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Actions */}
              <div className={styles.secondaryActionWrapper}>
                <div className={styles.locationDisplay}>
                  <span className={`${styles.locationIcon}`}>📍</span>
                  <span
                    className={`${styles.locationText} ${darkMode ? styles.locationTextDark : ''}`}
                  >
                    {activity.location}
                  </span>
                </div>

                <div className={styles.secondaryActions}>
                  <div
                    className={`${styles.participantAvatars} ${
                      darkMode ? styles.participantAvatarsDark : ''
                    }`}
                    aria-hidden={participantList.length === 0}
                  >
                    {participantList.slice(0, 5).map((p, i) => {
                      const initials = p
                        .split(' ')
                        .map(s => s[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();
                      return (
                        <div
                          key={`p-${i}`}
                          className={`${styles.avatar} ${darkMode ? styles.avatarDark : ''}`}
                          title={p}
                        >
                          <span>{initials}</span>
                        </div>
                      );
                    })}
                    {participantList.length > 5 && (
                      <div
                        className={`${styles.avatarMore} ${darkMode ? styles.avatarMoreDark : ''}`}
                        title={`${participantList.length - 5} more`}
                      >
                        +{participantList.length - 5}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`${styles.secondaryButton} ${
                      darkMode ? styles.secondaryButtonDark : ''
                    }`}
                    onClick={handleShareAvailability}
                  >
                    Share Availability
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section: Calendar */}
            <div
              className={`${styles.calendarSection} ${darkMode ? styles.calendarSectionDark : ''}`}
            >
              <p
                className={`${styles.calendarHeader} ${darkMode ? styles.calendarHeaderDark : ''}`}
              >
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <p className={`${styles.selectedDate} ${darkMode ? styles.selectedDateDark : ''}`}>
                Selected: {selectedDate.toDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Description Section with Tabs */}
        <div
          className={`${styles.descriptionSectionWrapper} ${
            darkMode ? styles.descriptionSectionWrapperDark : ''
          }`}
        >
          <EventDescription activity={activity} registrants={registrants} />
        </div>
      </div>
    </div>
  );
}

export default Register;
