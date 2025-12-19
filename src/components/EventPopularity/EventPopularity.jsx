'use client';

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
import { useSelector } from 'react-redux';

// Sample data
const eventTypeData = [
  { name: 'Event Type 1', registered: 75 },
  { name: 'Event Type 2', registered: 60 },
  { name: 'Event Type 3', registered: 55 },
  { name: 'Event Type 4', registered: 50 },
  { name: 'Event Type 5', registered: 45 },
  { name: 'Event Type 6', registered: 40 },
];

const timeData = [
  { time: '9:00', registered: 8, attended: 12 },
  { time: '11:00', registered: 15, attended: 18 },
  { time: '13:00', registered: 20, attended: 25 },
  { time: '15:00', registered: 25, attended: 30 },
  { time: '17:00', registered: 18, attended: 20 },
  { time: '19:00', registered: 10, attended: 15 },
  { time: '21:00', registered: 5, attended: 8 },
];

const participationCards = [
  {
    title: '5+',
    subtitle: 'Repeated participation',
    trend: '-10%',
    trendType: 'negative',
    participants: 3,
  },
  {
    title: '2+',
    subtitle: 'Repeated participation',
    trend: '+25%',
    trendType: 'positive',
    participants: 3,
  },
  {
    title: '<1',
    subtitle: 'Repeated participation',
    trend: '-5%',
    trendType: 'negative',
    participants: 3,
  },
  {
    title: '420',
    subtitle: 'Total Members',
    trend: '+20%',
    trendType: 'positive',
  },
];

export default function EventDashboard() {
  const darkMode = useSelector(state => state.theme?.darkMode);

  return (
    <div className={`${styles.eventpopularity} ${darkMode ? styles.dark : ''}`}>
      <h1 className={styles.epheader}>Event Attendance Trend</h1>

      <div className={styles.epgrid}>
        {/* Event Registration Trend (Type) */}
        <div className={styles.epCard}>
          <h2>Event Registration Trend (Type)</h2>

          <div>
            <div className={styles.epRowLabel}>
              <span>Event Name</span>
              <span>Registered Members</span>
            </div>

            {eventTypeData.map(event => (
              <div key={event.name} className={styles.epRowLabel}>
                <span className={styles.epEventName}>{event.name}</span>

                <div className={styles.epProgressBar}>
                  <div
                    className={styles.epProgressFill}
                    style={{ width: `${(event.registered / 75) * 100}%` }}
                  />
                </div>

                <span>{event.registered}</span>
              </div>
            ))}
          </div>

          <div className={styles.epStatsGrid}>
            <div className={styles.epStatCard}>
              <h3 style={{ color: 'var(--ep-primary)' }}>325</h3>
              <p className={styles.epStatSubtitle}>Total Registered Members</p>
            </div>

            <div className={styles.epStatCard}>
              <h3>Event Type 1</h3>
              <p className={styles.epStatSubtitle}>Most Popular Event Type</p>
            </div>

            <div className={styles.epStatCard}>
              <h3>Event Type 6</h3>
              <p className={styles.epStatSubtitle}>Least Popular Event Type</p>
            </div>
          </div>
        </div>

        {/* Event Registration Trend (Time) */}
        <div className={styles.epChartCard}>
          <h2>Event Registration Trend (Time)</h2>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeData}>
              <CartesianGrid stroke="var(--ep-grid-stroke)" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="var(--ep-chart-tick)" />
              <YAxis stroke="var(--ep-chart-tick)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--ep-card-bg)',
                  color: 'var(--ep-text-color)',
                }}
              />
              <Legend />
              <Bar dataKey="registered" fill="var(--ep-primary)" />
              <Bar dataKey="attended" fill="var(--ep-primary-2)" />
            </BarChart>
          </ResponsiveContainer>

          <div className={styles.epParticipationGrid}>
            {participationCards.map(card => (
              <div key={card.title} className={styles.epParticipationCard}>
                <h3>{card.title}</h3>
                <p className={styles.epStatSubtitle}>{card.subtitle}</p>

                {card.participants && <div>👥 +{card.participants}</div>}

                <p
                  className={
                    card.trendType === 'positive' ? styles.trendPositive : styles.trendNegative
                  }
                >
                  {card.trend} Monthly
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
