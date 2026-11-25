import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Participation.module.css';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export function TrendIndicator({ value, metricLabel, comparisonLabel = 'Last week' }) {
  const numericValue = typeof value === 'number' ? value : NaN;
  const available = Number.isFinite(numericValue);
  let direction = 'unchanged';
  let symbol = '—';
  let trendClass = styles.trendNeutral;

  if (available && numericValue > 0) {
    direction = 'increased';
    symbol = '▲';
    trendClass = styles.trendIncrease;
  } else if (available && numericValue < 0) {
    direction = 'decreased';
    symbol = '▼';
    trendClass = styles.trendDecrease;
  }

  const formattedValue = available ? `${numericValue > 0 ? '+' : ''}${numericValue}%` : 'N/A';
  let description = 'trend unavailable';
  if (available) {
    description = numericValue === 0
      ? 'unchanged'
      : `${direction} by ${Math.abs(numericValue)} percent`;
  }

  return (
    <p
      className={styles.trendRow}
      aria-label={`${metricLabel} ${description} compared with ${comparisonLabel}`}
    >
      <span className={`${styles.trendBadge} ${trendClass}`}>
        {available && <span aria-hidden="true">{symbol}</span>}
        <span>{formattedValue}</span>
      </span>
      <span className={styles.trendComparison}>{comparisonLabel}</span>
    </p>
  );
}
import mockEvents from './mockData';
import { filterEventsByDate } from './FilterByDate';

function DropOffTracking() {
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [selectedTime, setSelectedTime] = useState('All Time');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const darkMode = useSelector(state => state.theme.darkMode);

  const filteredEvents = filterEventsByDate(mockEvents, selectedTime);

  const filteredEventsByEventType = filteredEvents.filter(event => {
    if (selectedEvent === 'All Events') return true;
    return event.eventType === selectedEvent;
  });
  const sortedEvents = sortColumn
    ? filteredEventsByEventType.toSorted((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        if (sortColumn === 'eventName') {
          return direction * a.eventName.localeCompare(b.eventName);
        }
        return direction * (Number.parseFloat(a[sortColumn]) - Number.parseFloat(b[sortColumn]));
      })
    : filteredEventsByEventType;

  const handleOpenList = event => {
    setActiveEvent(event);
    setSelectedUsers([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveEvent(null);
    setSelectedUsers([]);
  };

  const handleSort = column => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortIndicator = column => {
    if (sortColumn !== column) return <ArrowUpDown size={14} />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div
      className={`tracking-container-global ${styles.trackingContainer} ${
        darkMode ? styles.trackingContainerDark : ''
      }`}
    >
      <div className={`${styles.trackingHeader} ${darkMode ? styles.trackingHeaderDark : ''}`}>
        <h3>Drop-off and no-show rate tracking</h3>
        <div className={styles.trackingFilters}>
          <select
            className={styles.filterDropdown}
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
          >
            <option value="All Events">All Events</option>
            <option value="Yoga Class">Yoga Class</option>
            <option value="Cooking Workshop">Cooking Workshop</option>
            <option value="Dance Class">Dance Class</option>
            <option value="Fitness Bootcamp">Fitness Bootcamp</option>
          </select>
          <select
            className={styles.filterDropdown}
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
          >
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      <div className={styles.trackingSummary}>
        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <TrendIndicator value={5} metricLabel="Drop-off rate" />
          <p className={styles.trackingRateSubheading}>
            <span>
              <b>Drop-off rate</b>
            </span>
          </p>
        </div>
        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <TrendIndicator value={-5} metricLabel="No-show rate" />
          <p className={styles.trackingRateSubheading}>
            <span>
              <b>No-show rate</b>
            </span>
          </p>
        </div>
      </div>

      <div
        className={`${styles.trackingListContainer} ${
          darkMode ? styles.trackingListContainerDark : ''
        }`}
      >
        <table
          className={`tracking-table-global ${styles.trackingTable} ${
            darkMode ? `tracking-table-global-dark ${styles.trackingTableDark}` : ''
          }`}
        >
          <thead>
            <tr>
              <th onClick={() => handleSort('eventName')} className={styles.sortableHeader}>
                <span className={styles.sortableHeaderContent}>
                  Event name {sortIndicator('eventName')}
                </span>
              </th>
              <th onClick={() => handleSort('noShowRate')} className={styles.sortableHeader}>
                <span className={styles.sortableHeaderContent}>
                  No-show rate {sortIndicator('noShowRate')}
                </span>
              </th>
              <th onClick={() => handleSort('dropOffRate')} className={styles.sortableHeader}>
                <span className={styles.sortableHeaderContent}>
                  Drop-off rate {sortIndicator('dropOffRate')}
                </span>
              </th>
              <th>Get list</th>
            </tr>
          </thead>

          <tbody>
            {sortedEvents.map(event => (
              <tr key={event.id}>
                <td>{event.eventName}</td>
                <td className={styles.trackingRateGreen}>{event.noShowRate}</td>
                <td className={styles.trackingRateRed}>{event.dropOffRate}</td>
                <td>
                  <button
                    type="button"
                    className={styles.getListBtn}
                    aria-label="Get no-show list"
                    onClick={() => handleOpenList(event)}
                  >
                    👥
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && activeEvent && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${darkMode ? styles.modalContentDark : ''}`}>
            <div className={styles.modalHeader}>
              <h4>No-show list</h4>
              <button type="button" className={styles.closeBtn} onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className={styles.modalSubHeader}>
              {activeEvent.eventName} | {activeEvent.eventTime}
            </div>

            <div className={styles.modalList}>
              <label className={styles.selectAll}>
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length > 0 &&
                    selectedUsers.length === mockEvents.slice(0, 8).length
                  }
                  onChange={e =>
                    setSelectedUsers(e.target.checked ? mockEvents.slice(0, 8).map(u => u.id) : [])
                  }
                />
                Select all
              </label>

              {mockEvents.slice(0, 8).map(user => (
                <label key={user.id} className={styles.userRow}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() =>
                      setSelectedUsers(prev =>
                        prev.includes(user.id)
                          ? prev.filter(id => id !== user.id)
                          : [...prev, user.id],
                      )
                    }
                  />
                  <span className={styles.userAvatar}>👤</span>
                  <span className={styles.userName}>No-show person {user.id}</span>
                  <span className={styles.userEmail}>user{user.id}@example.com</span>
                </label>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.sendEmailBtn}
                disabled={selectedUsers.length === 0}
                onClick={() => {
                  handleCloseModal();
                }}
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropOffTracking;
