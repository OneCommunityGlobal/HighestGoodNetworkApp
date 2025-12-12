import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Register.module.css';
import EventDescription from './EventDescription';

function Register() {
  const { activityId } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [activity, setActivity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [availability, setAvailability] = useState(0);

  // Mock booked dates - in real app, this would come from API
  const bookedDates = [
    new Date(2025, 11, 15), // Dec 15, 2025
    new Date(2025, 11, 20), // Dec 20, 2025
    new Date(2025, 11, 25), // Dec 25, 2025
    new Date(2026, 0, 5), // Jan 5, 2026
  ];
  useEffect(() => {
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
          { question: 'Is it beginner-friendly?', answer: 'Yes, it is suitable for all levels.' },
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
          { question: 'Do I need to read the book beforehand?', answer: "Yes, it's recommended." },
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
      setAvailability(selectedActivity.capacity);
    }
  }, [activityId]);
  const handleRegister = () => {
    if (availability > 0) {
      setAvailability(prev => prev - 1);
      setFeedbackMessage({
        type: 'success',
        text: 'Registration successful! See you at the event.',
      });
    } else {
      setFeedbackMessage({ type: 'error', text: 'Registration failed. No spots available.' });
    }
  };

  // Helper function to check if a date is booked
  const isDateBooked = date => {
    return bookedDates.some(
      bookedDate =>
        bookedDate.getDate() === date.getDate() &&
        bookedDate.getMonth() === date.getMonth() &&
        bookedDate.getFullYear() === date.getFullYear(),
    );
  };

  // Add custom class names to tiles for booked dates
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && isDateBooked(date)) {
      return 'booked-date';
    }
    return null;
  };

  // Add content to booked dates
  const tileContent = ({ date, view }) => {
    if (view === 'month' && isDateBooked(date)) {
      return <div className={styles['booked-indicator']}>●</div>;
    }
    return null;
  };

  if (!activity) return <p>Loading activity details...</p>;
  return (
    <div className={`${styles['main-container']} ${darkMode ? styles['bg-oxford-blue'] : ''}`}>
      <div className={`${styles['register-container']} ${darkMode ? styles['dark-mode'] : ''}`}>
        {/* Left Column: Image + Register Button */}
        <div className={styles['left-column']}>
          <img src={activity.image} alt={activity.name} className={styles['event-image']} />
          <button
            type="button"
            className={styles['register-button']}
            onClick={handleRegister}
            disabled={availability === 0}
          >
            Register
          </button>
          {feedbackMessage && (
            <div
              className={`${styles['feedback-message']} ${
                feedbackMessage.type === 'success' ? styles['success'] : styles['error']
              }`}
            >
              {feedbackMessage.text}
            </div>
          )}
        </div>
        <div className={styles['middle-column']}>
          <h1>{activity.name}</h1>
          <div className={styles['details-grid']}>
            <div className={styles['details-row']}>
              <p>
                <strong>Date:</strong> {activity.date}
              </p>
              <p>
                <strong>Time:</strong> {activity.time}
              </p>
              <p>
                <strong>Organizer:</strong> {activity.organizer || 'Not Available'}
              </p>
            </div>
            <div className={styles['details-row']}>
              <p>
                <strong>Availability:</strong> {availability} spots left
              </p>
              <p className={styles['rating-container']}>
                <strong>Overall Rating:</strong>
                <span className={styles['star-rating']}>
                  {[...Array(5)].map((_, starIndex) => {
                    const key = `star-${activity.id}-${starIndex}`;
                    return (
                      <span
                        key={key}
                        className={
                          starIndex < activity.rating ? styles['filled-star'] : styles['empty-star']
                        }
                      >
                        {starIndex < activity.rating ? '★' : '☆'}
                      </span>
                    );
                  })}
                </span>
              </p>
              <p>
                <strong>Status:</strong> {availability > 0 ? 'Available' : 'Full'}
              </p>
            </div>
          </div>
        </div>
        <div className={styles['right-column']}>
          <div className={styles['calendar-container']}>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              tileContent={tileContent}
            />
          </div>
          <p className={styles['selected-date']}>Selected Date: {selectedDate.toDateString()}</p>
          <div className={styles['calendar-legend']}>
            <div className={styles['legend-item']}>
              <span className={`${styles['legend-indicator']} ${styles['booked']}`}>●</span>
              <span className={styles['legend-text']}>Booked/Unavailable</span>
            </div>
            <div className={styles['legend-item']}>
              <span className={`${styles['legend-indicator']} ${styles['today']}`}>■</span>
              <span className={styles['legend-text']}>Today</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles['description-section']}>
        <EventDescription darkMode={darkMode} />
      </div>
    </div>
  );
}
export default Register;
