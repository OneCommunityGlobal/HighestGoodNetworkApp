import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClock } from '@fortawesome/free-solid-svg-icons';
import styles from './AnimalManagement.module.css';

const CullingCalendarTab = ({ events, setEvents }) => {
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    animalName: '',
    count: '',
    notes: '',
    scheduledDate: '',
  });

  const handleScheduleCulling = e => {
    e.preventDefault();
    const eventData = {
      id: `CULL-${Date.now()}`,
      animalName: newEvent.animalName,
      count: parseInt(newEvent.count, 10),
      notes: newEvent.notes,
      scheduledDate: newEvent.scheduledDate,
      status: 'scheduled',
    };

    const updatedEvents = [...events, eventData].sort(
      (a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate),
    );
    setEvents(updatedEvents);
    setShowModal(false);
    setNewEvent({ animalName: '', count: '', notes: '', scheduledDate: '' });
  };

  return (
    <div className={styles['tab-content']}>
      <div className={styles['tab-header']}>
        <div className={styles['tab-title-group']}>
          <h3>Culling Calendar</h3>
          <p>Scheduled culling and processing dates</p>
        </div>
      </div>

      <div className={styles['list-container']}>
        {events.length === 0 ? (
          <div className={styles['empty-state']}>No culling events scheduled.</div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className={styles['list-item']}>
              <div className={styles['item-main']}>
                <span className={styles['item-title']}>
                  {ev.animalName} ({ev.count})
                </span>
                <p className={styles['item-details']} style={{ marginTop: '8px' }}>
                  <FontAwesomeIcon icon={faClock} style={{ marginRight: '6px', color: '#888' }} />
                  Scheduled: {ev.scheduledDate}
                </p>
                <p className={styles['item-details']}>Notes: {ev.notes}</p>
              </div>
              <div className={styles['item-status']}>
                <span className={`${styles['status-badge']} ${styles[`status-${ev.status}`]}`}>
                  {ev.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button
          className={styles['btn-secondary']}
          style={{
            width: '100%',
            padding: '12px',
            justifyContent: 'center',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
          onClick={() => setShowModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} /> Schedule Culling
        </button>
      </div>

      {showModal && (
        <div
          className={styles['modal-overlay']}
          onClick={() => setShowModal(false)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Escape') setShowModal(false);
          }}
        >
          <div
            className={styles['modal-content']}
            onClick={e => e.stopPropagation()}
            role="presentation"
          >
            <div className={styles['modal-header']}>
              <h2>Schedule Culling Event</h2>
              <button className={styles['modal-close']} onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleScheduleCulling}>
              <div className={styles['form-group']}>
                <label htmlFor="animalName">Animal Name (e.g., Rabbits, Chickens)</label>
                <input
                  id="animalName"
                  required
                  type="text"
                  value={newEvent.animalName}
                  onChange={e => setNewEvent({ ...newEvent, animalName: e.target.value })}
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="count">Count</label>
                <input
                  id="count"
                  required
                  type="number"
                  min="1"
                  value={newEvent.count}
                  onChange={e => setNewEvent({ ...newEvent, count: e.target.value })}
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="scheduledDate">Scheduled Date</label>
                <input
                  id="scheduledDate"
                  required
                  type="date"
                  value={newEvent.scheduledDate}
                  onChange={e => setNewEvent({ ...newEvent, scheduledDate: e.target.value })}
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="notes">Notes / Reason</label>
                <textarea
                  id="notes"
                  rows="3"
                  value={newEvent.notes}
                  onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })}
                  placeholder="e.g. Reached optimal size..."
                ></textarea>
              </div>
              <div className={styles['modal-actions']}>
                <button
                  type="button"
                  className={styles['btn-secondary']}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles['btn-primary']}>
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CullingCalendarTab;
