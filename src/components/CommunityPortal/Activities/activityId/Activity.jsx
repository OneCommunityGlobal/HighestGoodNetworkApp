import { useEffect, useState } from 'react';
import CommentSection from './CommentSection/CommentSection';
import ActivityFAQs from './ActivityFAQs';
import styles from './Activity.module.css';

const data = {
  eventName: 'Event Name',
  eventType: 'Event or Course',
  eventLocation: 'San Francisco, CA 94108',
  eventLink: 'https://devforum.zoom.us',
  eventDate: 'Monday, Sept 2',
  eventTime: '9:00 AM - 11:00 AM',
  eventOrganizer: 'Alex Brain',
  eventCapacity: '7/20',
  eventRating: 4,
  eventStatus: 'Activated',
  eventStatusClass: 'status-active',
  eventDescription:
    'this is activity comments. this is activity comments. this is activity comments. this is activity comments. this is activity comments.',
  eventParticipates: [
    { id: 1, name: 'Summer' },
    { id: 2, name: 'Jimmy' },
  ],
  eventComments: [
    {
      id: 1,
      name: 'Summer',
      comment:
        'this is activity comments. this is activity comments. this is activity comments. this is activity comments. this is activity comments.',
      time: '2 hours ago',
    },
    {
      id: 2,
      name: 'Jason',
      comment:
        'this is activity comments. this is activity comments. this is activity comments. this is activity comments. this is activity comments.',
      time: '2 hours ago',
    },
    {
      id: 3,
      name: 'Jimmy',
      comment:
        'this is activity comments. this is activity comments. this is activity comments. this is activity comments. this is activity comments.',
      time: '2 hours ago',
    },
  ],
  eventFAQs: [
    { id: 1, question: 'What is the event about?', answer: 'This is a sample answer to the FAQ.' },
    { id: 2, question: 'How do I register?', answer: 'This is a sample answer to the FAQ.' },
  ],
};

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
  const startOffset = first.getDay();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length < totalCells) days.push(null);
  return days;
}

function Activity({ initialTab }) {
  const [tab, setTab] = useState(initialTab || 'Description');
  const [event, setEvent] = useState(data);
  const now = new Date();
  const calendarYear = now.getFullYear();
  const calendarMonth = now.getMonth();
  const todayDate = now.getDate();
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const calendarDays = getCalendarDays(calendarYear, calendarMonth);

  const handleTabClick = tabName => {
    setTab(tabName);
  };

  useEffect(() => {
    setEvent(data);
  }, [data]);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  return (
    <div className={styles.container}>
      <div className={styles.eventCard}>
        <div className={styles.eventHeader}>
          <div className={styles.eventImage}>Participated</div>
          <div className={styles.eventDetails}>
            <p className={styles.eventType}>{event.eventType} / In-person or Remote</p>
            <h2 className={styles.eventTitle}>{event.eventName}</h2>
            <p className={styles.eventLocation}>
              <strong>Location:</strong> {event.eventLocation}
            </p>
            <p className={styles.eventLinkWrap}>
              <strong>Link:</strong>{' '}
              <a href="https://devforum.zoom.us" className={styles.eventLink}>
                {event.eventLink}
              </a>
            </p>
            <div className={styles.eventInfo}>
              <div>
                <strong>Date</strong>
                <br />
                {event.eventDate}
              </div>
              <div>
                <strong>Time</strong>
                <br />
                {event.eventTime}
              </div>
              <div>
                <strong>Organizer</strong>
                <br />
                {event.eventOrganizer}
              </div>
              <div>
                <strong>Capacity</strong>
                <br />
                <span className={styles.capacity}>{event.eventCapacity}</span>
              </div>
              <div>
                <strong>Overall Rating</strong>
                <br />
                {Array.from({ length: event.eventRating }, (_, i) => (
                  <span key={i}>★</span>
                ))}
                {Array.from({ length: 5 - event.eventRating }, (_, i) => (
                  <span key={i}>☆</span>
                ))}
              </div>
              <div>
                <strong>Status</strong>
                <br />
                <span className={styles.statusPill}>{event.eventStatus}</span>
              </div>
            </div>
            {event.eventParticipates && event.eventParticipates.length > 0 && (
              <div className={styles.participantAvatars}>
                {event.eventParticipates.slice(0, 5).map((p, i) => (
                  <span
                    key={p.id || i}
                    className={`${styles.avatar} ${i % 2 === 0 ? styles.purple : styles.blue}`}
                    title={p.name}
                  >
                    {p.name ? p.name[0] : '?'}
                  </span>
                ))}
                {event.eventParticipates.length > 5 && (
                  <span className={styles.avatarMore}>+{event.eventParticipates.length - 5}</span>
                )}
              </div>
            )}
            <div className={styles.eventButtons}>
              <button type="button" className={styles.feedbackBtn}>
                Feedback
              </button>
              <button type="button" className={styles.contactBtn}>
                Contact organizer
              </button>
            </div>
          </div>
          <div className={styles.calendarBox}>
            <div className={styles.calendarHeader}>{monthLabel}</div>
            <table className={styles.calendarTable}>
              <thead>
                <tr>
                  <th>S</th>
                  <th>M</th>
                  <th>T</th>
                  <th>W</th>
                  <th>T</th>
                  <th>F</th>
                  <th>S</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: calendarDays.length / 7 }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {calendarDays.slice(rowIndex * 7, rowIndex * 7 + 7).map((day, colIndex) => {
                      const isToday = day === todayDate;
                      return (
                        <td key={colIndex} className={isToday ? styles.activeDate : undefined}>
                          {day ?? '\u00A0'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.eventTabs}>
          <button
            className={`${styles.tab} ${tab === 'Description' ? styles.active : ''}`}
            onClick={() => handleTabClick('Description')}
            type="button"
          >
            Description
          </button>
          <button
            className={`${styles.tab} ${tab === 'Participates' ? styles.active : ''}`}
            onClick={() => handleTabClick('Participates')}
            type="button"
          >
            Participates
          </button>
          <button
            className={`${styles.tab} ${tab === 'Comments' ? styles.active : ''}`}
            onClick={() => handleTabClick('Comments')}
            type="button"
          >
            Comments
          </button>
          <button
            className={`${styles.tab} ${tab === 'FAQs' ? styles.active : ''}`}
            onClick={() => handleTabClick('FAQs')}
            type="button"
          >
            FAQs
          </button>
        </div>
        {tab === 'Description' && (
          <div className={styles.eventDescription}>
            <p>{event.eventDescription}</p>
          </div>
        )}
        {tab === 'Participates' && (
          <div className={styles.participatesSection}>
            {event.eventParticipates.map(participant => (
              <div key={participant.id} className={styles.participant}>
                <span
                  className={`${styles.icon} ${
                    participant.id % 2 === 0 ? styles.purple : styles.blue
                  }`}
                >
                  {participant.name[0]}
                </span>
                <div className={styles.participantName}>{participant.name}</div>
              </div>
            ))}
          </div>
        )}
        {tab === 'FAQs' && (
          <div className={styles.faqsSection}>
            <ActivityFAQs />
          </div>
        )}
        {tab === 'Comments' && <CommentSection comments={event.eventComments} />}
      </div>
    </div>
  );
}

export default Activity;
