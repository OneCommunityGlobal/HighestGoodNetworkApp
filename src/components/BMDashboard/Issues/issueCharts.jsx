import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import Select, { components } from 'react-select';
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
  const stripNumericSuffix = value => {
    const str = String(value);
    let end = str.length;
    while (end > 0) {
      const code = str.charCodeAt(end - 1);
      if (code >= 48 && code <= 57) {
        end -= 1;
      } else {
        break;
      }
    }
    const base = str.slice(0, end).trim();
    return base || str;
  };

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
    const rawIssueTypes = [...new Set(Object.keys(issues || {}))];
    const issueTypeGroups = rawIssueTypes.reduce((acc, name) => {
      const base = stripNumericSuffix(name);
      if (!acc[base]) acc[base] = [];
      acc[base].push(name);
      return acc;
    }, {});

    const groupedIssueTypes = Object.entries(issueTypeGroups).map(([base, names]) => {
      const options = names
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map(issue => ({ label: issue, value: issue }));
      return names.length > 1
        ? {
            label: `${base} (e.g., ${names.slice(0, 3).join(', ')}${
              names.length > 3 ? ', …' : ''
            })`,
            options,
          }
        : options[0];
    });

    const issueTypes = groupedIssueTypes;

    const years = [
      ...new Set(
        Object.values(issues || {})
          .flatMap(issueData => Object.keys(issueData))
          .map(y => parseInt(y, 10)),
      ),
    ]
      .sort((a, b) => a - b)
      .map(year => ({ label: year.toString(), value: year }));

    return {
      issueTypes,
      years,
    };
  };

  const { issueTypes, years } = extractDropdownOptions();
  const flattenOptions = options =>
    options.flatMap(option => (option.options ? option.options : option));
  const flatIssueTypeOptions = flattenOptions(issueTypes);
  const uniqueYears = years.filter(y => y.value !== 'All').map(y => y.value);

  const generateColor = idx => `hsl(${(idx * 60) % 360}, 70%, 50%)`;
  const yearColorMap = uniqueYears.reduce((acc, year, idx) => {
    acc[year] = generateColor(idx);
    return acc;
  }, {});

  const handleFilterChange = (selected, field) => {
    const cleaned = selected
      .filter(option => option?.value != null)
      .map(option => option.value)
      .filter(value => {
        const lower = String(value).toLowerCase();
        return lower !== '__all__' && lower !== 'select all' && lower !== 'all';
      });
    setFilters({
      ...filters,
      [field]: cleaned,
    });
  };

  const handleSelectAll = field => {
    setFilters({
      ...filters,
      [field]: field === 'issueTypes' ? Object.keys(issues || {}) : uniqueYears,
    });
  };

  const handleClearField = field => {
    setFilters({
      ...filters,
      [field]: [],
    });
  };

  const handleClearFilters = () => {
    setFilters({
      issueTypes: [],
      years: [],
    });
  };

  const chartData = useMemo(() => {
    if (!issues || Object.keys(issues).length === 0) return { labels: [], datasets: [] };

    const getBase = name => stripNumericSuffix(name);
    const issueTypeKeys = Object.keys(issues || {}).sort((a, b) => {
      const aLower = String(a).toLowerCase();
      const bLower = String(b).toLowerCase();
      const aIsNull = aLower === 'null';
      const bIsNull = bLower === 'null';
      if (aIsNull && !bIsNull) return 1;
      if (!aIsNull && bIsNull) return -1;
      return aLower.localeCompare(bLower, undefined, { numeric: true });
    });
    const groupMap = issueTypeKeys.reduce((acc, type) => {
      const base = getBase(type);
      if (!acc[base]) acc[base] = [];
      acc[base].push(type);
      return acc;
    }, {});

    const selectedTypes = filters.issueTypes.length ? filters.issueTypes : issueTypeKeys;
    const selectedTypeSet = new Set(selectedTypes.map(t => String(t).toLowerCase()));
    const selectedBases = [...new Set(selectedTypes.map(getBase))].sort((a, b) => {
      const aLower = String(a).toLowerCase();
      const bLower = String(b).toLowerCase();
      const aIsNull = aLower === 'null';
      const bIsNull = bLower === 'null';
      if (aIsNull && !bIsNull) return 1;
      if (!aIsNull && bIsNull) return -1;
      return aLower.localeCompare(bLower, undefined, { numeric: true });
    });
    const filteredYears = filters.years.length ? filters.years : uniqueYears;

    const labels = selectedBases;
    const datasets = filteredYears.map(year => ({
      label: year.toString(),
      data: labels.map(base =>
        (groupMap[base] || [])
          .filter(type => selectedTypeSet.has(String(type).toLowerCase()))
          .reduce((sum, type) => sum + (issues[type]?.[year] || 0), 0),
      ),
      backgroundColor: yearColorMap[year],
      borderColor: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
      borderWidth: 1.5,
      borderRadius: 6,
    }));

    return { labels, datasets };
  }, [issues, filters, uniqueYears, yearColorMap, darkMode]);

  const chartAnalysis = useMemo(() => {
    const labels = chartData?.labels ?? [];
    const datasets = chartData?.datasets ?? [];

    const totalByYear = {};
    datasets.forEach(ds => {
      const year = ds.label;
      const total = (ds.data || []).reduce((sum, v) => sum + (Number(v) || 0), 0);
      totalByYear[year] = total;
    });

    const totalsByIssueType = labels.map((_, idx) =>
      datasets.reduce((sum, ds) => sum + (Number(ds.data?.[idx]) || 0), 0),
    );

    const topIssueTypeIndex =
      totalsByIssueType.length > 0
        ? totalsByIssueType.reduce(
            (bestIdx, val, idx, arr) => (val > arr[bestIdx] ? idx : bestIdx),
            0,
          )
        : -1;

    let peak = { value: -Infinity, year: null, issueType: null };
    datasets.forEach(ds => {
      (ds.data || []).forEach((v, idx) => {
        const value = Number(v) || 0;
        if (value > peak.value) {
          peak = { value, year: ds.label, issueType: labels[idx] ?? null };
        }
      });
    });

    let insightText = '';
    if (peak.value > 0 && peak.year && peak.issueType) {
      insightText = `${peak.issueType} issues peak in ${peak.year} (${peak.value}).`;
    } else {
      insightText = `No issues found for the selected filters.`;
    }

    return { totalByYear, topIssueTypeIndex, insightText };
  }, [chartData]);

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
          onClick: (e, legendItem, legend) => {
            const index = legendItem.datasetIndex;
            const chart = legend.chart;
            const visible = chart.isDatasetVisible(index);
            chart.setDatasetVisibility(index, !visible);
            chart.update();
          },
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
          mode: 'nearest',
          intersect: true,
          backgroundColor: darkMode ? '#232323' : '#fff',
          titleColor: darkMode ? '#fff' : '#232323',
          bodyColor: darkMode ? '#fff' : '#232323',
          callbacks: {
            title: items => {
              return items?.[0]?.label ?? '';
            },
            label: ctx => {
              const year = ctx.dataset.label;
              const value = Number(ctx.raw) || 0;
              const total = chartAnalysis.totalByYear?.[year] ?? 0;
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

              return `${year}: ${value} (${pct}%)`;
            },
          },
        },
        datalabels: {
          display: false,
        },
        xAxisBackground: true,
      },
      datasets: {
        bar: {
          backgroundColor: ctx => {
            const idx = ctx.dataIndex;
            const ds = ctx.dataset;
            const base = ds.backgroundColor;

            if (chartAnalysis.topIssueTypeIndex < 0) return base;

            const isTop = idx === chartAnalysis.topIssueTypeIndex;

            if (typeof base === 'string' && base.startsWith('hsl(')) {
              const alpha = isTop ? 0.9 : 0.55;
              return base.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
            }

            return base;
          },
          borderWidth: ctx => (ctx.dataIndex === chartAnalysis.topIssueTypeIndex ? 2 : 1.5),
        },
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
            padding: 10,
            align: 'center',
            autoSkip: false,
            maxRotation: isMobile ? 90 : 0,
            minRotation: isMobile ? 90 : 0,
            font: { size: 12, weight: '500' },
            callback: (value, index, ticks) => {
              const label = chartData?.labels?.[index] ?? ticks?.[index]?.label ?? String(value);
              if (isMobile) return label;

              const maxCharsPerLine = 10;
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
    [darkMode, isMobile, chartAnalysis, chartData],
  );

  const chartPlugins = useMemo(() => [xAxisBackgroundPlugin(darkMode)], [
    darkMode,
    chartData.labels,
  ]);

  const selectStyles = useMemo(
    () => ({
      control: provided => ({
        ...provided,
        backgroundColor: darkMode ? '#22272e' : '#ffffff',
        borderColor: darkMode ? '#3d444d' : '#ccc',
        color: darkMode ? '#cfd7e3' : '#333',
        minHeight: 48,
        height: 'auto',
        alignItems: 'center',
        paddingTop: 2,
        paddingBottom: 2,
        boxShadow: 'none',
        '&:hover': {
          borderColor: darkMode ? '#3d444d' : '#bbb',
        },
      }),
      valueContainer: provided => ({
        ...provided,
        display: 'flex',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }),
      input: provided => ({
        ...provided,
        margin: 0,
        padding: 0,
        lineHeight: 'normal',
        color: darkMode ? '#cfd7e3' : '#333',
      }),
      menu: provided => ({
        ...provided,
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
        color: darkMode ? '#cfd7e3' : '#333',
      }),
      menuList: provided => ({
        ...provided,
        maxHeight: 220,
        paddingTop: 6,
        paddingBottom: 6,
        overflowY: 'auto',
      }),
      groupHeading: provided => ({
        ...provided,
        fontSize: 12,
        fontWeight: 600,
        color: darkMode ? '#cfd7e3' : '#4a5568',
      }),
      indicatorsContainer: provided => ({
        ...provided,
        alignItems: 'center',
        paddingRight: 6,
      }),
      singleValue: provided => ({
        ...provided,
        color: darkMode ? '#cfd7e3' : '#333',
      }),
      multiValue: provided => ({
        ...provided,
        margin: '4px 8px 4px 0',
        backgroundColor: darkMode ? '#3d444d' : '#e2e8f0',
      }),
      multiValueLabel: provided => ({
        ...provided,
        color: darkMode ? '#cfd7e3' : '#333',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? (darkMode ? '#4caf50' : '#e2e8f0') : 'transparent',
        color: state.isFocused ? (darkMode ? '#fff' : '#1a202c') : darkMode ? '#cfd7e3' : '#333',
        paddingTop: 8,
        paddingBottom: 8,
      }),
      placeholder: provided => ({
        ...provided,
        color: darkMode ? '#aab1bf' : '#6b7280',
        fontWeight: 500,
        lineHeight: 1.4,
        margin: 0,
        alignSelf: 'center',
        paddingTop: 2,
        paddingBottom: 2,
      }),
      indicatorsSeparator: provided => ({
        ...provided,
        backgroundColor: darkMode ? '#3d444d' : '#e5e7eb',
        marginTop: 6,
        marginBottom: 6,
      }),
    }),
    [darkMode],
  );

  const FilterMenuList = props => {
    const field = props.selectProps ? props.selectProps.filterField : undefined;
    const onMenuClose =
      props.selectProps && typeof props.selectProps.onMenuClose === 'function'
        ? props.selectProps.onMenuClose
        : undefined;
    return (
      <components.MenuList {...props}>
        <div className={styles.filterMenuActions}>
          <button
            type="button"
            className={styles.filterMenuButton}
            onClick={() => {
              if (field) handleSelectAll(field);
              if (onMenuClose) onMenuClose();
            }}
          >
            Select All
          </button>
        </div>
        {props.children}
      </components.MenuList>
    );
  };
  FilterMenuList.displayName = 'IssueChartFilterMenuList';

  const activeFilterSummary = useMemo(() => {
    const issueTypeCount = filters.issueTypes.length || Object.keys(issues || {}).length;
    const yearList = filters.years.length ? filters.years : uniqueYears;
    const range =
      yearList.length > 0 ? `${Math.min(...yearList)}–${Math.max(...yearList)}` : 'No years';
    return `${issueTypeCount} Issue Types | ${range}`;
  }, [filters.issueTypes, filters.years, issues, uniqueYears]);

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
              title="Issue types with similar names are grouped (e.g., Technical, Technical1, Technical2)"
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
              value={flatIssueTypeOptions.filter(option =>
                filters.issueTypes.includes(option.value),
              )}
              styles={selectStyles}
              aria-label="Filter issues by type"
              placeholder="Select issue types"
              components={{ MenuList: FilterMenuList }}
              filterField="issueTypes"
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
              components={{ MenuList: FilterMenuList }}
              filterField="years"
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
            style={{ marginTop: 24 }}
          >
            <div className={styles.activeFilterSummary}>{activeFilterSummary}</div>
            <div
              className={`${styles.chartWrapper} ${darkMode ? styles.chartWrapperDark : ''}`}
              style={{
                height: '520px',
                maxHeight: '520px',
                position: 'relative',
                overflow: 'hidden',
                paddingBottom: 50,
              }}
            >
              <Bar
                data={chartData}
                options={chartOptions}
                plugins={chartPlugins}
                aria-labelledby="chart-title"
              />
              <p
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  opacity: 0.85,
                  textAlign: 'center',
                }}
              >
                {chartAnalysis.insightText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueChart;
