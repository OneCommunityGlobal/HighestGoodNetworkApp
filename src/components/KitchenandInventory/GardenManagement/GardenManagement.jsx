import React, { useState, useEffect } from 'react';
import styles from './GardenManagement.module.css';

function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const check = () => {
      setDarkMode(
        document.body.classList.contains('dark-mode') ||
          document.body.getAttribute('data-theme') === 'dark' ||
          document.documentElement.classList.contains('dark-mode') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches,
      );
    };

    check();

    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', check);

    return () => {
      obs.disconnect();
      mq.removeEventListener('change', check);
    };
  }, []);

  return darkMode;
}

// --- Mock Data ---

const dashboardStats = [
  { id: 1, label: 'Seed Varieties', value: 34, icon: '🌱', color: 'green' },
  { id: 2, label: 'Active Plantings', value: 18, icon: '🪴', color: 'amber' },
  { id: 3, label: 'Upcoming Harvests', value: 7, icon: '🌾', color: 'brown' },
  { id: 4, label: 'Seed Orders', value: 3, icon: '📦', color: 'red' },
];

const sectionTabs = ['Calendars', 'Seed Inventory', 'Seed Orders', 'Online Tools'];

const calendarSections = [
  {
    id: 'seeding',
    title: 'Seeding',
    addLabel: 'Add Seeding',
    events: [
      {
        id: 1,
        crop: 'Tomatoes',
        dateRange: 'Jun 1 – Jun 15',
        location: 'Greenhouse A',
        yield: 'Est. 40 kg',
        status: 'upcoming',
      },
      {
        id: 2,
        crop: 'Basil',
        dateRange: 'Jun 5 – Jun 20',
        location: 'Greenhouse B',
        yield: 'Est. 12 kg',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'transplanting',
    title: 'Transplanting',
    addLabel: 'Schedule Transplanting',
    events: [
      {
        id: 1,
        crop: 'Peppers',
        dateRange: 'Jun 10 – Jun 12',
        location: 'Field 2',
        yield: 'Est. 28 kg',
        status: 'growing',
      },
      {
        id: 2,
        crop: 'Zucchini',
        dateRange: 'Jun 14 – Jun 16',
        location: 'Field 3',
        yield: 'Est. 35 kg',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'succession',
    title: 'Succession',
    addLabel: 'Add Succession Plan',
    events: [
      {
        id: 1,
        crop: 'Lettuce',
        dateRange: 'Jun 7 – Jun 28',
        location: 'Raised Beds',
        yield: 'Est. 20 kg',
        status: 'growing',
      },
      {
        id: 2,
        crop: 'Spinach',
        dateRange: 'Jun 14 – Jul 5',
        location: 'Row B',
        yield: 'Est. 15 kg',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'harvesting',
    title: 'Harvesting',
    addLabel: 'Add Harvest',
    events: [
      {
        id: 1,
        crop: 'Strawberries',
        dateRange: 'Jun 3 – Jun 17',
        location: 'Patch A',
        yield: 'Est. 22 kg',
        status: 'growing',
      },
      {
        id: 2,
        crop: 'Peas',
        dateRange: 'Jun 18 – Jun 25',
        location: 'Field 1',
        yield: 'Est. 18 kg',
        status: 'upcoming',
      },
      {
        id: 3,
        crop: 'Radishes',
        dateRange: 'Jun 22 – Jun 28',
        location: 'Row C',
        yield: 'Est. 9 kg',
        status: 'upcoming',
      },
    ],
  },
];

// --- Main Component ---

function GardenManagement() {
  const darkMode = useDarkMode();
  const [activeSection, setActiveSection] = useState('Calendars');

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <h1 className={`${styles.pageTitle} ${darkMode ? styles.dark : ''}`}>
          🌿 Garden Management
        </h1>
        <p className={`${styles.pageSubtitle} ${darkMode ? styles.dark : ''}`}>
          Track seed varieties, plantings, harvests, and garden schedules.
        </p>
      </header>

      {/* Dashboard Cards */}
      <section className={styles.dashboardGrid} aria-label="Dashboard summary">
        {dashboardStats.map(stat => (
          <div
            key={stat.id}
            className={`${styles.dashboardCard} ${styles[`card_${stat.color}`]} ${
              darkMode ? styles.dark : ''
            }`}
          >
            <div className={styles.cardIcon}>{stat.icon}</div>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>{stat.value}</span>
              <span className={styles.cardLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Section Navbar */}
      <nav
        className={`${styles.sectionNavbar} ${darkMode ? styles.dark : ''}`}
        aria-label="Section navigation"
      >
        {sectionTabs.map(tab => (
          <button
            key={tab}
            type="button"
            className={`${styles.sectionTab} ${activeSection === tab ? styles.activeTab : ''} ${
              darkMode ? styles.dark : ''
            }`}
            onClick={() => setActiveSection(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Calendars Section */}
      {activeSection === 'Calendars' && (
        <section aria-label="Garden Calendars">
          <div className={styles.calendarsGrid}>
            {calendarSections.map(section => (
              <div
                key={section.id}
                className={`${styles.calendarSection} ${darkMode ? styles.dark : ''}`}
              >
                <div className={styles.calendarHeader}>
                  <h3 className={`${styles.calendarTitle} ${darkMode ? styles.dark : ''}`}>
                    {section.title}
                  </h3>
                  <button
                    type="button"
                    className={`${styles.addBtn} ${darkMode ? styles.dark : ''}`}
                  >
                    + {section.addLabel}
                  </button>
                </div>

                <div className={styles.eventList}>
                  {section.events.map(event => (
                    <div
                      key={event.id}
                      className={`${styles.eventCard} ${darkMode ? styles.dark : ''}`}
                    >
                      <div className={styles.eventTop}>
                        <span className={styles.eventCrop}>{event.crop}</span>
                        <span
                          className={`${styles.statusTag} ${styles[`status_${event.status}`]} ${
                            darkMode ? styles.dark : ''
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <div className={styles.eventMeta}>
                        <span>📅 {event.dateRange}</span>
                        <span>📍 {event.location}</span>
                        <span>⚖️ {event.yield}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Placeholder for other sections */}
      {activeSection !== 'Calendars' && (
        <div className={`${styles.placeholderSection} ${darkMode ? styles.dark : ''}`}>
          <p>{activeSection} section coming soon.</p>
        </div>
      )}
    </div>
  );
}

export default GardenManagement;
