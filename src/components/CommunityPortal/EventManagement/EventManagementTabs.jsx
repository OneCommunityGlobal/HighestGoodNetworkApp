import { useState } from 'react';
import styles from './EventManagementTabs.module.css';

function EventManagementTabs({ darkMode }) {
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
        return <div className={styles.contentBox}>Analysis content</div>;
      case 'resources':
        return <div className={styles.contentBox}>Resources content</div>;
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
