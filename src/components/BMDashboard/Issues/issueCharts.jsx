import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import Select from 'react-select';
import { fetchIssues } from '../../../actions/bmdashboard/issueChartActions';
import 'chart.js/auto';
import { Chart as ChartJS } from 'chart.js';
import styles from './issueChart.module.css';

function IssueChart() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { loading, issues, error } = useSelector(state => state.bmissuechart);

  const [filters, setFilters] = useState({ issueTypes: [], years: [] });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      borderColor: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
      borderWidth: 1.5,
      borderRadius: 6,
    }));

    return { labels, datasets };
  }, [issues, filters, uniqueYears, yearColorMap, darkMode]);

  const xAxisBackgroundPlugin = darkMode => ({
    id: 'xAxisBackground',
    beforeDraw: chart => {
      const { ctx, chartArea, scales } = chart;
      const xScale = scales.x;
      if (!xScale) return;

      ctx.save();

      const ticks = xScale.ticks.length;

      xScale.ticks.forEach((_, index) => {
        // Shade ONLY alternate labels: one shaded, one normal
        if (index % 2 !== 0) return;

        const center = xScale.getPixelForTick(index);

        const left = index === 0 ? xScale.left : (xScale.getPixelForTick(index - 1) + center) / 2;

        const right =
          index === ticks - 1 ? xScale.right : (center + xScale.getPixelForTick(index + 1)) / 2;

        ctx.fillStyle = darkMode
          ? 'rgba(255,255,255,0.05)' // dark mode band
          : 'rgba(0,0,0,0.08)'; // light mode band (more visible)

        ctx.fillRect(left, chartArea.top, right - left, chartArea.bottom - chartArea.top);
      });

      ctx.restore();
    },
  });

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: 56,
        },
      },
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
        datalabels: {
          display: false,
        },
        xAxisBackground: true,
      },
      scales: {
        x: {
          offset: true,
          title: {
            display: true,
            text: 'Issue Type',
            font: { size: 14 },
            color: darkMode ? '#cfd7e3' : '#232323',
          },
          grid: { display: false },
          barPercentage: 0.9,
          categoryPercentage: 0.8,
          ticks: {
            color: darkMode ? '#e8f0fe' : '#1a1a1a',
            stepSize: 1,
            padding: 8,
            align: 'center',
            autoSkip: false,
            maxRotation: isMobile ? 90 : 0,
            minRotation: isMobile ? 90 : 0,
            font: { size: 12, weight: '500' },
            callback: (value, index, ticks) => {
              const label = chartData?.labels?.[index] ?? ticks?.[index]?.label ?? String(value);
              if (isMobile) return label;

              const maxCharsPerLine = 12;
              if (label.length <= maxCharsPerLine) return label;

              const words = label.split(' ');
              const lines = [];
              let currentLine = '';

              words.forEach(word => {
                if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                  currentLine = (currentLine + ' ' + word).trim();
                } else {
                  lines.push(currentLine);
                  currentLine = word;
                }
              });

              if (currentLine) lines.push(currentLine);
              return lines;
            },
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
            font: { size: 14 },
            color: darkMode ? '#cfd7e3' : '#232323',
          },
          beginAtZero: true,
          ticks: { stepSize: 1, color: darkMode ? '#cfd7e3' : '#232323' },
          grid: { color: darkMode ? '#353535' : '#efefef' },
        },
      },
    }),
    [darkMode, isMobile],
  );

  const chartPlugins = useMemo(() => [xAxisBackgroundPlugin(darkMode)], [darkMode]);

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
            className={`${styles.issueChartYearGroup} ${styles.issueTypeGroup} ${
              darkMode ? styles.issueChartYearGroupDark : ''
            }`}
          >
            <div
              className={`${styles.chartWrapper} ${darkMode ? styles.chartWrapperDark : ''}`}
              style={{ minHeight: 420, paddingBottom: 12 }}
            >
              <Bar
                data={chartData}
                options={chartOptions}
                plugins={chartPlugins}
                aria-labelledby="chart-title"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueChart;
