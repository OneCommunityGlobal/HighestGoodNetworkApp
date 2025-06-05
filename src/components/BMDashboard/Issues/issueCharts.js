import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  fetchIssues,
  fetchIssueTypesAndYears,
} from '../../../actions/bmdashboard/issueChartActions';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function IssueChart() {
  const [filters, setFilters] = useState({ issueType: '', year: '' });
  const dispatch = useDispatch();

  const { loading, issues, error, issueTypes, years } = useSelector(state => state.bmissuechart);

  useEffect(() => {
    dispatch(fetchIssues(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch(fetchIssueTypesAndYears());
  }, [dispatch]);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const processData = () => {
    if (!issues) return { labels: [], datasets: [] };

    const groupedData = {};
    issues.forEach(({ _id, count }) => {
      const { issueType, issueYear } = _id;
      if (!groupedData[issueType]) {
        groupedData[issueType] = {};
      }
      groupedData[issueType][issueYear] = count;
    });

    const uniqueIssueTypes = Object.keys(groupedData);
    const uniqueYears = [...new Set(issues.map(({ _id }) => _id.issueYear))];

    const datasets = uniqueYears.map((year, index) => ({
      label: `Year ${year}`,
      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
      data: uniqueIssueTypes.map(type => groupedData[type][year] || 0),
    }));

    return {
      labels: uniqueIssueTypes,
      datasets,
    };
  };

  const renderLoading = () => <p>Loading...</p>;

  const renderError = () => <p>Error: {error}</p>;

  const renderChart = () => (
    <Bar
      data={processData()}
      options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
    />
  );

  return (
    <div>
      <h2>Issues Chart</h2>

      <div>
        {/* Dropdown for Issue Type */}
        <label>Issue Type:</label>
        <select name="issueType" onChange={handleFilterChange} value={filters.issueType}>
          <option value="">All</option>
          {issueTypes &&
            issueTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>

        {/* Dropdown for Year */}
        <label>Year:</label>
        <select name="year" onChange={handleFilterChange} value={filters.year}>
          <option value="">All</option>
          {years &&
            years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
        </select>
      </div>

      {/* Render based on state */}
      {loading && renderLoading()}
      {error && renderError()}
      {!loading && !error && renderChart()}
    </div>
  );
}

export default IssueChart;
