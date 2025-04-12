import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useParams, useHistory } from 'react-router-dom';
import './EventManagementTabs.css';
import CommentsComponent from './Engagement/Comments';
import FeedbackComponent from './Engagement/Feedback';

const dummyEvents = [
  { id: '1', name: 'Tech Conference 2025', date: '2025-05-15', location: 'San Francisco' },
  { id: '2', name: 'AI Summit', date: '2025-06-20', location: 'New York' },
  { id: '3', name: 'Developer Meetup', date: '2025-07-10', location: 'Chicago' },
];

function EventManagementTabs() {
  const { activityid, tab, section } = useParams();
  const history = useHistory();
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(tab || 'description');
  const [activeSection, setActiveSection] = useState(section || 'Comments');

  useEffect(() => {
    const foundEvent = dummyEvents.find(e => e.id === activityid);
    setEvent(foundEvent);
  }, [activityid]);

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'resources', label: 'Resources' },
    { key: 'engagement', label: 'Engagement' },
  ];

  const engagementSections = ['Comments', 'Feedback'];

  const handleTabClick = newTab => {
    setActiveTab(newTab);
    const newPath =
      newTab === 'engagement'
        ? `/communityportal/activity/${activityid}/engagement/comments`
        : `/communityportal/activity/${activityid}/${newTab}`;
    history.push(newPath);
  };

  const handleEngagementSectionClick = newSection => {
    setActiveSection(newSection);
    history.push(`/communityportal/activity/${activityid}/engagement/${newSection}`);
  };

  const darkMode = useSelector((state) => state.theme.darkMode);

  const renderContent = () => {
    if (!event) return <div className="content-box">Event not found</div>;

    if (activeTab === 'engagement') {
      return (
        <div>
          <div className={`engagement-sections ${darkMode ? "engagement-sections-dark" : ""}`}>
            {engagementSections.map(sec => (
              <button
                type="button"
                key={sec}
                onClick={() => handleEngagementSectionClick(sec)}
                className={`section-btn 
                  ${activeSection === sec ? 'section-btn-active' : ''} 
                  ${darkMode ? 'section-btn-dark' : ''} 
                  ${darkMode && activeSection === sec ? 'section-btn-dark-active' : ''}`}
              >
                {sec}
              </button>
            ))}
          </div>
          <div className={`content-box ${darkMode ? "content-box-dark" : ""}`}>
            {activeSection === 'Feedback' ? (
              <div>
                <FeedbackComponent />
              </div>
            ) : (
              <div>
                <CommentsComponent />
              </div>
            )}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'analysis':
        return <div className={`content-box ${darkMode ? "content-box-dark" : ""}`}>Analysis for {event.name}</div>;
      case 'resources':
        return <div className={`content-box ${darkMode ? "content-box-dark" : ""}`}>Resources for {event.name}</div>;
      case 'description':
      default:
        return (
          <div className={`content-box ${darkMode ? "content-box-dark" : ""}`}>
            This is a detailed description of the event.
          </div>
        );
    }
  };

  return (
    <div className={`event-tabs ${darkMode ? "event-tabs-dark" : ""}`}>
      <div className={`tab-buttons ${darkMode ? "tab-buttons-dark" : ""}`}>
        {tabs.map(({ key, label }) => (
          <button
            type="button"
            key={key}
            onClick={() => handleTabClick(key)}
            // className={`tab-btn ${activeTab === key ? 'active' : ''}`}
            // className={`tab-btn ${activeTab === key ? 'active' : ''} ${darkMode ? 'tab-btn-dark' : ''}`}
            className={`tab-btn 
              ${activeTab === key ? 'active' : ''} 
              ${darkMode ? 'tab-btn-dark' : ''} 
              ${darkMode && activeTab === key ? 'active-dark' : ''}`}
            
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`main-content ${darkMode ? "main-content-dark" : ""}`}>{renderContent()}</div>
    </div>
  );
}

export default EventManagementTabs;
