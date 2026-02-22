import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CommentSection from './CommentSection/CommentSection';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Feedback from './FeedBackSection/Feedback';
import { feedbackData } from './FeedbackData';
import styles from './ActivityFeedback.module.css';

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
  createdAt: '2025-09-20',
  eventDescription:
    'this is activity comments. this is activity comments. this is activity comments. this is activity comments. this is activity comments.',
  eventParticipates: [{ name: 'Summer' }, { name: 'Jimmy' }],
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

const getAvatarColorClass = (name = '', index = 0, stylesRef) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const isPurple = (hash + index) % 2 === 0;
  return isPurple ? stylesRef.purple : stylesRef.blue;
};

function ActivityFeedback() {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const [tab, setTab] = useState('Feedback');
  const [event, setEvent] = useState(data);
  const [viewSelected, setViewSelected] = useState('Host');
  const [reviewsChecked, setReviewsChecked] = useState(true);
  const [suggestionChecked, setSuggestionChecked] = useState(false);
  const [feedbackList, setFeedbackList] = useState(feedbackData);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const views = ['Host', 'Participant'];

  useEffect(() => {
    setEvent(data);
  }, []);

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.activityContainer}`}>
        <div className={`${styles.activityEventCard}`}>
          <div className={`${styles.activityEventHeader}`}>
            <div className={`${styles.activityEventImage}`}>Participated</div>

            <div className={`${styles.activityEventDetails}`}>
              <div className={`${styles.titlesAndViews}`}>
                <div className={`${styles.titles}`}>
                  <p className={`${styles.activityEventType}`}>{event.eventType}</p>
                  <h2 className={`${styles.activityEventTitle}`}>{event.eventName}</h2>
                  <p className={`${styles.activityEventLocation}`}>{event.eventLocation}</p>
                  <a
                    href={event.eventLink}
                    className={`${styles.activityEventLink}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {event.eventLink}
                  </a>
                </div>

                <div className={`${styles.viewToggler}`}>
                  {views.map(sec => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setViewSelected(sec)}
                      className={`${styles.activityTab} ${
                        viewSelected === sec ? styles.active : ''
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${styles.activityEventInfo}`}>
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
                  <span className={`${styles.activityCapacity}`}>{event.eventCapacity}</span>
                </div>
                <div>
                  <strong>Overall Rating</strong>
                  <br />
                  {Array.from({ length: event.eventRating }, (_, i) => (
                    <span key={i} className={`${styles.activityStar}`}>
                      ★
                    </span>
                  ))}
                  {Array.from({ length: 5 - event.eventRating }, (_, i) => (
                    <span key={i} className={`${styles.activityStarEmpty}`}>
                      ☆
                    </span>
                  ))}
                </div>
                <div>
                  <strong>Status</strong>
                  <br />
                  <span className={`${styles.activityStatusActive}`}>{event.eventStatus}</span>
                </div>

                {viewSelected === 'Host' && (
                  <div>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={reviewsChecked}
                          onChange={e => setReviewsChecked(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography className={`${styles.switchToggle}`}>Allow Reviews</Typography>
                      }
                    />
                    <br />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={suggestionChecked}
                          onChange={e => setSuggestionChecked(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography className={`${styles.switchToggle}`}>
                          Suggestions Only
                        </Typography>
                      }
                    />
                  </div>
                )}
              </div>

              {viewSelected !== 'Host' && (
                <div className={`${styles.activityEventButtons}`}>
                  <button type="button" className={`${styles.contactBtn}`}>
                    Contact organizer
                  </button>
                </div>
              )}
            </div>

            <div className={`${styles.activityCalendarBox}`}>
              <div className={`${styles.activityCalendarHeader}`}>September 2024</div>
              <table className={`${styles.activityCalendarTable}`}>
                <thead>
                  <tr>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <th key={day}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4].map(row => (
                    <tr key={row}>
                      {Array.from({ length: 7 }).map((_, col) => {
                        const day = row * 7 + col + 1;
                        return (
                          <td key={col} className={day === 2 ? styles.activityActiveDate : ''}>
                            {day <= 31 ? day : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${styles.activityEventTabs}`}>
            {['Description', 'Participates', 'Comments', 'FAQs', 'Feedback'].map(name => (
              <button
                key={name}
                className={`${styles.activityTab} ${tab === name ? styles.activityTabActive : ''}`}
                onClick={() => setTab(name)}
                type="button"
              >
                {name}
              </button>
            ))}
          </div>

          {tab === 'Description' && (
            <div className={`${styles.activityEventDescription}`}>
              <p>{event.eventDescription}</p>
            </div>
          )}

          {tab === 'Participates' && (
            <div className={`${styles.activityParticipatesSection}`}>
              {event.eventParticipates.map((p, i) => (
                <div key={i} className={`${styles.activityParticipant}`}>
                  <span
                    className={`${styles.activityIcon} ${getAvatarColorClass(p.name, i, styles)}`}
                  >
                    {p.name[0]}
                  </span>
                  <div>{p.name}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'FAQs' && (
            <div className={`${styles.activityFaqsSection}`}>
              {event.eventFAQs.map(faq => (
                <div key={faq.id} className={`${styles.activityFaq}`}>
                  <h3 className={`${styles.activityFaqTitle}`}>{faq.question}</h3>
                  <p className={`${styles.activityFaqText}`}>{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'Comments' && (
            <CommentSection comments={event.eventComments} darkMode={darkMode} />
          )}

          {tab === 'Feedback' && viewSelected === 'Host' && (
            <Feedback
              reviewsEnabled={reviewsChecked}
              suggestionsOnly={suggestionChecked}
              isHost
              eventCreatedAt={event.createdAt}
              feedbackList={feedbackList}
              setFeedbackList={setFeedbackList}
            />
          )}

          {tab === 'Feedback' && viewSelected !== 'Host' && (
            <Feedback
              reviewsEnabled={reviewsChecked}
              suggestionsOnly={suggestionChecked}
              isHost={false}
              eventCreatedAt={event.createdAt}
              showModal={showFeedbackModal}
              setShowModal={setShowFeedbackModal}
              feedbackList={feedbackList}
              setFeedbackList={setFeedbackList}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityFeedback;
