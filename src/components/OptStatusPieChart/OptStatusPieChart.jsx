import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chart.js/auto';
import './OptStatusPieChart.css';

function LoadingSpinner() {
  return <div className="spinner">Loading...</div>;
}

const statusLabels = [
  'OPT started',
  'CPT (Not Eligible)',
  'Citizen',
  'OPT not yet started',
  'N/A',
];

const segmentColors = [
  '#36A2EB', // OPT started
  '#FF6384', // CPT
  '#4BC0C0', // Citizen
  '#FFCE56', // OPT not yet started
  '#9966FF', // N/A
];

function OptStatusPieChart() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);

  const [chartData, setChartData] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedRole) params.role = selectedRole;

      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4500/api/analytics/opt-status', {
        headers: { Authorization: token },
        params,
      });

      const { breakdown, totalCandidates } = response.data;

      const counts = statusLabels.map(label => {
        const item = breakdown.find(i => i.optStatus === label);
        return item ? item.count : 0;
      });

      setChartData({
        labels: statusLabels,
        datasets: [
          {
            data: counts,
            backgroundColor: segmentColors,
            hoverOffset: 20,
          },
        ],
      });

      setTotalCount(totalCandidates);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleList = async () => {
    try {
      const response = await axios.get('http://localhost:4500/api/roles');
      setRoleOptions(response.data || []);
    } catch {
      setRoleOptions(['Frontend Developer', 'Full Stack Developer', 'DevOps Engineer']); 
    }
  };

  useEffect(() => {
    fetchChartData();
    fetchRoleList();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [startDate, endDate, selectedRole]);

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: context => {
            const count = context.parsed;
            const percentage = ((count / totalCount) * 100).toFixed(1);
            return `${context.label}: ${percentage}% (${count})`;
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 13,
        },
        formatter: (value) => {
          const percent = ((value / totalCount) * 100).toFixed(1);
          return `${percent}%\n(${value})`;
        },
      },
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="chart-container">
      <h2>Breakdown of Candidates by OPT Status</h2>

      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            max={endDate || ''}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={startDate || ''}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {roleOptions.map((role, idx) => (
              <option key={idx} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-area">
        {loading && <LoadingSpinner />}
        {!loading && error && <p className="error-message">{error}</p>}
        {!loading && chartData && (
          <Pie data={chartData} options={options} plugins={[ChartDataLabels]} />
        )}
        {!loading && !chartData && !error && (
          <p className="no-data-available">No data available for the selected filters.</p>
        )}
      </div>
    </div>
  );
}

export default OptStatusPieChart;
