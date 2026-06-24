import { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './GardenManagement.module.css';

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

// --- Add Event Modal ---

const formatDateDisplay = dateStr => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

function AddEventModal({ sectionTitle, newEvent, setNewEvent, darkMode, onClose, onAdd }) {
  const dm = darkMode ? styles.dark : '';
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalBox} ${dm}`}>
        <h3 className={`${styles.modalTitle} ${dm}`}>{sectionTitle}</h3>

        <label htmlFor="gm-crop" className={`${styles.modalLabel} ${dm}`}>
          Crop *
        </label>
        <input
          id="gm-crop"
          className={`${styles.modalInput} ${dm}`}
          value={newEvent.crop}
          onChange={e => setNewEvent({ ...newEvent, crop: e.target.value })}
          placeholder="e.g. Tomatoes"
        />

        <label htmlFor="gm-fromDate" className={`${styles.modalLabel} ${dm}`}>
          Start Date *
        </label>
        <input
          id="gm-fromDate"
          type="date"
          className={`${styles.modalInput} ${dm}`}
          value={newEvent.fromDate}
          onChange={e => setNewEvent({ ...newEvent, fromDate: e.target.value })}
          style={darkMode ? { colorScheme: 'dark' } : {}}
        />

        <label htmlFor="gm-toDate" className={`${styles.modalLabel} ${dm}`}>
          End Date *
        </label>
        <input
          id="gm-toDate"
          type="date"
          className={`${styles.modalInput} ${dm}`}
          value={newEvent.toDate}
          min={newEvent.fromDate || undefined}
          onChange={e => setNewEvent({ ...newEvent, toDate: e.target.value })}
          style={darkMode ? { colorScheme: 'dark' } : {}}
        />

        <label htmlFor="gm-location" className={`${styles.modalLabel} ${dm}`}>
          Location *
        </label>
        <input
          id="gm-location"
          className={`${styles.modalInput} ${dm}`}
          value={newEvent.location}
          onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
          placeholder="e.g. Greenhouse A"
        />

        <label htmlFor="gm-yield" className={`${styles.modalLabel} ${dm}`}>
          Est. Yield (kg)
        </label>
        <input
          id="gm-yield"
          type="number"
          min="0"
          step="0.1"
          className={`${styles.modalInput} ${dm}`}
          value={newEvent.yieldKg}
          onChange={e => {
            if (e.target.value === '' || Number(e.target.value) >= 0) {
              setNewEvent({ ...newEvent, yieldKg: e.target.value });
            }
          }}
          placeholder="e.g. 40"
        />

        <label htmlFor="gm-status" className={`${styles.modalLabel} ${dm}`}>
          Status
        </label>
        <select
          id="gm-status"
          className={`${styles.modalInput} ${dm}`}
          value={newEvent.status}
          onChange={e => setNewEvent({ ...newEvent, status: e.target.value })}
        >
          <option value="upcoming">Upcoming</option>
          <option value="growing">Growing</option>
        </select>

        <div className={styles.modalBtns}>
          <button type="button" className={`${styles.modalCancelBtn} ${dm}`} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.modalAddBtn} onClick={onAdd}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

AddEventModal.propTypes = {
  sectionTitle: PropTypes.string,
  newEvent: PropTypes.shape({
    crop: PropTypes.string,
    fromDate: PropTypes.string,
    toDate: PropTypes.string,
    location: PropTypes.string,
    yieldKg: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  setNewEvent: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

// --- Main Component ---

const emptyEvent = {
  crop: '',
  fromDate: '',
  toDate: '',
  location: '',
  yieldKg: '',
  status: 'upcoming',
};

function GardenManagement() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [activeSection, setActiveSection] = useState('Calendars');
  const [sections, setSections] = useState(calendarSections);
  const [addModal, setAddModal] = useState(null);
  const [newEvent, setNewEvent] = useState(emptyEvent);

  const openModal = sectionId => {
    setAddModal(sectionId);
    setNewEvent(emptyEvent);
  };

  const closeModal = () => setAddModal(null);

  const handleAddEvent = () => {
    if (!newEvent.crop || !newEvent.fromDate || !newEvent.toDate || !newEvent.location) return;
    const from = formatDateDisplay(newEvent.fromDate);
    const to = formatDateDisplay(newEvent.toDate);
    const yieldDisplay = newEvent.yieldKg ? `Est. ${newEvent.yieldKg} kg` : '';
    setSections(prev =>
      prev.map(s => {
        if (s.id !== addModal) return s;
        return {
          ...s,
          events: [
            ...s.events,
            {
              id: Date.now(),
              crop: newEvent.crop,
              dateRange: `${from} – ${to}`,
              location: newEvent.location,
              yield: yieldDisplay,
              status: newEvent.status,
            },
          ],
        };
      }),
    );
    closeModal();
  };

  return (
    <div className={`${styles.pageWrapper} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.container}>
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
          {dashboardStats.map(stat => {
            const colorClass = styles[`card_${stat.color}`];
            return (
              <div
                key={stat.id}
                className={`${styles.dashboardCard} ${colorClass} ${darkMode ? styles.dark : ''}`}
              >
                <div className={styles.cardIcon}>{stat.icon}</div>
                <div className={styles.cardContent}>
                  <span className={styles.cardValue}>{stat.value}</span>
                  <span className={styles.cardLabel}>{stat.label}</span>
                </div>
              </div>
            );
          })}
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
              {sections.map(section => (
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
                      onClick={() => openModal(section.id)}
                    >
                      + {section.addLabel}
                    </button>
                  </div>

                  <div className={styles.eventList}>
                    {section.events.map(event => {
                      const statusClass = styles[`status_${event.status}`];
                      return (
                        <div
                          key={event.id}
                          className={`${styles.eventCard} ${darkMode ? styles.dark : ''}`}
                        >
                          <div className={styles.eventTop}>
                            <span className={styles.eventCrop}>{event.crop}</span>
                            <span
                              className={`${styles.statusTag} ${statusClass} ${
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
                      );
                    })}
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

      {/* Add Event Modal */}
      {addModal && (
        <AddEventModal
          sectionTitle={sections.find(s => s.id === addModal)?.addLabel}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          darkMode={darkMode}
          onClose={closeModal}
          onAdd={handleAddEvent}
        />
      )}
    </div>
  );
}

export default GardenManagement;
