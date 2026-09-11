import { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './GardenManagement.module.css';
import { dashboardStats, sectionTabs, calendarSections } from './gardenManagementData';

const formatDateDisplay = dateStr => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

function ModalField({ id, label, dm, children }) {
  return (
    <>
      <label htmlFor={id} className={`${styles.modalLabel} ${dm}`}>
        {label}
      </label>
      {children}
    </>
  );
}

ModalField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  dm: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function AddEventModal({ sectionTitle, newEvent, setNewEvent, darkMode, onClose, onAdd }) {
  const [yieldError, setYieldError] = useState('');
  const dm = darkMode ? styles.dark : '';
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
    if (newEvent.yieldKg !== '' && Number(newEvent.yieldKg) < 0) {
      setYieldError('Est. Yield must be 0 or greater.');
      return;
    }
    setYieldError('');
    onAdd();
  };

  const dateInputClass = `${styles.modalInput} ${dm} ${darkMode ? styles.modalInputDark : ''}`;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalBox} ${dm}`}>
        <h3 className={`${styles.modalTitle} ${dm}`}>{sectionTitle}</h3>

        <ModalField id="gm-crop" label="Crop *" dm={dm}>
          <input
            id="gm-crop"
            className={`${styles.modalInput} ${dm}`}
            value={newEvent.crop}
            onChange={e => setNewEvent({ ...newEvent, crop: e.target.value })}
            placeholder="e.g. Tomatoes"
          />
        </ModalField>

        <ModalField id="gm-fromDate" label="Start Date *" dm={dm}>
          <input
            id="gm-fromDate"
            type="date"
            className={dateInputClass}
            value={newEvent.fromDate}
            min={today}
            onChange={e => {
              const newFrom = e.target.value;
              setNewEvent(prev => ({
                ...prev,
                fromDate: newFrom,
                toDate: prev.toDate && prev.toDate < newFrom ? '' : prev.toDate,
              }));
            }}
          />
        </ModalField>

        <ModalField id="gm-toDate" label="End Date *" dm={dm}>
          <input
            id="gm-toDate"
            type="date"
            className={dateInputClass}
            value={newEvent.toDate}
            min={newEvent.fromDate || today}
            onChange={e => setNewEvent({ ...newEvent, toDate: e.target.value })}
          />
        </ModalField>

        <ModalField id="gm-location" label="Location *" dm={dm}>
          <input
            id="gm-location"
            className={`${styles.modalInput} ${dm}`}
            value={newEvent.location}
            onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
            placeholder="e.g. Greenhouse A"
          />
        </ModalField>

        <ModalField id="gm-yield" label="Est. Yield (kg)" dm={dm}>
          <input
            id="gm-yield"
            type="number"
            min="0"
            step="0.1"
            className={`${styles.modalInput} ${dm}`}
            value={newEvent.yieldKg}
            onKeyDown={e => {
              if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
            }}
            onChange={e => {
              if (e.target.value === '' || Number(e.target.value) >= 0) {
                setNewEvent({ ...newEvent, yieldKg: e.target.value });
              }
            }}
            placeholder="e.g. 40"
          />
        </ModalField>
        {yieldError && <p className={styles.fieldError}>{yieldError}</p>}

        <ModalField id="gm-status" label="Status" dm={dm}>
          <select
            id="gm-status"
            className={`${styles.modalInput} ${dm}`}
            value={newEvent.status}
            onChange={e => setNewEvent({ ...newEvent, status: e.target.value })}
          >
            <option value="upcoming">Upcoming</option>
            <option value="growing">Growing</option>
          </select>
        </ModalField>

        <div className={styles.modalBtns}>
          <button type="button" className={`${styles.modalCancelBtn} ${dm}`} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.modalAddBtn} onClick={handleAdd}>
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
        <header className={styles.pageHeader}>
          <h1 className={`${styles.pageTitle} ${darkMode ? styles.dark : ''}`}>
            🌿 Garden Management
          </h1>
          <p className={`${styles.pageSubtitle} ${darkMode ? styles.dark : ''}`}>
            Track seed varieties, plantings, harvests, and garden schedules.
          </p>
        </header>

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

        {activeSection !== 'Calendars' && (
          <div className={`${styles.placeholderSection} ${darkMode ? styles.dark : ''}`}>
            <p>{activeSection} section coming soon.</p>
          </div>
        )}
      </div>

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
