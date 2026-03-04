import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './Participation.module.css';
import mockEvents from './mockData';

function DropOffTracking() {
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [selectedTime, setSelectedTime] = useState('All Time');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const PAGINATION_THRESHOLD = 20;
  const PAGE_SIZE_OPTIONS = [10, 20, 50];

  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    if (selectedTime === 'Today') {
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedTime === 'This Week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedTime === 'This Month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  const filteredEvents = mockEvents.filter(event => {
    if (selectedEvent !== 'All Events' && event.eventType !== selectedEvent) {
      return false;
    }
    if (selectedTime !== 'All Time') {
      const { startDate, endDate } = getDateRange();
      const eventDate = new Date(event.eventDate);
      return eventDate >= startDate && eventDate <= endDate;
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedEvent, selectedTime]);

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const showPagination = totalPages > 1;

  const handlePageSizeChange = e => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5; // numbers in the middle section

    if (totalPages <= 7) {
      // Small page count → show everything
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftBound = Math.max(2, currentPage - 1);
    const rightBound = Math.min(totalPages - 1, currentPage + 1);

    // Always show first page
    pages.push(1);

    // Show left ellipsis
    if (currentPage > 3) {
      pages.push('left-ellipsis');
    }

    // Middle pages
    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i);
    }

    // Show right ellipsis
    if (currentPage < totalPages - 2) {
      pages.push('right-ellipsis');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div
      className={`tracking-container-global ${styles.trackingContainer} ${
        darkMode ? styles.trackingContainerDark : ''
      }`}
    >
      <div className={`${styles.trackingHeader} ${darkMode ? styles.trackingHeaderDark : ''}`}>
        <h3>Drop-off and no-show rate tracking</h3>
        <div className={`${styles.trackingFilters} ${darkMode ? styles.trackingFiltersDark : ''}`}>
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
            <option value="All Events">All Events</option>
            <option value="Yoga Class">Yoga Class</option>
            <option value="Cooking Workshop">Cooking Workshop</option>
            <option value="Dance Class">Dance Class</option>
            <option value="Fitness Bootcamp">Fitness Bootcamp</option>
          </select>
          <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      <div className={styles.trackingSummary}>
        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <p className={styles.trackingRateValue}>
            +5% <span>Last week</span>
          </p>
          <p className={styles.trackingRateSubheading}>
            <span> Drop-off rate</span>
          </p>
        </div>
        <div className={`${styles.trackingRate} ${darkMode ? styles.trackingRateDark : ''}`}>
          <p className={styles.trackingRateValue}>
            +5% <span>Last week</span>
          </p>
          <p className={styles.trackingRateSubheading}>
            <span> No-show rate </span>
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
              <th>Event name</th>
              <th>No-show rate</th>
              <th>Drop-off rate</th>
              <th>Attendees</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.map(event => (
              <tr key={event.id}>
                <td>{event.eventName}</td>
                <td className={styles.trackingRateGreen}>{event.noShowRate}</td>
                <td className={styles.trackingRateRed}>{event.dropOffRate}</td>
                <td>{event.attendees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*Pagination*/}
      {showPagination && (
        <div
          className={`${styles.paginationContainer} ${
            darkMode ? styles.paginationContainerDark : ''
          }`}
        >
          <div className={styles.paginationInfo}>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length}{' '}
            records
          </div>

          <div className={styles.paginationControls}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={darkMode ? styles.paginationButtonDark : ''}
            >
              Previous
            </button>

            <div className={styles.pageNumbers}>
              {getVisiblePages().map(page =>
                page === 'left-ellipsis' || page === 'right-ellipsis' ? (
                  <span key={page} className={styles.ellipsis}>
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${styles.pageNumberButton} ${
                      currentPage === page ? styles.activePage : ''
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <span className={styles.pageIndicator}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={darkMode ? styles.paginationButtonDark : ''}
            >
              Next
            </button>
          </div>

          <div className={styles.pageSizeSelector}>
            <label htmlFor="pageSize">Records per page:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className={darkMode ? styles.pageSizeSelectorDark : ''}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropOffTracking;
