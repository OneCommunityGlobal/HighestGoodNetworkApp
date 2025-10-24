import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './ExperienceDonutChart.css';

function LoadingSpinner() {
  return <div className="spinner">Loading...</div>;
}

function ExperienceDonutChart() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const segmentColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];
  const experienceLabels = ['0-1 years', '1-3 years', '3-5 years', '5+ years'];

  // Helper to fetch data with given filters
  const fetchDataWithFilters = async ({
    startDate: filterStartDate,
    endDate: filterEndDate,
    roles: filterRoles,
  }) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      const url = `${process.env.REACT_APP_APIENDPOINT}/experience-breakdown`;
      const params = {};

      if (filterStartDate && filterEndDate) {
        params.startDate = filterStartDate;
        params.endDate = filterEndDate;
      } else if (filterRoles && filterRoles.length > 0) {
        params.roles = filterRoles.join(',');
      }

      // const response = await axios.get(url, { params });
      const response = await axios.get(url, {
        headers: { Authorization: token },
        params,
      });

      const { data } = response;

      if (!data || data.length === 0) {
        setChartData(null);
        setLoading(false);
        return;
      }

      const counts = experienceLabels.map(label => {
        const found = data.find(d => d.experience === label);
        return found ? found.count : 0;
      });

      const totalCount = counts.reduce((a, b) => a + b, 0);

      const chart = {
        labels: experienceLabels,
        datasets: [
          {
            data: counts,
            backgroundColor: segmentColors,
            hoverOffset: 20,
          },
        ],
      };

      setChartData({ chart, totalCount });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching data.');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data with no filters
  useEffect(() => {
    fetchDataWithFilters({ startDate: '', endDate: '', roles: [] });
  }, []);

  // Handle Roles change: clear dates, fetch by roles
  const handleRoleChange = e => {
    const newRoles = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedRoles(newRoles);

    // Clear dates
    if (startDate !== '' || endDate !== '') {
      setStartDate('');
      setEndDate('');
    }

    fetchDataWithFilters({ roles: newRoles, startDate: '', endDate: '' });
  };

  // Handle Start Date change: clear roles, fetch if endDate present
  const handleStartDateChange = e => {
    const newStart = e.target.value;
    setStartDate(newStart);

    if (selectedRoles.length > 0) {
      setSelectedRoles([]);
    }

    if (newStart && endDate) {
      fetchDataWithFilters({ startDate: newStart, endDate, roles: [] });
    }
  };

  // Handle End Date change: clear roles, fetch if startDate present
  const handleEndDateChange = e => {
    const newEnd = e.target.value;
    setEndDate(newEnd);

    if (selectedRoles.length > 0) {
      setSelectedRoles([]);
    }

    if (startDate && newEnd) {
      fetchDataWithFilters({ startDate, endDate: newEnd, roles: [] });
    }
  };

  // Optionally, you can keep the apply button for manual fetch or remove it since we fetch on change now

  const options = chartData
    ? {
        cutout: '70%',
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: context => {
                const count = context.parsed || 0;
                const total = chartData.totalCount || 1;
                const percentage = ((count / total) * 100).toFixed(1);
                return `${context.label}: ${percentage}% (${count})`;
              },
            },
          },
          datalabels: {
            color: '#fff',
            font: {
              weight: 'bold',
              size: 14,
            },
            formatter: value => {
              const count = value;
              const total = chartData.totalCount || 1;
              const percentage = ((count / total) * 100).toFixed(1);
              return `${percentage}%\n(${count})`;
            },
          },
          legend: {
            display: false,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    : {};

  return (
    <div className="chart-container">
      <h2>Breakdown of Applicants by Experience</h2>

      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            max={endDate || ''}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate || ''}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="roles">Roles</label>
          <select id="roles" multiple value={selectedRoles} onChange={handleRoleChange}>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Junior Developer">Junior Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
          </select>
        </div>

        {/* Optional: Remove if not needed */}
        {/* <button type="button" onClick={() => fetchDataWithFilters({ startDate, endDate, roles: selectedRoles })}>
          Apply Filters
        </button> */}
      </div>

      <div className="chart-area" style={{ minHeight: '320px', position: 'relative' }}>
        {loading && <LoadingSpinner />}
        {!loading && error && <p className="error-message">{error}</p>}
        {!loading && !error && !chartData && <p className="no-data-available">No Data Available</p>}
        {!loading && chartData && (
          <Pie data={chartData.chart} options={options} plugins={[ChartDataLabels]} />
        )}
      </div>
    </div>
  );
}

export default ExperienceDonutChart;
