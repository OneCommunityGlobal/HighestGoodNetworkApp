import { useEffect, useState } from 'react';
import CommentSection from './CommentSection/CommentSection';
import './Activity.module.css';

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

function Activity() {
  const [tab, setTab] = useState('Description');
  const [event, setEvent] = useState(data);

  const handleTabClick = tabName => {
    setTab(tabName);
  };

  useEffect(() => {
    setEvent(data);
  }, [data]);

  return (
    <div className="activity-container">
      <div className="activity-event-card">
        <div className="activity-event-header">
          <div className="activity-event-image">Participated</div>
          <div className="activity-event-details">
            <p className="activity-event-type">{event.eventType}</p>
            <h2 className="activity-event-title">{event.eventName}</h2>
            <p className="activity-event-location">{event.eventLocation}</p>
            <a href="https://devforum.zoom.us" className="activity-event-link">
              {event.eventLink}
            </a>
            <div className="activity-event-info">
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
                <span className="activity-capacity">{event.eventCapacity}</span>
              </div>
              <div>
                <strong>Overall Rating</strong>
                <br />
                {Array.from({ length: event.eventRating }, (_, i) => (
                  <span key={i} className="activity-star">
                    ★
                  </span>
                ))}
                {Array.from({ length: 5 - event.eventRating }, (_, i) => (
                  <span key={i} className="activity-star-empty">
                    ☆
                  </span>
                ))}
              </div>
              <div>
                <strong>Status</strong>
                <br />
                <span className="activity-status-active">{event.eventStatus}</span>
              </div>
            </div>
            <div className="activity-event-buttons">
              <button type="button" className="activity-feedback-btn">
                Feedback
              </button>
              <button type="button" className="activity-contact-btn">
                Contact organizer
              </button>
            </div>
          </div>
          <div className="activity-calendar-box">
            <div className="activity-calendar-header">September 2024</div>
            <table className="activity-calendar-table">
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
                <tr>
                  <td>1</td>
                  <td className="activity-active-date">2</td>
                  <td>3</td>
                  <td>4</td>
                  <td>5</td>
                  <td>6</td>
                  <td>7</td>
                </tr>
                <tr>
                  <td>8</td>
                  <td>9</td>
                  <td>10</td>
                  <td>11</td>
                  <td>12</td>
                  <td>13</td>
                  <td>14</td>
                </tr>
                <tr>
                  <td>15</td>
                  <td>16</td>
                  <td>17</td>
                  <td>18</td>
                  <td>19</td>
                  <td>20</td>
                  <td>21</td>
                </tr>
                <tr>
                  <td>22</td>
                  <td>23</td>
                  <td>24</td>
                  <td>25</td>
                  <td>26</td>
                  <td>27</td>
                  <td>28</td>
                </tr>
                <tr>
                  <td>29</td>
                  <td>30</td>
                  <td> </td>
                  <td> </td>
                  <td> </td>
                  <td> </td>
                  <td> </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="activity-event-tabs">
          <button
            className={`activity-tab ${tab === 'Description' ? 'active' : ''}`}
            onClick={() => handleTabClick('Description')}
            type="button"
          >
            Description
          </button>
          <button
            className={`activity-tab ${tab === 'Participates' ? 'active' : ''}`}
            onClick={() => handleTabClick('Participates')}
            type="button"
          >
            Participates
          </button>
          <button
            className={`activity-tab ${tab === 'Comments' ? 'active' : ''}`}
            onClick={() => handleTabClick('Comments')}
            type="button"
          >
            Comments
          </button>
          <button
            className={`activity-tab ${tab === 'FAQs' ? 'active' : ''}`}
            onClick={() => handleTabClick('FAQs')}
            type="button"
          >
            FAQs
          </button>
        </div>
        {tab === 'Description' && (
          <div className="activity-event-description">
            <p>{event.eventDescription}</p>
          </div>
        )}
        {tab === 'Participates' && (
          <div className="activity-participates-section">
            {event.eventParticipates.map(participant => (
              <div key={participant.id} className="activity-participant">
                <span className={`activity-icon ${Math.random() > 0.5 ? 'purple' : 'blue'}`}>
                  {participant.name[0]}
                </span>
                <div className="activity-participant-name">{participant.name}</div>
              </div>
            ))}
          </div>
        )}
        {tab === 'FAQs' && (
          <div className="activity-faqs-section">
            {event.eventFAQs.map(faq => (
              <div key={faq.id} className="activity-faq">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'Comments' && <CommentSection comments={event.eventComments} />}
      </div>
    </div>
  );
}

export default Activity;
