'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import styles from './EventPopularity.module.css';

// Sample data
const eventTypeData = [
  { name: 'Community Volunteer Day', registered: 75, attended: 65, id: 1 },
  { name: 'Skill Development Workshop', registered: 60, attended: 52, id: 2 },
  { name: 'Networking Mixer', registered: 55, attended: 48, id: 3 },
  { name: 'Environmental Cleanup', registered: 50, attended: 42, id: 4 },
  { name: 'Youth Membership Program', registered: 45, attended: 38, id: 5 },
  { name: 'Cultural Exchange Event', registered: 40, attended: 32, id: 6 },
];

const timeData = [
  { time: '9:00 AM', registered: 8, attended: 12, timeSlot: 'morning', hour: 9 },
  { time: '11:00 AM', registered: 15, attended: 18, timeSlot: 'morning', hour: 11 },
  { time: '1:00 PM', registered: 20, attended: 25, timeSlot: 'afternoon', hour: 1 },
  { time: '3:00 PM', registered: 25, attended: 30, timeSlot: 'afternoon', hour: 3 },
  { time: '5:00 PM', registered: 18, attended: 20, timeSlot: 'evening', hour: 5 },
  { time: '7:00 PM', registered: 10, attended: 15, timeSlot: 'evening', hour: 7 },
  { time: '9:00 PM', registered: 5, attended: 8, timeSlot: 'night', hour: 9 },
];

const participationCards = [
  {
    title: '5+ Events',
    subtitle: 'Highly Engaged Members',
    description: 'Users who attended 5 or more events',
    trend: '-10%',
    trendType: 'negative',
    participants: 3,
    id: 'participation-5plus',
  },
  {
    title: '2-4 Events',
    subtitle: 'Regular Participants',
    description: 'Users who attended 2 to 4 events',
    trend: '+25%',
    trendType: 'positive',
    participants: 3,
    id: 'participation-2plus',
  },
  {
    title: '1 Event',
    subtitle: 'New/One-Time Attendees',
    description: 'First-time or one-time participants',
    trend: '-5%',
    trendType: 'negative',
    participants: 3,
    id: 'participation-1less',
  },
  {
    title: '420 Users',
    subtitle: 'Total Active Members',
    description: 'Total users with at least one event attendance',
    trend: '+20%',
    trendType: 'positive',
    id: 'total-members',
  },
];

const allEventTypes = eventTypeData.map(e => e.name);
const timeOfDayOptions = ['morning', 'afternoon', 'evening', 'night'];

export default function EventDashboard() {
  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState([]);

  // Detail view states
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedEventTypeDetail, setSelectedEventTypeDetail] = useState(null);
  const [detailView, setDetailView] = useState(null);

  // Filter toggle callbacks
  const toggleEventTypeFilter = useCallback(eventType => {
    setSelectedEventTypes(prev => {
      if (prev.includes(eventType)) {
        return prev.filter(t => t !== eventType);
      }
      return [...prev, eventType];
    });
  }, []);

  const toggleTimeOfDayFilter = useCallback(timeOfDay => {
    setSelectedTimeOfDay(prev => {
      if (prev.includes(timeOfDay)) {
        return prev.filter(t => t !== timeOfDay);
      }
      return [...prev, timeOfDay];
    });
  }, []);

  const resetAllFilters = useCallback(() => {
    setDateRange({ start: '', end: '' });
    setSelectedEventTypes([]);
    setSelectedTimeOfDay([]);
    setSelectedTimeSlot(null);
    setSelectedEventTypeDetail(null);
    setDetailView(null);
  }, []);

  // Filter event type data based on selected filters
  const filteredEventTypeData = useMemo(() => {
    let filtered = [...eventTypeData];

    if (selectedEventTypes.length > 0) {
      filtered = filtered.filter(event => selectedEventTypes.includes(event.name));
    }
    return filtered;
  }, [selectedEventTypes]);

  // Filter time data based on selected time of day filters
  const filteredTimeData = useMemo(() => {
    let filtered = [...timeData];

    if (selectedTimeOfDay.length > 0) {
      filtered = filtered.filter(item => selectedTimeOfDay.includes(item.timeSlot));
    }
    return filtered;
  }, [selectedTimeOfDay]);

  // Calculate stats from filtered event type data
  const stats = useMemo(() => {
    const totalRegistered = filteredEventTypeData.reduce((sum, e) => sum + e.registered, 0);
    const totalAttended = filteredEventTypeData.reduce((sum, e) => sum + e.attended, 0);
    const mostPopular =
      filteredEventTypeData.length > 0
        ? filteredEventTypeData.reduce((max, e) => (e.registered > max.registered ? e : max))
        : null;
    const leastPopular =
      filteredEventTypeData.length > 0
        ? filteredEventTypeData.reduce((min, e) => (e.registered < min.registered ? e : min))
        : null;
    const attendanceRate =
      totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    return {
      totalRegistered,
      totalAttended,
      mostPopular,
      leastPopular,
      attendanceRate,
    };
  }, [filteredEventTypeData]);

  // Calculate time slot details when one is selected
  const timeSlotDetails = useMemo(() => {
    if (!selectedTimeSlot) {
      return null;
    }

    const slot = filteredTimeData.find(item => item.time === selectedTimeSlot);

    if (!slot) {
      return null;
    }

    const attendanceRate =
      slot.registered > 0 ? Math.round((slot.attended / slot.registered) * 100) : 0;

    return {
      time: slot.time,
      registered: slot.registered,
      attended: slot.attended,
      noShow: slot.registered - slot.attended,
      attendanceRate,
    };
  }, [selectedTimeSlot, filteredTimeData]);

  // Calculate event type details when one is selected
  const eventTypeDetails = useMemo(() => {
    if (!selectedEventTypeDetail) {
      return null;
    }

    const eventType = filteredEventTypeData.find(e => e.name === selectedEventTypeDetail);

    if (!eventType) {
      return null;
    }

    const noShow = eventType.registered - eventType.attended;
    const attendanceRate =
      eventType.registered > 0 ? Math.round((eventType.attended / eventType.registered) * 100) : 0;

    return {
      name: eventType.name,
      registered: eventType.registered,
      attended: eventType.attended,
      noShow,
      attendanceRate,
    };
  }, [selectedEventTypeDetail, filteredEventTypeData]);

  // Handle bar click to drill down into time slot details
  const handleBarClick = useCallback(data => {
    setSelectedTimeSlot(data.time);
    setDetailView('timeSlot');
    setSelectedEventTypeDetail(null);
  }, []);

  // Handle event type click to drill down into event details
  const handleEventTypeClick = useCallback(eventName => {
    setSelectedEventTypeDetail(eventName);
    setDetailView('eventType');
    setSelectedTimeSlot(null);
  }, []);

  // Handle participation card click
  const handleCardClick = useCallback(cardId => {
    setDetailView('participation');
  }, []);

  // Close detail view and reset selections
  const closeDetailView = useCallback(() => {
    setDetailView(null);
    setSelectedTimeSlot(null);
    setSelectedEventTypeDetail(null);
  }, []);

  return (
    <div className={`${styles.eventpopularity}`}>
      {/* Header */}
      <div className={styles.epHeader}>
        <div>
          <h1 className={styles.epTitle}>Event Attendance Dashboard</h1>
          <p className={styles.epSubtitle}>Filter and explore event participation data</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className={styles.epFilterPanel}>
        <div className={styles.epFilterHeader}>
          <h2 className={styles.epFilterTitle}>Filters & Controls</h2>
          <button
            onClick={resetAllFilters}
            className={styles.epResetBtn}
            title="Reset all filters to default state"
          >
            Reset All Filters
          </button>
        </div>

        {/* Date Range Filter */}
        <div className={styles.epFilterGroup}>
          {/*// eslint-disable-next-line jsx-a11y/label-has-associated-control*/}
          <label htmlFor="dateRange" className={styles.epFilterLabel}>
            Date Range
          </label>

          <input id="dateRange" type="date" />
          <div className={styles.epDateInputs}>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className={styles.epDateInput}
              placeholder="Start date"
              aria-label="Start date filter"
            />
            <span className={styles.epDateSeparator}>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className={styles.epDateInput}
              placeholder="End date"
              aria-label="End date filter"
            />
          </div>
        </div>

        {/* Event Type Filter */}
        <div className={styles.epFilterGroup}>
          <label className={styles.epFilterLabel}>
            Event Types {selectedEventTypes.length > 0 && `(${selectedEventTypes.length})`}
          </label>
          <div className={styles.epButtonGroup}>
            {allEventTypes.map(eventType => (
              <button
                key={eventType}
                onClick={() => toggleEventTypeFilter(eventType)}
                className={`${styles.epFilterBtn} ${
                  selectedEventTypes.includes(eventType) ? styles.epFilterBtnActive : ''
                }`}
                aria-pressed={selectedEventTypes.includes(eventType)}
                title={`Filter by ${eventType}`}
              >
                {eventType}
              </button>
            ))}
          </div>
        </div>

        {/* Time of Day Filter */}
        <div className={styles.epFilterGroup}>
          <label className={styles.epFilterLabel}>
            Time of Day {selectedTimeOfDay.length > 0 && `(${selectedTimeOfDay.length})`}
          </label>
          <div className={styles.epButtonGroup}>
            {timeOfDayOptions.map(timeOfDay => (
              <button
                key={timeOfDay}
                onClick={() => toggleTimeOfDayFilter(timeOfDay)}
                className={`${styles.epFilterBtn} ${
                  selectedTimeOfDay.includes(timeOfDay) ? styles.epFilterBtnActive : ''
                }`}
                aria-pressed={selectedTimeOfDay.includes(timeOfDay)}
                title={`Filter by ${timeOfDay}`}
              >
                {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={`${styles.epgrid} ${detailView ? styles.withDetailView : ''}`}>
        {/* Event Registration Trend (Type) */}
        <div className={styles.epCard}>
          <h2 className={styles.epCardTitle}>Event Registration Trend (Type)</h2>

          <div className={styles.epEventsList}>
            <div className={styles.epRowHeader}>
              <span>Event Name</span>
              <span>Registered / Attended</span>
            </div>

            {filteredEventTypeData.length > 0 ? (
              filteredEventTypeData.map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventTypeClick(event.name)}
                  className={`${styles.epEventRow} ${
                    selectedEventTypeDetail === event.name ? styles.epEventRowActive : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleEventTypeClick(event.name);
                    }
                  }}
                  title={`Click to view details for ${event.name}`}
                >
                  <span className={styles.epEventName}>{event.name}</span>

                  <div className={styles.epProgressBar}>
                    <div
                      className={styles.epProgressFill}
                      style={{ width: `${(event.registered / 75) * 100}%` }}
                    />
                  </div>

                  <span className={styles.epEventStats}>
                    {event.registered} / {event.attended}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.epEmptyState}>
                <p>No events match your filters. Try adjusting your selection.</p>
              </div>
            )}
          </div>

          {/* Summary Cards for Event Types */}
          <div className={styles.epStatsGrid}>
            {[
              {
                title: stats.totalRegistered > 0 ? stats.totalRegistered : 'N/A',
                subtitle: 'Total Registered',
                isPrimary: true,
                id: 'event-card-0',
              },
              {
                title: stats.mostPopular?.name || 'N/A',
                subtitle: 'Most Popular Type',
                id: 'event-card-1',
              },
              {
                title: stats.leastPopular?.name || 'N/A',
                subtitle: 'Least Popular Type',
                id: 'event-card-2',
              },
            ].map(card => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`${styles.epStatCard} ${card.isPrimary ? styles.epStatCardPrimary : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(card.id);
                  }
                }}
                title="Click to view details"
              >
                <h3 className={styles.epStatTitle}>{card.title}</h3>
                <p className={styles.epStatSubtitle}>{card.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Event Registration Trend (Time) */}
        <div className={styles.epChartCard}>
          <h2 className={styles.epCardTitle}>Event Registration Trend (Time)</h2>

          <div className={styles.epChartContainer}>
            {filteredTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={filteredTimeData}>
                  <CartesianGrid stroke="var(--ep-grid-stroke)" strokeDasharray="3 3" />
                  <XAxis dataKey="time" stroke="var(--ep-chart-tick)" />
                  <YAxis stroke="var(--ep-chart-tick)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--ep-card-bg)',
                      color: 'var(--ep-text-color)',
                      border: '1px solid var(--ep-border-color)',
                      borderRadius: '4px',
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div className={styles.epChartTooltip}>
                            <p className={styles.epTooltipTime}>{data.time}</p>
                            <p className={styles.epTooltipRegistered}>
                              Registered: {data.registered}
                            </p>
                            <p className={styles.epTooltipAttended}>Attended: {data.attended}</p>
                            <p className={styles.epTooltipHint}>Click to drill down</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="registered"
                    name="Registered Users"
                    fill="var(--ep-primary)"
                    onClick={e => handleBarClick(e)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Bar
                    dataKey="attended"
                    name="Attended Users"
                    fill="var(--ep-primary-2)"
                    onClick={e => handleBarClick(e)}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.epEmptyState}>
                <p>No time slot data available for selected filters.</p>
              </div>
            )}
          </div>

          {/* Summary Cards for Time */}
          <div className={styles.epParticipationGrid}>
            {participationCards.slice(0, 2).map(card => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={styles.epParticipationCard}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(card.id);
                  }
                }}
                title={`Click to view ${card.title} details`}
              >
                <div className={styles.epCardHeader}>
                  <h3 className={styles.epCardTitle}>{card.title}</h3>
                  <span className={styles.epCardArrow}>→</span>
                </div>
                <p className={styles.epStatSubtitle}>{card.subtitle}</p>
                {card.participants && (
                  <div className={styles.epParticipantsInfo}>
                    <span>👥</span> +{card.participants} users
                  </div>
                )}
                <p
                  className={`${styles.epTrend} ${
                    card.trendType === 'positive' ? styles.trendPositive : styles.trendNegative
                  }`}
                >
                  {card.trend} Monthly
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail View Panel */}
      {detailView && (
        <div className={styles.epDetailViewPanel}>
          <div className={styles.epDetailHeader}>
            <h2 className={styles.epDetailTitle}>
              {detailView === 'timeSlot'
                ? `⏰ Time Slot Details: ${selectedTimeSlot}`
                : detailView === 'eventType'
                ? `📅 Event Type Details: ${selectedEventTypeDetail}`
                : '📊 Participation Details'}
            </h2>
            <button
              onClick={closeDetailView}
              className={styles.epCloseBtn}
              title="Close detail view"
              aria-label="Close detail view"
            >
              ✕
            </button>
          </div>

          {detailView === 'timeSlot' && timeSlotDetails && (
            <div className={styles.epDetailGrid}>
              <div className={styles.epDetailCard}>
                <p className={styles.epDetailLabel}>Time</p>
                <h3 className={styles.epDetailValue}>{timeSlotDetails.time}</h3>
              </div>
              <div className={styles.epDetailCard}>
                <p className={styles.epDetailLabel}>Registered</p>
                <h3 className={styles.epDetailValue}>{timeSlotDetails.registered}</h3>
              </div>
              <div className={styles.epDetailCard}>
                <p className={styles.epDetailLabel}>Attended</p>
                <h3 className={styles.epDetailValue}>{timeSlotDetails.attended}</h3>
              </div>
              <div className={styles.epDetailCard}>
                <p className={styles.epDetailLabel}>No-Show</p>
                <h3 className={styles.epDetailValue}>{timeSlotDetails.noShow}</h3>
              </div>
              <div className={`${styles.epDetailCard} ${styles.epDetailCardFull}`}>
                <p className={styles.epDetailLabel}>Attendance Rate</p>
                <h3 className={styles.epDetailValueLarge}>{timeSlotDetails.attendanceRate}%</h3>
              </div>
            </div>
          )}

          {detailView === 'eventType' && eventTypeDetails && (
            <div className={styles.epDetailGrid}>
              <div className={styles.epDetailCard}>
                <p className={styles.epDetailLabel}>Event Type</p>
                <h3 className={styles.epDetailValue}>{eventTypeDetails.name}</h3>
              </div>
              <div className={styles.epDetailCard}>
                <p className={styles.epDetailLabel}>Registered</p>
                <h3 className={styles.epDetailValue}>{eventTypeDetails.registered}</h3>
              </div>
              <div className={styles.epDetailCard}>
                <p className={styles.epDetailLabel}>Attended</p>
                <h3 className={styles.epDetailValue}>{eventTypeDetails.attended}</h3>
              </div>
              <div className={styles.epDetailCard}>
                <p className={styles.epDetailLabel}>No-Show</p>
                <h3 className={styles.epDetailValue}>{eventTypeDetails.noShow}</h3>
              </div>
              <div className={`${styles.epDetailCard} ${styles.epDetailCardFull}`}>
                <p className={styles.epDetailLabel}>Attendance Rate</p>
                <h3 className={styles.epDetailValueLarge}>{eventTypeDetails.attendanceRate}%</h3>
              </div>
            </div>
          )}

          {detailView === 'participation' && (
            <div className={styles.epDetailGrid}>
              <div className={`${styles.epDetailCard} ${styles.epDetailCardFull}`}>
                <p className={styles.epDetailLabel}>Analysis</p>
                <h3 className={styles.epDetailValue}>Participation Metrics</h3>
                <p className={styles.epDetailDescription}>
                  This view shows aggregated participation data across all time periods and event
                  types.
                </p>
                <button className={styles.epDetailActionBtn}>View Detailed Report</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
