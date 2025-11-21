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
    groups[key].noShowSum += parseInt(evt.noShowRate, 10);
    groups[key].dropSum += parseInt(evt.dropOffRate, 10);
  });

  for (const key in groups) {
    eventTypeStats.push({
      eventType: key,
      avgNoShow: Math.round(groups[key].noShowSum / groups[key].count),
      avgDrop: Math.round(groups[key].dropSum / groups[key].count),
    });
  }

  // Monthly trend
  const monthlyTrend = {};

  mockEvents.forEach(evt => {
    const m = new Date(evt.eventDate).getMonth();

    if (!monthlyTrend[m]) {
      monthlyTrend[m] = { count: 0, noShowSum: 0 };
    }

    monthlyTrend[m].count++;
    monthlyTrend[m].noShowSum += parseInt(evt.noShowRate, 10);
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
              <Tooltip />
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
              <Tooltip />
              <Bar dataKey="avgDrop" fill="#4C89FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 — Line Chart */}
      <div className={styles.chartBoxFull}>
        <h4>Monthly no-show trend</h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <XAxis dataKey="month" stroke={darkMode ? '#fff' : '#333'} />
            <YAxis stroke={darkMode ? '#fff' : '#333'} />
            <Tooltip />
            <Line type="monotone" dataKey="avgNoShow" stroke="#FF6B6B" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3 — Pie Chart */}
      <div className={styles.chartBoxFull}>
        <h4>Participation by location</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={locationData} dataKey="value" nameKey="name" outerRadius={110} label>
              {locationData.map((entry, index) => (
                <Cell key={index} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartsSection;
