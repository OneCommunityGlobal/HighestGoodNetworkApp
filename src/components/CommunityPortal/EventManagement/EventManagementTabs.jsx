import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './EventManagementTabs.module.css';

const dummyEvents = [
  { id: '1', name: 'Tech Conference 2025', date: '2025-05-15', location: 'San Francisco' },
  { id: '2', name: 'AI Summit', date: '2025-06-20', location: 'New York' },
  { id: '3', name: 'Developer Meetup', date: '2025-07-10', location: 'Chicago' },
];

function EventManagementTabs({ darkMode }) {
  const { activityid } = useParams();
  const [event] = useState(() => dummyEvents.find(e => e.id === activityid) ?? null);
  const [activeTab, setActiveTab] = useState('description');
  const [activeSection, setActiveSection] = useState('comments');

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'resources', label: 'Resources' },
    { key: 'engagement', label: 'Engagement' },
  ];

  const engagementSections = ['comments', 'feedback'];

  const handleTabClick = newTab => {
    setActiveTab(newTab);
  };

  const handleEngagementSectionClick = newSection => {
    setActiveSection(newSection);
  };

  const renderContent = () => {
    if (!event) return <div className={styles.contentBox}>Event details below</div>;

    if (activeTab === 'engagement') {
      return (
        <div>
          <div className={styles.engagementSections}>
            {engagementSections.map(sec => (
              <button
                type="button"
                key={sec}
                onClick={() => handleEngagementSectionClick(sec)}
                className={`${styles.sectionBtn} ${activeSection === sec ? styles.active : ''}`}
              >
                {sec.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={styles.contentBox}>
            {activeSection === 'feedback' ? (
              <div>Feedback section</div>
            ) : (
              <div>Comments Section</div>
            )}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'analysis':
        return <div className={styles.contentBox}>Analysis for {event.name}</div>;
      case 'resources':
        return <div className={styles.contentBox}>Resources for {event.name}</div>;
      case 'description':
      default:
        return (
          <div className={styles.contentBox}>
            <p>This is a detailed description of the event.</p>
          </div>
        );
    }
  };

  return (
    <div className={`${styles.eventTabs} ${darkMode ? styles.eventTabsDark : ''}`}>
      <div className={styles.tabButtons}>
        {tabs.map(({ key, label }) => (
          <button
            type="button"
            key={key}
            onClick={() => handleTabClick(key)}
            className={`${styles.tabBtn} ${activeTab === key ? styles.active : ''} ${
              darkMode ? styles.tabBtnDark : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.mainContent}>{renderContent()}</div>
    </div>
  );
}

export default EventManagementTabs;
