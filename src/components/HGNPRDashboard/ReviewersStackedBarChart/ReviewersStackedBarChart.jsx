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
import './ReviewersStackedBarChart.css';

// Dummy data
const MOCK_TEAMS = ['All', 'Alpha', 'Beta', 'Gamma', 'Delta'];

const MOCK_DATA = [
  {
    reviewer: 'Anoushka - Alpha',
    isMentor: false,
    team: 'Alpha',
    counts: {
      Exceptional: 4,
      Sufficient: 2,
      'Needs Changes': 1,
      'Did Not Review': 0,
    },
  },
  {
    reviewer: 'Neerharika - Delta',
    isMentor: true,
    team: 'Delta',
    counts: {
      Exceptional: 10,
      Sufficient: 9,
      'Needs Changes': 7,
      'Did Not Review': 10,
    },
  },
  {
    reviewer: 'Reddy - Delta',
    isMentor: true,
    team: 'Delta',
    counts: {
      Exceptional: 9,
      Sufficient: 10,
      'Needs Changes': 8,
      'Did Not Review': 5,
    },
  },
  {
    reviewer: 'Mrinalini - Gamma',
    isMentor: false,
    team: 'Gamma',
    counts: {
      Exceptional: 8,
      Sufficient: 3,
      'Needs Changes': 6,
      'Did Not Review': 1,
    },
  },
  // Add more if needed
];

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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-title">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="tooltip-entry">
          <span className="tooltip-label" style={{ color: entry.color }}>
            {entry.name}:
          </span>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function ReviewersStackedBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [teamFilter, setTeamFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('Last Week');
  const [sortFilter, setSortFilter] = useState('Ascending');
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
        let filtered = [...MOCK_DATA];

        if (teamFilter !== 'All') {
          filtered = filtered.filter(item => item.team === teamFilter);
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
    <div className={`reviewers-chart-container ${darkMode ? 'dark-mode' : ''}`}>
      <h3>PR Quality by Reviewers</h3>

      <div className="reviewers-filters-bar">
        <div>
          <label className={`reviewers-label ${darkMode ? 'dark-mode' : ''}`}>Team:</label>
          <Select
            options={teams.map(team => ({ label: team, value: team }))}
            value={{ label: teamFilter, value: teamFilter }}
            onChange={selected => setTeamFilter(selected.value)}
            className="reviewers-select-container"
            classNamePrefix="reviewers-select"
          />
        </div>
        <div>
          <label className={`reviewers-label ${darkMode ? 'dark-mode' : ''}`}>Sort:</label>
          <Select
            options={[
              { label: 'Ascending', value: 'Ascending' },
              { label: 'Descending', value: 'Descending' },
            ]}
            value={{ label: sortFilter, value: sortFilter }}
            onChange={selected => setSortFilter(selected.value)}
            className="reviewers-select-container"
            classNamePrefix="reviewers-select"
          />
        </div>
        <div>
          <label className={`reviewers-label ${darkMode ? 'dark-mode' : ''}`}>Duration:</label>
          <Select
            options={[
              { label: 'Last Week', value: 'Last Week' },
              { label: 'Last 2 weeks', value: 'Last 2 weeks' },
              { label: 'Last Month', value: 'Last Month' },
              { label: 'All Time', value: 'All Time' },
            ]}
            value={{ label: durationFilter, value: durationFilter }}
            onChange={selected => setDurationFilter(selected.value)}
            className="reviewers-select-container"
            classNamePrefix="reviewers-select"
          />
        </div>
      </div>

      {loading ? (
        <div
          className="reviewer-stackbar-loading"
          style={{ color: darkMode ? textDark : undefined, justifyItems: 'center' }}
        >
          <div
            className="loading-spinner"
            style={darkMode ? { borderTop: '4px solid #f8fafc' } : {}}
          />
          <p style={{ color: darkMode ? textDark : undefined, justifyItems: 'center' }}>
            Loading Reviewers data...
          </p>
        </div>
      ) : error ? (
        <div
          className="reviewers-stackbar-error"
          style={{ color: darkMode ? textDark : undefined, justifyItems: 'center' }}
        >
          <div className="error-icon">⚠️</div>
          <p style={{ color: darkMode ? textDark : undefined }}>{error}</p>
          <button
            type="button"
            className="retry-button"
            style={{ color: darkMode ? textDark : undefined, justifyItems: 'center' }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : reviewerData.length === 0 ? (
        <div
          className="reviewer-data-empty"
          style={{ color: darkMode ? textDark : undefined, justifyItems: 'center' }}
        >
          <div className="empty-icon">📊</div>
          <p style={{ color: darkMode ? textDark : undefined }}>No PR data available</p>
        </div>
      ) : (
        <div className="reviewers-scroll-container">
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
              <Legend wrapperStyle={{ color: darkMode ? 'white' : 'black' }}/>
              {Object.keys(COLORS).map(key => (
                <Bar key={key} dataKey={key} stackId="a" fill={COLORS[key]}>
                  <LabelList dataKey={key} position="insideRight" fill="black" />
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
