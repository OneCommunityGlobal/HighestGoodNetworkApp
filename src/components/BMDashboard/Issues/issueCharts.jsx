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
            font: { size: 13, weight: '500' },
            usePointStyle: true,
            color: darkMode ? '#e8f0fe' : '#1a1a1a',
            padding: 16,
          },
        },
        title: {
          display: true,
          text: 'Number of Issues Reported by Type',
          font: { size: 17, weight: '600' },
          color: darkMode ? '#e8f0fe' : '#1a1a1a',
          padding: { bottom: 20 },
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: darkMode ? '#2d3748' : '#ffffff',
          titleColor: darkMode ? '#f7fafc' : '#1a1a1a',
          bodyColor: darkMode ? '#f7fafc' : '#1a1a1a',
          borderColor: darkMode ? '#4a5568' : '#e2e8f0',
          borderWidth: 1,
          cornerRadius: 8,
          titleFont: { size: 14, weight: '600' },
          bodyFont: { size: 13, weight: '500' },
          callbacks: {
            label: ctx => {
              const issueType = ctx.label;
              const year = ctx.dataset.label;
              const count = ctx.formattedValue;
              return `${issueType} | ${year}: ${count}`;
            },
          },
          // Enhanced tooltip styling for better accessibility
          displayColors: true,
          titleAlign: 'left',
          bodyAlign: 'left',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Issue Type',
            font: { size: 14, weight: '600' },
            color: darkMode ? '#e8f0fe' : '#1a1a1a',
            padding: { top: 10 },
          },
          grid: {
            display: false,
            color: darkMode ? '#4a5568' : '#e2e8f0',
          },
          barPercentage: 0.9,
          categoryPercentage: 0.8,
          ticks: {
            stepSize: 1,
            color: darkMode ? '#e8f0fe' : '#1a1a1a',
            font: { size: 12, weight: '500' },
            padding: 10,
            maxRotation: 35,
            minRotation: 20,
          },
          border: {
            color: darkMode ? '#4a5568' : '#e2e8f0',
            width: 1,
          },
        },
        y: {
          title: {
            display: true,
            text: 'No. of Issues',
            font: { size: 14, weight: '600' },
            color: darkMode ? '#e8f0fe' : '#1a1a1a',
            padding: { bottom: 10 },
          },
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: darkMode ? '#e8f0fe' : '#1a1a1a',
            font: { size: 12, weight: '500' },
            padding: 8,
          },
          grid: {
            color: darkMode ? '#4a5568' : '#e2e8f0',
            lineWidth: 1,
          },
          border: {
            color: darkMode ? '#4a5568' : '#e2e8f0',
            width: 1,
          },
        },
      },
      // Enhanced interaction for better accessibility
      interaction: {
        intersect: false,
        mode: 'index',
      },
    }),
    [darkMode],
  );

  const selectStyles = useMemo(() => {
    if (!darkMode) return {};
    return {
      control: provided => ({
        ...provided,
        backgroundColor: '#2d3748',
        borderColor: '#4a5568',
        color: '#f7fafc',
        '&:hover': {
          borderColor: '#718096',
        },
        boxShadow: 'none',
        minHeight: '42px',
      }),
      menu: provided => ({
        ...provided,
        backgroundColor: '#2d3748',
        border: '1px solid #4a5568',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
      }),
      input: provided => ({
        ...provided,
        color: '#f7fafc',
      }),
      singleValue: provided => ({
        ...provided,
        color: '#f7fafc',
      }),
      multiValue: provided => ({
        ...provided,
        backgroundColor: '#4a5568',
        borderRadius: '6px',
      }),
      multiValueLabel: provided => ({
        ...provided,
        color: '#f7fafc',
        fontSize: '14px',
        fontWeight: '500',
      }),
      multiValueRemove: provided => ({
        ...provided,
        color: '#cbd5e0',
        '&:hover': {
          backgroundColor: '#e53e3e',
          color: '#ffffff',
        },
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#4a5568' : state.isSelected ? '#2b6cb0' : '#2d3748',
        color: state.isSelected ? '#ffffff' : '#f7fafc',
        '&:hover': {
          backgroundColor: '#4a5568',
          color: '#ffffff',
        },
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
      }),
      placeholder: provided => ({
        ...provided,
        color: '#a0aec0',
        fontSize: '14px',
      }),
      indicatorSeparator: provided => ({
        ...provided,
        backgroundColor: '#4a5568',
      }),
      dropdownIndicator: provided => ({
        ...provided,
        color: '#a0aec0',
        '&:hover': {
          color: '#f7fafc',
        },
      }),
      clearIndicator: provided => ({
        ...provided,
        color: '#a0aec0',
        '&:hover': {
          color: '#e53e3e',
        },
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
              Issue Type ({filters.issueTypes.length} selected):
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <button
                type="button"
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    issueTypes: Object.keys(issues),
                  }))
                }
                style={{ cursor: 'pointer', fontSize: '12px' }}
              >
                Select All
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    issueTypes: [],
                  }))
                }
                style={{ cursor: 'pointer', fontSize: '12px' }}
              >
                Clear All
              </button>
            </div>
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
              Year ({filters.years.length} selected):
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <button
                type="button"
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    years: uniqueYears.map(y => Number(y)), // ✅ FIXED
                  }))
                }
                style={{ cursor: 'pointer', fontSize: '12px' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    years: [],
                  }))
                }
                style={{ cursor: 'pointer', fontSize: '12px' }}
              >
                Clear All
              </button>
            </div>
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
        </div>

        {loading && (
          <p className={`${styles.loadingText} ${darkMode ? styles.loadingTextDark : ''}`}>
            Loading chart data...
          </p>
        )}
        {error && (
          <p className={`${styles.errorText} ${darkMode ? styles.errorTextDark : ''}`}>
            Error: {error}
          </p>
        )}

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
