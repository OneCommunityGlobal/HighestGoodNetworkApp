import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from 'recharts';
import styles from './ReviewersStackedBarChart.module.css';
import MOCK_REVIEWERS_DATA from './reviewersMockData';

// Dummy data
const MOCK_TEAMS = ['All', 'Alpha', 'Beta', 'Gamma', 'Delta'];

// Chart segment colors
const COLORS = {
  Exceptional: '#5D3FD3',
  Sufficient: '#28A745',
  'Needs Changes': '#FFC107',
  'Did Not Review': '#DC3545',
};

const textDark = '#f8fafc';
const axisLine = '#bfc7d1';

// Transform data to suit Recharts
const transformData = rawData =>
  rawData.map(item => ({
    reviewer: item.reviewer,
    isMentor: item.isMentor,
    team: item.team,
    Exceptional: item.counts.Exceptional,
    Sufficient: item.counts.Sufficient,
    'Needs Changes': item.counts['Needs Changes'],
    'Did Not Review': item.counts['Did Not Review'],
  }));

let transformed = [];

// Custom tick components for Y-axis
function CustomYAxisTick({ x, y, payload }) {
  const currentReviewer = payload.value;
  const isMentor = transformed.find(d => d.reviewer === currentReviewer)?.isMentor;
  return (
    <text
      x={x - 5}
      y={y + 4}
      textAnchor="end"
      fill={isMentor ? 'red' : 'black'}
      fontWeight={isMentor ? 'bold' : 'normal'}
    >
      {payload.value}
    </text>
  );
}

// Custom X-axis tick component
function CustomXAxisTick(data) {
  const max = Math.max(
    ...data.map(d => d.Exceptional + d.Sufficient + d['Needs Changes'] + d['Did Not Review']),
    0,
  );
  const upper = Math.ceil(max / 10) * 10;
  const ticks = [];
  for (let i = 0; i <= upper; i += 10) {
    ticks.push(i);
  }
  return { domain: [0, upper], ticks };
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={`${styles.customTooltip}`}>
      <p className={`${styles.tooltipTitle}`}>{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className={`${styles.tooltipEntry}`}>
          <span className={`${styles.tooltipLabel}`} style={{ color: entry.color }}>
            {entry.name}:
          </span>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Custom label for each bar segment
function CustomLabel({ x, y, width, height, value }) {
  // Don't show zero values
  if (value === 0) return null;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
    >
      {value}
    </text>
  );
}

// Function to get date range based on selected duration
function getDateRange(option) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (option) {
    case 'Last Week': {
      const end = new Date(today);
      end.setDate(end.getDate() - 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return { start, end };
    }
    case 'Last 2 weeks': {
      const end = new Date(today);
      end.setDate(end.getDate() - 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 13);
      return { start, end };
    }
    case 'Last Month': {
      const end = new Date(today);
      end.setDate(end.getDate() - 1);
      const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      return { start, end };
    }
    case 'All Time':
    default:
      return { start: null, end: null };
  }
}

function ReviewersStackedBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [teamFilter, setTeamFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState({ label: 'Last Week', value: 'Last Week' });
  const [sortFilter, setSortFilter] = useState('Ascending');
  const { start: filterStartDate, end: filterEndDate } = getDateRange(durationFilter.value);
  const [reviewerData, setReviewerData] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulated API call
  const fetchData = () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        let filtered = [...MOCK_REVIEWERS_DATA];

        if (teamFilter !== 'All') {
          filtered = filtered.filter(item => item.team === teamFilter);
        }

        if (durationFilter.value !== 'All Time') {
          filtered = filtered.filter(item => {
            const prDate = new Date(item.prSubmittedDate);
            return prDate >= filterStartDate && prDate <= filterEndDate;
          });
        }

        transformed = transformData(filtered);

        transformed.sort((a, b) => {
          const totalA = a.Exceptional + a.Sufficient + a['Needs Changes'] + a['Did Not Review'];
          const totalB = b.Exceptional + b.Sufficient + b['Needs Changes'] + b['Did Not Review'];

          return sortFilter === 'Ascending' ? totalA - totalB : totalB - totalA;
        });

        setReviewerData(transformed);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch reviewer data.');
        setLoading(false);
      }
    }, 1000);
  };

  const { domain, ticks } = CustomXAxisTick(transformed);

  // Always use light mode colors for the chart itself
  const axisLineColor = axisLine; // always #bfc7d1

  useEffect(() => {
    setTeams(MOCK_TEAMS);
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [teamFilter, durationFilter, sortFilter]);

  return (
    <div className={`${styles.reviewersChartContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h3>PR Quality by Reviewers</h3>

      <div className={`${styles.reviewersFiltersBar} ${darkMode ? styles.darkMode : ''}`}>
        <div>
          <label
            htmlFor="teamSelect"
            className={`${styles.reviewersLabel} ${darkMode ? styles.darkMode : ''}`}
          >
            Team:
          </label>
          <Select
            id="teamSelect"
            options={teams.map(team => ({ label: team, value: team }))}
            value={{ label: teamFilter, value: teamFilter }}
            onChange={selected => setTeamFilter(selected.value)}
            className={`${styles.reviewersSelectContainer} ${darkMode ? styles.darkMode : ''}`}
            classNamePrefix="reviewersSelect"
          />
        </div>
        <div>
          <label
            htmlFor="sortSelect"
            className={`${styles.reviewersLabel} ${darkMode ? styles.darkMode : ''}`}
          >
            Sort:
          </label>
          <Select
            id="sortSelect"
            options={[
              { label: 'Ascending', value: 'Ascending' },
              { label: 'Descending', value: 'Descending' },
            ]}
            value={{ label: sortFilter, value: sortFilter }}
            onChange={selected => setSortFilter(selected.value)}
            className={`${styles.reviewersSelectContainer} ${darkMode ? styles.darkMode : ''}`}
            classNamePrefix="reviewersSelect"
          />
        </div>
        <div>
          <label
            htmlFor="durationSelect"
            className={`${styles.reviewersLabel} ${darkMode ? styles.darkMode : ''}`}
          >
            Duration:
          </label>
          <Select
            id="durationSelect"
            options={[
              { label: 'Last Week', value: 'Last Week' },
              { label: 'Last 2 weeks', value: 'Last 2 weeks' },
              { label: 'Last Month', value: 'Last Month' },
              { label: 'All Time', value: 'All Time' },
            ]}
            value={{ label: durationFilter.label, value: durationFilter.value }}
            onChange={selected => setDurationFilter(selected)}
            className={`${styles.reviewersSelectContainer} ${darkMode ? styles.darkMode : ''}`}
            classNamePrefix="reviewersSelect"
          />
        </div>
      </div>

      {loading ? (
        <div
          className={`${styles.reviewerStackbarLoading} ${darkMode ? styles.darkMode : ''}`}
          style={{ color: darkMode ? textDark : '#000', justifyItems: 'center' }}
        >
          <div
            className={`${styles.loadingSpinner} ${darkMode ? styles.darkMode : ''}`}
            style={darkMode ? { borderTop: '4px solid #f8fafc' } : {}}
          />
          <p style={{ color: darkMode ? textDark : undefined, justifyItems: 'center' }}>
            Loading Reviewers data...
          </p>
        </div>
      ) : error ? (
        <div
          className={`${styles.reviewersStackbarError} ${darkMode ? styles.darkMode : ''}`}
          style={{ color: darkMode ? textDark : undefined, justifyItems: 'center' }}
        >
          <div className={`${styles.errorIcon}`}>⚠️</div>
          <p style={{ color: darkMode ? textDark : undefined }}>{error}</p>
          <button
            type="button"
            className={`${styles.retryButton}`}
            style={{ color: darkMode ? textDark : undefined, justifyItems: 'center' }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : reviewerData.length === 0 ? (
        <div
          className={`${styles.reviewerDataEmpty}`}
          style={{ color: darkMode ? textDark : undefined, justifyItems: 'center' }}
        >
          <div className={`${styles.emptyIcon}`}>📊</div>
          <p style={{ color: darkMode ? textDark : undefined }}>No PR data available</p>
        </div>
      ) : (
        <div className={`${styles.reviewersScrollContainer}`}>
          <ResponsiveContainer width="100%" height={Math.max(400, reviewerData.length * 28)}>
            <CartesianGrid
              vertical
              horizontal={false}
              stroke={axisLineColor}
              strokeDasharray="3 3"
            />
            <BarChart
              layout="vertical"
              data={reviewerData}
              margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
            >
              <XAxis type="number" domain={domain} ticks={ticks} />
              <YAxis dataKey="reviewer" type="category" tick={<CustomYAxisTick />} width={200}>
                <Label
                  value="Top Reviewers"
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: 'middle' }}
                />
              </YAxis>
              <Tooltip
                cursor={{
                  fill: darkMode ? 'rgb(50, 73, 105)' : '#e0e0e0',
                }}
                content={<CustomTooltip />}
              />
              <Legend wrapperStyle={{ color: darkMode ? 'white' : 'black' }} />
              {Object.keys(COLORS).map(key => (
                <Bar key={key} dataKey={key} stackId="a" fill={COLORS[key]}>
                  <LabelList dataKey={key} content={<CustomLabel />} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default ReviewersStackedBarChart;
