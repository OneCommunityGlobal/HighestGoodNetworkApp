import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import Select from 'react-select';
import { fetchIssues } from '../../../actions/bmdashboard/issueChartActions';
import 'chart.js/auto';
import styles from './issueChart.module.css';

function IssueChart() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
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

  const generateColor = idx => `hsl(${(idx * 60) % 360}, 70%, 50%)`;
  const yearColorMap = uniqueYears.reduce((acc, year, idx) => {
    acc[year] = generateColor(idx);
    return acc;
  }, {});

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

  const handleClearFilters = () => {
    setFilters({
      issueTypes: [],
      years: [],
    });
  };

  const chartData = useMemo(() => {
    if (!issues || Object.keys(issues).length === 0) return { labels: [], datasets: [] };
    const filteredIssueTypes = filters.issueTypes.length ? filters.issueTypes : Object.keys(issues);
    const filteredYears = filters.years.length ? filters.years : uniqueYears;
    const labels = filteredIssueTypes;

    const datasets = filteredYears.map(year => ({
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
            color: darkMode ? '#cfd7e3' : '#232323',
          },
        },
        title: {
          display: true,
          text: 'Number of Issues Reported by Type',
          font: { size: 17 },
          color: darkMode ? '#cfd7e3' : '#232323',
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: darkMode ? '#232323' : '#fff',
          titleColor: darkMode ? '#fff' : '#232323',
          bodyColor: darkMode ? '#fff' : '#232323',
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Issue Type',
            font: { size: 14 },
            color: darkMode ? '#cfd7e3' : '#232323',
          },
          grid: { display: false },
          barPercentage: 0.9,
          categoryPercentage: 0.8,
          ticks: { stepSize: 1, color: darkMode ? '#cfd7e3' : '#232323' },
        },
        y: {
          title: {
            display: true,
            text: 'No. of Issues',
            font: { size: 14 },
            color: darkMode ? '#cfd7e3' : '#232323',
          },
          beginAtZero: true,
          ticks: { stepSize: 1, color: darkMode ? '#cfd7e3' : '#232323' },
          grid: { color: darkMode ? '#353535' : '#efefef' },
        },
      },
    }),
    [darkMode],
  );

  const selectStyles = useMemo(() => {
    if (!darkMode) return {};
    return {
      control: provided => ({
        ...provided,
        backgroundColor: '#22272e',
        borderColor: '#3d444d',
        color: '#cfd7e3',
      }),
      menu: provided => ({
        ...provided,
        backgroundColor: '#1e1e1e',
        color: '#cfd7e3',
      }),
      input: provided => ({
        ...provided,
        color: '#cfd7e3',
      }),
      singleValue: provided => ({
        ...provided,
        color: '#cfd7e3',
      }),
      multiValue: provided => ({
        ...provided,
        backgroundColor: '#3d444d',
      }),
      multiValueLabel: provided => ({
        ...provided,
        color: '#cfd7e3',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#4caf50' : '#1e1e1e',
        color: state.isFocused ? '#fff' : '#cfd7e3',
      }),
      placeholder: provided => ({
        ...provided,
        color: '#aab1bf',
      }),
    };
  }, [darkMode]);

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light dark' : ''}
      style={{ minHeight: '100vh' }}
    >
      <div
        className={`${styles.issueChartEventContainer} ${
          darkMode ? styles.issueChartEventContainerDark : ''
        }`}
        role="region"
        aria-label="Issues bar chart"
      >
        <h2
          className={`${styles.issueChartEventTitle} ${
            darkMode ? styles.issueChartEventTitleDark : ''
          }`}
        >
          Issues Chart
        </h2>
        <div
          className={styles.selectContainer}
          style={{ justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}
        >
          <div style={{ minWidth: 200 }}>
            <label
              htmlFor="issue-type-select"
              className={`${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`}
            >
              Issue Type:
            </label>
            <Select
              inputId="issue-type-select"
              className={`${styles.issueChartSelect} ${
                darkMode ? styles.issueChartSelectDark : ''
              }`}
              isMulti
              options={issueTypes}
              onChange={selected => handleFilterChange(selected, 'issueTypes')}
              value={issueTypes.filter(option => filters.issueTypes.includes(option.value))}
              styles={selectStyles}
              aria-label="Filter issues by type"
              placeholder="Select issue types"
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <label
              htmlFor="year-select"
              className={`${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`}
            >
              Year:
            </label>
            <Select
              inputId="year-select"
              className={`${styles.issueChartSelect} ${
                darkMode ? styles.issueChartSelectDark : ''
              }`}
              isMulti
              options={years}
              onChange={selected => handleFilterChange(selected, 'years')}
              value={years.filter(option => filters.years.includes(option.value))}
              styles={selectStyles}
              aria-label="Filter issues by year"
              placeholder="Select years"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClearFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007FFF',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
                height: '38px',
              }}
              aria-label="Clear all issue chart filters"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}

        {!loading && !error && (
          <div
            className={`${styles.chartWrapper} ${darkMode ? styles.chartWrapperDark : ''}`}
            style={{ minHeight: 400 }}
          >
            <Bar data={chartData} options={chartOptions} aria-labelledby="chart-title" />
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueChart;
