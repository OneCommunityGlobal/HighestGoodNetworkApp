import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import './EventManagementTabs.css';

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
  const [activeSection, setActiveSection] = useState(section || 'comments');

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

  const engagementSections = ['comments', 'feedback'];

  const handleTabClick = newTab => {
    setActiveTab(newTab);
    const newPath =
      newTab === 'engagement'
        ? `../communityportal/activity/${activityid}/engagement/comments`
        : `../communityportal/activity/${activityid}/${newTab}`;
    history.push(newPath);
  };

  const handleEngagementSectionClick = newSection => {
    setActiveSection(newSection);
    history.push(`/communityportal/activity/${activityid}/engagement/${newSection}`);
  };

  const renderContent = () => {
    if (!event) return <div className="content-box">Event details below</div>;

    if (activeTab === 'engagement') {
      return (
        <div>
          <div className="engagement-sections">
            {engagementSections.map(sec => (
              <button
                type="button"
                key={sec}
                onClick={() => handleEngagementSectionClick(sec)}
                className={`section-btn ${activeSection === sec ? 'active' : ''}`}
              >
                {sec.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="content-box">
            {activeSection === 'feedback' ? (
              <div>Feedback·section</div>
            ) : (
              <div>Comments·Section</div>
            )}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'analysis':
        return <div className="content-box">Analysis for {event.name}</div>;
      case 'resources':
        return <div className="content-box">Resources for {event.name}</div>;
      case 'description':
      default:
        return (
          <div className="content-box">
            <p>This is a detailed description of the event.</p>
          </div>
        );
    }
  };

  return (
    <div className="event-tabs">
      <div className="tab-buttons">
        {tabs.map(({ key, label }) => (
          <button
            type="button"
            key={key}
            onClick={() => handleTabClick(key)}
            className={`tab-btn ${activeTab === key ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="main-content">{renderContent()}</div>
    </div>
  );
}

export default EventManagementTabs;
