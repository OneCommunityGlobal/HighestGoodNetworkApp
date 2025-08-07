import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import Select from 'react-select';
import { fetchIssues } from '../../../actions/bmdashboard/issueChartActions';
import 'chart.js/auto'; // Ensures chart.js globals are set up
import './issueChart.css';

function IssueChart() {
  const dispatch = useDispatch();
  const { loading, issues, error } = useSelector(state => state.bmissuechart);

  const [filters, setFilters] = useState({ issueTypes: [], years: [] });

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  useEffect(() => {
    if (issues && Object.keys(issues).length > 0) {
      const allIssueTypes = Object.keys(issues);
      const allYears = [
        ...new Set(
          Object.values(issues)
            .flatMap(issueData => Object.keys(issueData))
            .map(year => parseInt(year, 10)),
        ),
      ].sort((a, b) => a - b);
      setFilters({ issueTypes: allIssueTypes, years: allYears });
    }
  }, [issues]);

  // Dropdown options
  const extractDropdownOptions = () => {
    const issueTypes = [...new Set(Object.keys(issues || {}))].map(issue => ({
      label: issue,
      value: issue,
    }));
    const years = [
      ...new Set(
        Object.values(issues || {})
          .flatMap(issueData => Object.keys(issueData))
          .map(y => parseInt(y, 10)),
      ),
    ]
      .sort((a, b) => a - b)
      .map(year => ({ label: year.toString(), value: year }));
    const addAll = opts => [{ label: 'All', value: 'All' }, ...opts];
    return {
      issueTypes: addAll(issueTypes),
      years: addAll(years),
    };
  };

  const { issueTypes, years } = extractDropdownOptions();
  const uniqueYears = years.filter(y => y.value !== 'All').map(y => y.value);

  // Assign colors for each year
  const generateColor = idx => `hsl(${(idx * 60) % 360}, 70%, 50%)`;
  const yearColorMap = uniqueYears.reduce((acc, year, idx) => {
    acc[year] = generateColor(idx);
    return acc;
  }, {});

  // Filter change handler
  const handleFilterChange = (selected, field) => {
    if (selected.some(option => option.value === 'All')) {
      setFilters({
        ...filters,
        [field]: field === 'issueTypes' ? Object.keys(issues) : uniqueYears,
      });
    } else {
      setFilters({
        ...filters,
        [field]: selected.map(option => option.value),
      });
    }
  };

  // Processed data for chart.js
  const chartData = useMemo(() => {
    if (!issues || Object.keys(issues).length === 0) return { labels: [], datasets: [] };
    const filteredIssueTypes = filters.issueTypes.length ? filters.issueTypes : Object.keys(issues);
    const filteredYears = filters.years.length ? filters.years : uniqueYears;
    // X-axis labels: issue types
    const labels = filteredIssueTypes;
    // Prepare one dataset per year (for grouped bars)
    const datasets = filteredYears.map((year, idx) => ({
      label: year.toString(),
      data: labels.map(issueType => issues[issueType]?.[year] || 0),
      backgroundColor: yearColorMap[year],
      borderWidth: 1,
      borderRadius: 6,
    }));
    return { labels, datasets };
  }, [issues, filters, uniqueYears, yearColorMap]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { size: 13 },
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          text: 'Number of Issues Reported by Type',
          font: { size: 17 },
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Issue Type', font: { size: 14 } },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: 'No. of Issues', font: { size: 14 } },
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: '#efefef' },
        },
      },
      // Group bars by year
      barPercentage: 0.9,
      categoryPercentage: 0.8,
    }),
    [],
  );

  return (
    <div
      className="issue-chart-event-container"
      style={{ minHeight: 500 }}
      role="region"
      aria-label="Grouped bar chart showing number of issues reported by type and year"
    >
      <h2 className="issue-chart-event-title" id="chart-title">
        Issues Chart
      </h2>
      <div>
        <label className="issue-chart-label" htmlFor="issue-type-select">
          Issue Type:
        </label>
        <Select
          inputId="issue-type-select"
          className="issue-chart-select"
          isMulti
          options={issueTypes}
          onChange={selected => handleFilterChange(selected, 'issueTypes')}
          value={issueTypes.filter(option => filters.issueTypes.includes(option.value))}
          aria-label="Filter by issue type"
        />
        <label className="issue-chart-label" htmlFor="year-select">
          Year:
        </label>
        <Select
          inputId="year-select"
          className="issue-chart-select"
          isMulti
          options={years}
          onChange={selected => handleFilterChange(selected, 'years')}
          value={years.filter(option => filters.years.includes(option.value))}
          aria-label="Filter by year"
        />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <div style={{ width: '100%', minHeight: 400, height: 420 }}>
          <Bar data={chartData} options={chartOptions} aria-labelledby="chart-title" />
        </div>
      )}
    </div>
  );
}

export default IssueChart;
