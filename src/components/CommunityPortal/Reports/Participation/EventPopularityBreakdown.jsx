import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getPopularityMetrics, getEventValue } from '~/actions/eventActions';
import { FaUsers, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import styles from './EventPopularityBreakdown.module.css';

function EventPopularityBreakdown() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [popularityData, setPopularityData] = useState([]);
  const [eventValues, setEventValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [popularityResponse, valueResponse] = await Promise.all([
          getPopularityMetrics(),
          getEventValue(),
        ]);

        if (popularityResponse && popularityResponse.data) {
          setPopularityData(popularityResponse.data.metrics || []);
        } else if (popularityResponse && popularityResponse.status >= 400) {
          throw new Error(popularityResponse.message || 'Failed to fetch popularity metrics');
        } else if (popularityResponse && !popularityResponse.data) {
          throw new Error(popularityResponse.message || 'Failed to fetch popularity metrics');
        }

        if (valueResponse && valueResponse.data) {
          setEventValues(valueResponse.data.eventValues);
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.containerDark : ''}`}>
        <div className={styles.loadingContainer}>
          <p>Loading popularity metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.containerDark : ''}`}>
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles.containerDark : ''}`}>
      <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
        Event Type Breakdown & Popularity Metrics
      </h2>

      {eventValues && (
        <div className={`${styles.valueSummary} ${darkMode ? styles.valueSummaryDark : ''}`}>
          <div className={styles.valueCard}>
            <span className={styles.valueLabel}>Total Estimated Value</span>
            <span className={styles.valueAmount}>${eventValues.totalValue.toLocaleString()}</span>
          </div>
          <div className={styles.valueCard}>
            <span className={styles.valueLabel}>Average Value per Event</span>
            <span className={styles.valueAmount}>
              ${eventValues.averageValuePerEvent.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className={styles.metricsGrid}>
        {popularityData.map(metric => (
          <div
            key={metric.eventType}
            className={`${styles.metricCard} ${darkMode ? styles.metricCardDark : ''}`}
          >
            <div className={styles.metricHeader}>
              <h3 className={styles.eventType}>{metric.eventType}</h3>
            </div>

            <div className={styles.metricStats}>
              <div className={styles.statItem}>
                <FaCalendarAlt className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{metric.totalEvents}</span>
                  <span className={styles.statLabel}>Total Events</span>
                </div>
              </div>

              <div className={styles.statItem}>
                <FaUsers className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{metric.totalAttendees}</span>
                  <span className={styles.statLabel}>Total Attendees</span>
                </div>
              </div>

              <div className={styles.statItem}>
                <FaChartBar className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    {metric.averageAttendeesPerEvent.toFixed(1)}
                  </span>
                  <span className={styles.statLabel}>Avg Attendees/Event</span>
                </div>
              </div>
            </div>

            <div className={styles.detailedStats}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Registrations:</span>
                <span className={styles.detailValue}>{metric.totalRegistrations}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Avg Registrations/Event:</span>
                <span className={styles.detailValue}>
                  {metric.averageRegistrationsPerEvent.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {popularityData.length === 0 && (
        <div className={styles.emptyState}>
          <p>No popularity metrics available</p>
        </div>
      )}
    </div>
  );
}

export default EventPopularityBreakdown;
