import { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';

const SHELL = {
  position: 'relative',
  width: '100%',
  maxWidth: 800,  // responsive cap
  height: 500,    // fixed chart area height (required for Recharts)
  margin: '0 auto',
  padding: 20,
  boxSizing: 'border-box',
  background: '#fff',
  border: '1px solid #eee',
  borderRadius: 8,
};

const LOADER = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  fontSize: 20,
  fontWeight: 'bold',
  pointerEvents: 'none',
};

const MOCK = {
  weekly: [
    { ageGroup: '18 - 21', applicants: 25, change: 10 },
    { ageGroup: '21 - 24', applicants: 60, change: -5 },
    { ageGroup: '24 - 27', applicants: 45, change: 15 },
    { ageGroup: '27 - 30', applicants: 7,  change: -3 },
    { ageGroup: '30 - 33', applicants: 10, change: 0 },
  ],
  monthly: [
    { ageGroup: '18 - 21', applicants: 80, change: 5 },
    { ageGroup: '21 - 24', applicants: 200, change: -2 },
    { ageGroup: '24 - 27', applicants: 150, change: 12 },
    { ageGroup: '27 - 30', applicants: 40, change: -4 },
    { ageGroup: '30 - 33', applicants: 60, change: 3 },
  ],
  yearly: [
    { ageGroup: '18 - 21', applicants: 900, change: 2 },
    { ageGroup: '21 - 24', applicants: 2300, change: -1 },
    { ageGroup: '24 - 27', applicants: 1800, change: 4 },
    { ageGroup: '27 - 30', applicants: 420, change: -2 },
    { ageGroup: '30 - 33', applicants: 600, change: 1 },
  ],
  custom: [
    { ageGroup: '18 - 21', applicants: 10 },
    { ageGroup: '21 - 24', applicants: 15 },
    { ageGroup: '24 - 27', applicants: 9 },
    { ageGroup: '27 - 30', applicants: 3 },
    { ageGroup: '30 - 33', applicants: 4 },
  ],
};

function ApplicantsChart() {
  const [selectedOption, setSelectedOption] = useState('weekly'); // weekly | monthly | yearly | custom
  const [startDate, setStartDate] = useState(null); // Date | null
  const [endDate, setEndDate] = useState(null);     // Date | null
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // label used in tooltip comparison (disable for custom)
  const compareLabel = useMemo(() => {
    if (selectedOption === 'custom') return null;
    if (selectedOption === 'weekly') return 'last week';
    if (selectedOption === 'monthly') return 'last month';
    if (selectedOption === 'yearly') return 'last year';
    return null;
  }, [selectedOption]);

  // mock async fetch
  const fetchData = async () => {
    setLoading(true);
    try {
      // simulate latency
      await new Promise(r => setTimeout(r, 400));
      if (selectedOption === 'custom') {
        setData(MOCK.custom);
      } else {
        setData(MOCK[selectedOption] || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, startDate, endDate]);

  const formatTooltip = (value, _name, props) => {
    const change = props?.payload?.change;
    if (compareLabel && typeof change === 'number') {
      const changeText =
        change > 0
          ? `${change}% more than ${compareLabel}`
          : change < 0
          ? `${Math.abs(change)}% less than ${compareLabel}`
          : `No change from ${compareLabel}`;
      return [`${value} (${changeText})`, 'Applicants'];
    }
    return [`${value}`, 'Applicants'];
  };

  return (
    <div>
      {/* Filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          margin: '20px auto',
          flexWrap: 'wrap',
        }}
      >
        <label htmlFor="timeFilterSelect" style={{ fontWeight: 600 }}>
          Time Filter:
        </label>
        <select
          id="timeFilterSelect"
          value={selectedOption}
          onChange={e => setSelectedOption(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: 14,
          }}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom Dates</option>
        </select>

        {selectedOption === 'custom' && (
          <>
            <DatePicker
              selected={startDate}
              onChange={d => setStartDate(d)}
              placeholderText="Start Date"
              dateFormat="yyyy/MM/dd"
            />
            <span>to</span>
            <DatePicker
              selected={endDate}
              onChange={d => setEndDate(d)}
              placeholderText="End Date"
              dateFormat="yyyy/MM/dd"
            />
          </>
        )}
      </div>

      {/* Title */}
      <h2 style={{ textAlign: 'center', margin: '8px 0 12px' }}>
        Applicants Grouped by Age
      </h2>

      {/* Chart shell */}
      <div style={SHELL}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 40 }} barSize={80}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ageGroup"
              tick={{ fill: '#333', fontWeight: 500 }}
              label={{
                value: 'Age Group',
                position: 'insideBottom',
                offset: -5,
                fill: '#333',
                fontWeight: 600,
              }}
            />
            <YAxis
              tick={{ fill: '#333', fontWeight: 500 }}
              label={{
                value: 'Number of Applicants',
                angle: -90,
                position: 'insideLeft',
                offset: -5,
                fill: '#333',
                fontWeight: 600,
              }}
            />
            <Tooltip formatter={formatTooltip} />
            <Bar dataKey="applicants" fill="#3b82f6">
              <LabelList dataKey="applicants" position="top" fill="#222" fontWeight="600" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Centered loader overlay */}
        {loading && (
          <div style={LOADER}>
            <span>Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicantsChart;
