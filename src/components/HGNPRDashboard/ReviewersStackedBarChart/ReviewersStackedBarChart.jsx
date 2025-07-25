import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
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

const CustomYAxisTick = ({ x, y, payload }) => {
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
};

let transformed = [];

const ReviewersStackedBarChart = () => {
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

  useEffect(() => {
    setTeams(MOCK_TEAMS);
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [teamFilter, durationFilter, sortFilter]);

  return (
    <div className="chart-container">
      <h3>PR Quality by Reviewers</h3>

      <div className="filters-bar">
        <div>
          <label>Team:</label>
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
            {teams.map(team => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Sort:</label>
          <select value={sortFilter} onChange={e => setSortFilter(e.target.value)}>
            <option value="Ascending">Ascending</option>
            <option value="Descending">Descending</option>
          </select>
        </div>
        <div>
          <label>Duration:</label>
          <select value={durationFilter} onChange={e => setDurationFilter(e.target.value)}>
            <option value="Last Week">Last Week</option>
            <option value="Last 2 weeks">Last 2 weeks</option>
            <option value="Last Month">Last Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div className="scroll-container">
          <ResponsiveContainer width={1200} height={600}>
            <BarChart
              layout="vertical"
              data={reviewerData}
              margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="reviewer" type="category" tick={<CustomYAxisTick />} width={200} />
              <Tooltip />
              <Legend />
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
};

export default ReviewersStackedBarChart;
