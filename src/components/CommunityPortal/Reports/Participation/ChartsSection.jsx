import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import mockEvents from './mockData';
import styles from './ChartsSection.module.css';

function ChartsSection() {
  const darkMode = useSelector(state => state.theme.darkMode);

  // Group data by event type
  const eventTypeStats = [];
  const groups = {};

  mockEvents.forEach(evt => {
    const key = evt.eventType;

    if (!groups[key]) {
      groups[key] = { count: 0, noShowSum: 0, dropSum: 0 };
    }

    groups[key].count++;
    groups[key].noShowSum += Number.parseInt(evt.noShowRate, 10);
    groups[key].dropSum += Number.parseInt(evt.dropOffRate, 10);
  });

  Object.entries(groups).forEach(([key, stats]) => {
    eventTypeStats.push({
      eventType: key,
      avgNoShow: Math.round(stats.noShowSum / stats.count),
      avgDrop: Math.round(stats.dropSum / stats.count),
    });
  });

  // Monthly trend
  const monthlyTrend = {};

  mockEvents.forEach(evt => {
    const m = new Date(evt.eventDate).getMonth();

    if (!monthlyTrend[m]) {
      monthlyTrend[m] = { count: 0, noShowSum: 0 };
    }

    monthlyTrend[m].count++;
    monthlyTrend[m].noShowSum += Number.parseInt(evt.noShowRate, 10);
  });

  const trendData = Object.keys(monthlyTrend).map(m => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m],
    avgNoShow: Math.round(monthlyTrend[m].noShowSum / monthlyTrend[m].count),
  }));

  // Location distribution
  const locationGroups = {};

  mockEvents.forEach(evt => {
    const loc = evt.location;
    if (!locationGroups[loc]) locationGroups[loc] = 0;
    locationGroups[loc]++;
  });

  const locationData = Object.keys(locationGroups).map(loc => ({
    name: loc,
    value: locationGroups[loc],
  }));

  const pieColors = ['#007bff', '#00b894', '#e17055', '#6c5ce7', '#fdcb6e'];

  // Dark-mode-aware tooltip styling so tooltips stay readable in both themes
  const tooltipProps = {
    contentStyle: {
      backgroundColor: darkMode ? '#2c2f33' : '#fff',
      border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
      borderRadius: 4,
    },
    labelStyle: { color: darkMode ? '#fff' : '#333' },
    itemStyle: { color: darkMode ? '#fff' : '#333' },
    cursor: { fill: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
  };

  return (
    <div className={`${styles.chartsSection} ${darkMode ? styles.chartsSectionDark : ''}`}>
      <h3 className={styles.sectionTitle}>Comparative Charts</h3>

      {/* Row 1 — Bar Charts */}
      <div className={styles.row}>
        {/* No-Show Chart */}
        <div className={styles.chartBox}>
          <h4>No-show rate by event type</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={eventTypeStats}>
              <XAxis dataKey="eventType" stroke={darkMode ? '#fff' : '#333'} />
              <YAxis stroke={darkMode ? '#fff' : '#333'} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="avgNoShow" fill="#FF6B6B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Drop-Off Chart */}
        <div className={styles.chartBox}>
          <h4>Drop-off rate by event type</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={eventTypeStats}>
              <XAxis dataKey="eventType" stroke={darkMode ? '#fff' : '#333'} />
              <YAxis stroke={darkMode ? '#fff' : '#333'} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="avgDrop" fill="#4C89FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 — Line Chart */}
      <div className={styles.chartBoxFull}>
        <h5>Monthly no-show trend</h5>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <XAxis dataKey="month" stroke={darkMode ? '#fff' : '#333'} />
            <YAxis stroke={darkMode ? '#fff' : '#333'} />
            <Tooltip {...tooltipProps} />
            <Line type="monotone" dataKey="avgNoShow" stroke="#FF6B6B" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3 — Pie Chart */}
      <div className={styles.chartBoxFull}>
        <h5>Participation by location</h5>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={locationData} dataKey="value" nameKey="name" outerRadius={110} label>
              {locationData.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipProps} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartsSection;
