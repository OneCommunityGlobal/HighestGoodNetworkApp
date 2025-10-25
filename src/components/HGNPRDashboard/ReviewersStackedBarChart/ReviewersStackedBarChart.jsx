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

// Custom tick components for Y-axis
function CustomYAxisTick({ x, y, payload, data, darkMode }) {
  const currentReviewer = payload.value;
  // This is now reliable because data is passed as a prop
  const isMentor = data.find(d => d.reviewer === currentReviewer)?.isMentor;
  const axisColor = darkMode ? 'white' : 'black';

  return (
    <text
      x={x - 5}
      y={y + 4}
      textAnchor="end"
      fill={isMentor ? 'red' : axisColor}
      fontWeight={isMentor ? 'bold' : 'normal'}
    >
      {payload.value}
    </text>
  );
}

// Custom X-axis tick component
function CustomXAxisTick({ x, y, payload, darkMode }) {
  const textColor = darkMode ? 'white' : 'black';
  return (
    <text x={x} y={y} dy={16} fill={textColor} textAnchor="middle">
      {payload.value}
    </text>
  );
}

// Custom X-axis tick component to generate ticks
function CustomXAxisTicks(data) {
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
function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={`${styles.customTooltip} ${darkMode ? styles.darkTooltip : ''}`}>
      <p className={`${styles.tooltipTitle}`}>{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className={`${styles.tooltipEntry}`}>
          <span className={`${styles.tooltipLabel}`} style={{ color: entry.color }}>
            {entry.name}:
          </span>
          {/* Access the value correctly from the payload entry */}
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

  // Set the fill color to white always
  const textColor = '#fff';

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill={textColor}
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

// Custom legend formatter
function LegendFormatter(value, entry, darkMode) {
  const textColor = darkMode ? 'white' : 'black';
  return <span style={{ color: textColor }}>{value}</span>;
}

function ReviewersStackedBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [teamFilter, setTeamFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState({ label: 'Last Week', value: 'Last Week' });
  const [sortFilter, setSortFilter] = useState('Ascending');
  const { start: filterStartDate, end: filterEndDate } = getDateRange(durationFilter.value);
  const [transformedData, setTransformedData] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data filtering logic
  const filterByTeam = data => {
    if (teamFilter === 'All') return data;
    return data.filter(item => item.team === teamFilter);
  };

  const filterByDuration = data => {
    if (durationFilter.value === 'All Time') return data;
    return data.filter(item => {
      const prDate = new Date(item.prSubmittedDate);
      return prDate >= filterStartDate && prDate <= filterEndDate;
    });
  };

  const sortByTotal = data => {
    return data.sort((a, b) => {
      const totalA = a.Exceptional + a.Sufficient + a['Needs Changes'] + a['Did Not Review'];
      const totalB = b.Exceptional + b.Sufficient + b['Needs Changes'] + b['Did Not Review'];
      return sortFilter === 'Ascending' ? totalA - totalB : totalB - totalA;
    });
  };

  const processData = () => {
    let filtered = [...MOCK_REVIEWERS_DATA];
    filtered = filterByTeam(filtered);
    filtered = filterByDuration(filtered);
    const transformed = transformData(filtered);
    return sortByTotal(transformed);
  };

  // Simulated API call
  const fetchData = () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const processedData = processData();
        setTransformedData(processedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch reviewer data.');
        setLoading(false);
      }
    }, 1001);
  };

  const { domain, ticks } = CustomXAxisTicks(transformedData);

  useEffect(() => {
    setTeams(MOCK_TEAMS);
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [teamFilter, durationFilter, sortFilter]);

  return (
    <div className={`${styles.reviewersChartContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h4 className={darkMode ? styles.darkMode : ''}>PR Quality by Reviewers</h4>
      <FilterBar
        teams={teams}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
        sortFilter={sortFilter}
        setSortFilter={setSortFilter}
        durationFilter={durationFilter}
        setDurationFilter={setDurationFilter}
      />
      <ChartContent
        loading={loading}
        error={error}
        transformedData={transformedData}
        darkMode={darkMode}
        domain={domain}
        ticks={ticks}
      />
    </div>
  );
}

// Separate FilterBar component
function FilterBar({
  teams,
  teamFilter,
  setTeamFilter,
  sortFilter,
  setSortFilter,
  durationFilter,
  setDurationFilter,
}) {
  return (
    <div className={`${styles.reviewersFiltersBar}`}>
      <TeamFilter teams={teams} teamFilter={teamFilter} setTeamFilter={setTeamFilter} />
      <SortFilter sortFilter={sortFilter} setSortFilter={setSortFilter} />
      <DurationFilter durationFilter={durationFilter} setDurationFilter={setDurationFilter} />
    </div>
  );
}

// Individual filter components
function TeamFilter({ teams, teamFilter, setTeamFilter }) {
  return (
    <div>
      <label htmlFor="teamSelect" className={`${styles.reviewersLabel}`}>
        Team:
      </label>
      <Select
        id="teamSelect"
        options={teams.map(team => ({ label: team, value: team }))}
        value={{ label: teamFilter, value: teamFilter }}
        onChange={selected => setTeamFilter(selected.value)}
        className={`${styles.reviewersSelectContainer}`}
        classNamePrefix="reviewersSelect"
      />
    </div>
  );
}

function SortFilter({ sortFilter, setSortFilter }) {
  return (
    <div>
      <label htmlFor="sortSelect" className={`${styles.reviewersLabel}`}>
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
        className={`${styles.reviewersSelectContainer}`}
        classNamePrefix="reviewersSelect"
      />
    </div>
  );
}

function DurationFilter({ durationFilter, setDurationFilter }) {
  const durationOptions = [
    { label: 'Last Week', value: 'Last Week' },
    { label: 'Last 3 weeks', value: 'Last 2 weeks' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'All Time', value: 'All Time' },
  ];

  return (
    <div>
      <label htmlFor="durationSelect" className={`${styles.reviewersLabel}`}>
        Duration:
      </label>
      <Select
        id="durationSelect"
        options={durationOptions}
        value={{ label: durationFilter.label, value: durationFilter.value }}
        onChange={selected => setDurationFilter(selected)}
        className={`${styles.reviewersSelectContainer}`}
        classNamePrefix="reviewersSelect"
      />
    </div>
  );
}

// Chart content with different states
function ChartContent({ loading, error, transformedData, darkMode, domain, ticks }) {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (transformedData.length === 0) {
    return <EmptyState />;
  }

  return (
    <ChartDisplay
      transformedData={transformedData}
      darkMode={darkMode}
      domain={domain}
      ticks={ticks}
    />
  );
}

function LoadingState() {
  return (
    <div className={`${styles.reviewerStackbarLoading}`}>
      <div className={`${styles.loadingSpinner}`} />
      <p>Loading Reviewers data...</p>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className={`${styles.reviewersStackbarError}`}>
      <div className={`${styles.errorIcon}`}>⚠️</div>
      <p>{error}</p>
      <button
        type="button"
        className={`${styles.retryButton}`}
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={`${styles.reviewerDataEmpty}`}>
      <div className={`${styles.emptyIcon}`}>📊</div>
      <p>No PR data available</p>
    </div>
  );
}

function ChartDisplay({ transformedData, darkMode, domain, ticks }) {
  return (
    <div className={`${styles.reviewersScrollContainer}`}>
      <ResponsiveContainer width="101%" height={Math.max(400, transformedData.length * 28)}>
        <CartesianGrid vertical horizontal={false} className={`${styles.chartGrid}`} />
        <BarChart
          layout="vertical"
          data={transformedData}
          margin={{ top: 21, right: 30, left: 200, bottom: 20 }}
        >
          <XAxis
            type="number"
            domain={domain}
            ticks={ticks}
            stroke={darkMode ? 'white' : 'black'}
            tick={<CustomXAxisTick darkMode={darkMode} />}
          />
          <YAxis
            dataKey="reviewer"
            type="category"
            tick={<CustomYAxisTick data={transformedData} darkMode={darkMode} />}
            width={201}
            stroke={darkMode ? 'white' : 'black'}
          >
            <Label
              value="Top Reviewers"
              angle={-89}
              position="insideLeft"
              style={{ textAnchor: 'middle', fill: darkMode ? 'white' : 'black' }}
            />
          </YAxis>
          <Tooltip
            cursor={{ className: `${styles.chartCursor}` }}
            content={<CustomTooltip darkMode={darkMode} />}
          />
          <Legend formatter={(value, entry) => LegendFormatter(value, entry, darkMode)} />
          {Object.keys(COLORS).map(key => (
            <Bar key={key} dataKey={key} stackId="a" fill={COLORS[key]}>
              <LabelList dataKey={key} content={<CustomLabel />} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ReviewersStackedBarChart;
