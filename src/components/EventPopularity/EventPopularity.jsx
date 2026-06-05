'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from './EventPopularity.module.css';

const eventTypeData = [
  { name: 'Community Volunteer Day', registered: 75 },
  { name: 'Skill Development Workshop', registered: 60 },
  { name: 'Networking Mixer', registered: 55 },
  { name: 'Environmental Cleanup', registered: 50 },
  { name: 'Youth Membership Program', registered: 45 },
  { name: 'Cultural Exchange Event', registered: 40 },
];

const timeData = [
  { time: '9:00 AM', registered: 8, attended: 12 },
  { time: '11:00 AM', registered: 15, attended: 18 },
  { time: '1:00 PM', registered: 20, attended: 25 },
  { time: '3:00 PM', registered: 25, attended: 30 },
  { time: '5:00 PM', registered: 18, attended: 20 },
  { time: '7:00 PM', registered: 10, attended: 15 },
  { time: '9:00 PM', registered: 5, attended: 8 },
];

const participationCards = [
  {
    title: '5+ Events',
    subtitle: 'Highly Engaged Members',
    description: 'Users who attended 5 or more events',
    trend: '-10%',
    trendType: 'negative',
    participants: 3,
  },
  {
    title: '2-4 Events',
    subtitle: 'Regular Participants',
    description: 'Users who attended 2 to 4 events',
    trend: '+25%',
    trendType: 'positive',
    participants: 3,
  },
  {
    title: '1 Event',
    subtitle: 'New/One-Time Attendees',
    description: 'First-time or one-time participants',
    trend: '-5%',
    trendType: 'negative',
    participants: 3,
  },
  {
    title: '420 Users',
    subtitle: 'Total Active Members',
    description: 'Total users with at least one event attendance',
    trend: '+20%',
    trendType: 'positive',
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={styles.tooltipBox}>
      <div className={styles.tooltipTitle}>{label}</div>

      {payload.map(item => (
        <div key={item.dataKey} className={styles.tooltipRow}>
          <span>{item.name}: </span>
          <strong>{item.value} users</strong>
        </div>
      ))}
    </div>
  );
};

const InfoTooltip = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={styles.infotooltipHover}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}

      {showTooltip && <div className={styles.infotooltipheading}>{text}</div>}
    </div>
  );
};

export default function EventDashboard() {
  const darkMode = useSelector(state => state.theme?.darkMode);

  const currentDate = new Date();

  const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  const dateRangeLabel = `${thirtyDaysAgo.toLocaleDateString()} - ${currentDate.toLocaleDateString()}`;

  return (
    <div className={`${styles.dashboardContainer} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Event Attendance Dashboard</h1>

        <div className={styles.timePeriod}>
          <strong>Time Period:</strong> Last 30 days ({dateRangeLabel})
        </div>

        <div className={styles.subHeader}>
          All metrics below reflect data from the selected time period
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Registration by Type */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Event Registration by Type</h2>

            <InfoTooltip text="Total users who registered for each event type">
              <span className={styles.infoIcon}>?</span>
            </InfoTooltip>
          </div>

          <div className={styles.eventList}>
            <div className={styles.tableHeader}>
              <span>Event Name</span>
              <span>Registered Users</span>
            </div>

            {eventTypeData.map(event => (
              <div key={event.name} className={styles.eventRow}>
                <span className={styles.eventName}>{event.name}</span>

                <div className={styles.progressBarBackground}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${(event.registered / 75) * 100}%`,
                    }}
                  />
                </div>

                <span className={styles.eventCount}>{event.registered} users</span>
              </div>
            ))}
          </div>

          <div className={styles.statsGrid}>
            {[
              {
                title: '325 Users',
                subtitle: 'Total Registrations',
                isPrimary: true,
              },
              {
                title: 'Community Volunteer Day',
                subtitle: 'Most Popular',
              },
              {
                title: 'Cultural Exchange Event',
                subtitle: 'Least Popular',
              },
            ].map(card => (
              <div key={card.title} className={styles.statCard}>
                <h3 className={card.isPrimary ? styles.primaryStatTitle : styles.statTitle}>
                  {card.title}
                </h3>

                <p className={styles.statSubtitle}>{card.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance by Time */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Event Attendance by Time Slot</h2>

            <InfoTooltip text="Registered = sign-ups | Attended = actual participants">
              <span className={styles.infoIcon}>?</span>
            </InfoTooltip>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={timeData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 80,
                  bottom: 40,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ep-grid-stroke, #d1d5db)" />

                <XAxis
                  dataKey="time"
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  stroke="var(--ep-chart-tick, #64748b)"
                />

                <YAxis
                  width={80}
                  tick={{ fontSize: 12 }}
                  stroke="var(--ep-chart-tick, #64748b)"
                  label={{
                    value: 'Number of Users',
                    angle: -90,
                    position: 'insideLeft',
                    dx: -25,
                    style: {
                      textAnchor: 'middle',
                      fill: 'var(--ep-chart-tick, #64748b)',
                      fontSize: 12,
                    },
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />

                <Bar
                  dataKey="registered"
                  name="Registered Users"
                  fill="var(--ep-primary, #4A90E2)"
                />

                <Bar dataKey="attended" name="Attended Users" fill="var(--ep-primary-2, #82B7FF)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.participationGrid}>
            {participationCards.map(card => (
              <div key={card.title} className={styles.participationCard}>
                <div className={styles.participationHeader}>
                  <h3 className={styles.participationTitle}>{card.title}</h3>

                  <InfoTooltip text={card.description}>
                    <span className={styles.smallInfoIcon}>?</span>
                  </InfoTooltip>
                </div>

                <p className={styles.participationSubtitle}>{card.subtitle}</p>

                {Boolean(card.participants) && (
                  <div className={styles.participantCount}>👥 {card.participants} users</div>
                )}

                <p
                  className={
                    card.trendType === 'positive' ? styles.positiveTrend : styles.negativeTrend
                  }
                >
                  {card.trend} vs last month
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
