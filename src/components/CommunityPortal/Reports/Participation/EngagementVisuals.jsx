import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getEngagementMetrics, getFormatComparison } from '~/actions/eventActions';
import { FaClock, FaChartLine, FaVideo, FaBuilding, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import styles from './EngagementVisuals.module.css';

function EngagementVisuals() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [engagementData, setEngagementData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(''); // 'Virtual', 'In person', or '' for all

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [engagementResponse, comparisonResponse] = await Promise.all([
          getEngagementMetrics(null, null, selectedFormat || undefined),
          getFormatComparison(),
        ]);

        if (engagementResponse && engagementResponse.data) {
          setEngagementData(engagementResponse.data.engagement);
        } else if (engagementResponse && engagementResponse.status >= 400) {
          throw new Error(engagementResponse.message || 'Failed to fetch engagement metrics');
        } else if (engagementResponse && !engagementResponse.data) {
          throw new Error(engagementResponse.message || 'Failed to fetch engagement metrics');
        }

        if (comparisonResponse && comparisonResponse.data) {
          setComparisonData(comparisonResponse.data.comparison);
        }
      } catch (err) {
        setError(err.message || 'An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFormat]);

  if (loading) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.containerDark : ''}`}>
        <div className={styles.loadingContainer}>
          <p>Loading engagement metrics...</p>
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
      <div className={styles.headerSection}>
        <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
          Engagement Metrics & Session Analytics
        </h2>

        <div className={styles.formatFilter}>
          <label htmlFor="formatFilter" className={styles.filterLabel}>
            Filter by Format:
          </label>
          <select
            id="formatFilter"
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            className={`${styles.filterSelect} ${darkMode ? styles.filterSelectDark : ''}`}
          >
            <option value="">All Formats</option>
            <option value="Virtual">Virtual</option>
            <option value="In person">In Person</option>
          </select>
        </div>
      </div>

      {engagementData && (
        <div className={styles.summaryCards}>
          <div className={`${styles.summaryCard} ${darkMode ? styles.summaryCardDark : ''}`}>
            <FaClock className={styles.summaryIcon} />
            <div className={styles.summaryContent}>
              <span className={styles.summaryValue}>
                {engagementData.averageSessionDuration} min
              </span>
              <span className={styles.summaryLabel}>Avg Session Duration</span>
            </div>
          </div>

          <div className={`${styles.summaryCard} ${darkMode ? styles.summaryCardDark : ''}`}>
            <FaUsers className={styles.summaryIcon} />
            <div className={styles.summaryContent}>
              <span className={styles.summaryValue}>{engagementData.totalAttendees}</span>
              <span className={styles.summaryLabel}>Total Attendees</span>
            </div>
          </div>

          <div className={`${styles.summaryCard} ${darkMode ? styles.summaryCardDark : ''}`}>
            <FaChartLine className={styles.summaryIcon} />
            <div className={styles.summaryContent}>
              <span className={styles.summaryValue}>
                {engagementData.averageInteractionRate.toFixed(1)}%
              </span>
              <span className={styles.summaryLabel}>Avg Interaction Rate</span>
            </div>
          </div>

          <div className={`${styles.summaryCard} ${darkMode ? styles.summaryCardDark : ''}`}>
            <FaCalendarAlt className={styles.summaryIcon} />
            <div className={styles.summaryContent}>
              <span className={styles.summaryValue}>{engagementData.totalEvents}</span>
              <span className={styles.summaryLabel}>Total Events</span>
            </div>
          </div>
        </div>
      )}

      {comparisonData && (
        <div className={styles.comparisonSection}>
          <h3 className={`${styles.comparisonTitle} ${darkMode ? styles.comparisonTitleDark : ''}`}>
            Format Comparison: Virtual vs In-Person
          </h3>

          <div className={styles.comparisonGrid}>
            <div
              className={`${styles.comparisonCard} ${darkMode ? styles.comparisonCardDark : ''}`}
            >
              <div className={styles.comparisonHeader}>
                <FaVideo className={styles.formatIcon} />
                <h4 className={styles.formatTitle}>Virtual Events</h4>
              </div>
              <div className={styles.comparisonStats}>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonLabel}>Total Events:</span>
                  <span className={styles.comparisonValue}>
                    {comparisonData.virtual.totalEvents}
                  </span>
                </div>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonLabel}>Total Attendees:</span>
                  <span className={styles.comparisonValue}>
                    {comparisonData.virtual.totalAttendees}
                  </span>
                </div>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonLabel}>Avg Attendees/Event:</span>
                  <span className={styles.comparisonValue}>
                    {comparisonData.virtual.averageAttendeesPerEvent}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`${styles.comparisonCard} ${darkMode ? styles.comparisonCardDark : ''}`}
            >
              <div className={styles.comparisonHeader}>
                <FaBuilding className={styles.formatIcon} />
                <h4 className={styles.formatTitle}>In-Person Events</h4>
              </div>
              <div className={styles.comparisonStats}>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonLabel}>Total Events:</span>
                  <span className={styles.comparisonValue}>
                    {comparisonData.inPerson.totalEvents}
                  </span>
                </div>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonLabel}>Total Attendees:</span>
                  <span className={styles.comparisonValue}>
                    {comparisonData.inPerson.totalAttendees}
                  </span>
                </div>
                <div className={styles.comparisonStat}>
                  <span className={styles.comparisonLabel}>Avg Attendees/Event:</span>
                  <span className={styles.comparisonValue}>
                    {comparisonData.inPerson.averageAttendeesPerEvent}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {engagementData && engagementData.events && engagementData.events.length > 0 && (
        <div className={styles.eventsList}>
          <h3 className={`${styles.eventsTitle} ${darkMode ? styles.eventsTitleDark : ''}`}>
            Event Engagement Details
          </h3>
          <div className={styles.eventsGrid}>
            {engagementData.events.slice(0, 10).map(event => (
              <div
                key={event.eventId}
                className={`${styles.eventCard} ${darkMode ? styles.eventCardDark : ''}`}
              >
                <div className={styles.eventHeader}>
                  <h4 className={styles.eventName}>{event.title}</h4>
                  <span className={styles.eventType}>{event.type}</span>
                </div>
                <div className={styles.eventMetrics}>
                  <div className={styles.eventMetric}>
                    <FaClock className={styles.metricIcon} />
                    <span>{event.averageSessionDuration} min</span>
                  </div>
                  <div className={styles.eventMetric}>
                    <FaUsers className={styles.metricIcon} />
                    <span>{event.attendees} attendees</span>
                  </div>
                  <div className={styles.eventMetric}>
                    <FaChartLine className={styles.metricIcon} />
                    <span>{event.interactionRate.toFixed(1)}% interaction</span>
                  </div>
                </div>
                <div className={styles.eventLocation}>
                  {event.location === 'Virtual' ? (
                    <FaVideo className={styles.locationIcon} />
                  ) : (
                    <FaBuilding className={styles.locationIcon} />
                  )}
                  <span>{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!engagementData || engagementData.events?.length === 0) && (
        <div className={styles.emptyState}>
          <p>No engagement metrics available</p>
        </div>
      )}
    </div>
  );
}

export default EngagementVisuals;
