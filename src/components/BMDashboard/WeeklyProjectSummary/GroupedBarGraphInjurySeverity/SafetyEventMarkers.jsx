import { useId, useRef, useState } from 'react';
import { validEventDate } from './safetyEventAnalysis';
import styles from './InjuryAnalysisDialog.module.css';

function SafetyEventMarkers({ events, onChange, projects, markers, shown, onToggle }) {
  const idPrefix = useId();
  const nextId = useRef(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Training');
  const [project, setProject] = useState('');
  const [error, setError] = useState('');
  const add = event => {
    event.preventDefault();
    if (!name.trim() || !validEventDate(date)) {
      setError('Enter an event name and valid date.');
      return;
    }
    onChange([
      ...events,
      { id: `${idPrefix}-${nextId.current++}`, name: name.trim(), date, type, project },
    ]);
    setName('');
    setError('');
  };
  return (
    <section className={styles.eventSection} aria-label="Safety events">
      <div className={styles.chartActions}>
        <button
          type="button"
          className={styles.toolButton}
          aria-expanded={open}
          aria-controls="safety-event-editor"
          onClick={() => setOpen(value => !value)}
        >
          Safety events{events.length > 0 ? ` (${events.length})` : ''}{' '}
          <span aria-hidden="true">{open ? '▴' : '+'}</span>
        </button>
        <small
          className={styles.statMeta}
          title="Events are cleared when this analysis panel closes."
        >
          Session only
        </small>
        {events.length > 0 && (
          <button
            type="button"
            className={styles.toolButton}
            aria-pressed={shown}
            onClick={onToggle}
          >
            {shown ? 'Hide markers' : 'Show markers'}
          </button>
        )}
      </div>
      {open && (
        <div id="safety-event-editor" className={styles.eventEditor}>
          <form onSubmit={add} aria-label="Add safety event">
            <div className={styles.eventFields}>
              <label>
                Event name
                <input
                  value={name}
                  maxLength={80}
                  onChange={event => setName(event.target.value)}
                  required
                />
              </label>
              <label>
                Event date
                <input
                  type="date"
                  className={styles.dateInput}
                  value={date}
                  onChange={event => setDate(event.target.value)}
                  required
                />
              </label>
              <label>
                Event type
                <select value={type} onChange={event => setType(event.target.value)}>
                  <option>Training</option>
                  <option>Policy change</option>
                  <option>Audit</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Event project
                <select value={project} onChange={event => setProject(event.target.value)}>
                  <option value="">All projects</option>
                  {projects.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && <p role="alert">{error}</p>}
            <button type="submit" className={styles.toolButton}>
              Add marker
            </button>
          </form>
          {events.length > 0 && (
            <ul className={styles.eventList}>
              {events.map(event => (
                <li key={event.id}>
                  <span>
                    <strong>{event.name}</strong> · {event.date} · {event.type}
                    {!markers.some(marker => marker.events.some(item => item.id === event.id)) && (
                      <small className={styles.changeLabel}>
                        Outside current dates or projects
                      </small>
                    )}
                  </span>
                  <button
                    type="button"
                    className={styles.detailsButton}
                    aria-label={`Remove ${event.name} on ${event.date}`}
                    onClick={() => onChange(events.filter(item => item.id !== event.id))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {shown && markers.length > 0 && (
        <ul className={styles.eventKey} aria-label="Timeline event key">
          {markers.map(marker => (
            <li key={marker.date}>
              <strong>{marker.label}</strong> {marker.date} ·{' '}
              {marker.events.map(event => event.name).join(' / ')}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SafetyEventMarkers;
