import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import styles from './IssueCharts.module.css';

import {
  fetchLongestOpenIssues,
  fetchMostExpensiveIssues,
} from '../../../actions/bmdashboard/issueChartActions';

const truncateLabel = str => (str && str.length > 28 ? `${str.substring(0, 28)}…` : str || '');

const formatDateValue = date => {
  if (!date) return undefined;
  if (typeof date === 'string') return date.split('T')[0];
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return undefined;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getIssueLabel = issue => {
  const rawLabel =
    issue?.issueName ||
    issue?.title ||
    issue?.issueTitle ||
    (issue?.issueId != null ? String(issue.issueId) : '') ||
    (issue?._id != null ? String(issue._id) : 'Untitled');
  return truncateLabel(rawLabel);
};

const getIssueValue = (issue, type) => {
  if (type === 'Longest Open') {
    return Number(issue?.daysOpen || 0);
  }
  return Number(issue?.cost ?? issue?.estimatedCost ?? issue?.totalCost ?? 0);
};

function IssuesCharts({ bmProjects = [] }) {
  const dispatch = useDispatch();

  const [graphType, setGraphType] = useState('Longest Open');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const {
    longestOpenIssues = [],
    mostExpensiveIssues = [],
    loading = false,
    error = null,
  } = useSelector(state => state.issue || {});
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    // If only one end of the date range is chosen, wait for the full range selection
    if ((dateRange.start && !dateRange.end) || (!dateRange.start && dateRange.end)) {
      return;
    }

    const formattedStart = formatDateValue(dateRange.start);
    const formattedEnd = formatDateValue(dateRange.end);

    const params = {
      projectIds: selectedProjects.length > 0 ? selectedProjects : undefined,
      projects: selectedProjects.length > 0 ? selectedProjects : undefined,
      startDate: formattedStart,
      endDate: formattedEnd,
      dates:
        formattedStart && formattedEnd
          ? `${formattedStart},${formattedEnd}`
          : formattedStart || formattedEnd || undefined,
    };

    if (graphType === 'Longest Open') {
      dispatch(fetchLongestOpenIssues(params));
    } else {
      dispatch(fetchMostExpensiveIssues(params));
    }
  }, [graphType, selectedProjects, dateRange.start, dateRange.end, dispatch]);

  const rawData = graphType === 'Longest Open' ? longestOpenIssues : mostExpensiveIssues;
  const safeData = Array.isArray(rawData) ? rawData : [];

  const chartData = useMemo(() => {
    const list = [...safeData];
    if (graphType === 'Most Expensive') {
      return list.sort(
        (a, b) => getIssueValue(b, 'Most Expensive') - getIssueValue(a, 'Most Expensive'),
      );
    }
    return list;
  }, [safeData, graphType]);

  const data = {
    labels: chartData.map(getIssueLabel),
    datasets: [
      {
        label: graphType === 'Longest Open' ? 'Days Open' : 'Cost due to Issue ($)',
        data: chartData.map(issue => getIssueValue(issue, graphType)),
        backgroundColor:
          graphType === 'Longest Open' ? 'rgba(54, 162, 235, 0.7)' : 'rgba(255, 99, 132, 0.7)',
        borderColor:
          graphType === 'Longest Open' ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        maxBarThickness: 32,
      },
    ],
  };

  const options = useMemo(() => {
    const vals = chartData.map(d => getIssueValue(d, graphType));
    const dataMax = vals.length > 0 ? Math.max(...vals) : 600;
    const step =
      graphType === 'Longest Open' ? 250 : Math.max(100, Math.ceil(dataMax / 5 / 100) * 100);
    const xMax = Math.ceil((dataMax + step * 0.2) / step) * step;
    const gridColor = darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    const axisBorderColor = darkMode ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.25)';

    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 100,
      layout: {
        padding: ({ chart }) => ({ right: chart.width < 420 ? 56 : 80, left: 4 }),
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: darkMode ? '#1e2d42' : '#ffffff',
          titleColor: darkMode ? '#ffffff' : '#111111',
          bodyColor: darkMode ? '#e0e6f0' : '#333333',
          borderColor: darkMode ? '#4a5a72' : '#ced4da',
          borderWidth: 1,
          callbacks: {
            title: items => {
              const issue = chartData[items[0]?.dataIndex];
              return (
                issue?.issueName ||
                issue?.title ||
                issue?.issueTitle ||
                (issue?.issueId != null ? String(issue.issueId) : '') ||
                ''
              );
            },
            label: context => {
              const val = context.parsed?.x ?? context.raw ?? 0;
              return graphType === 'Longest Open'
                ? `Days Open: ${val} days`
                : `Cost: $${Number(val).toLocaleString()}`;
            },
          },
        },
        datalabels: {
          anchor: 'end',
          align: 'right',
          clip: false,
          formatter: value =>
            graphType === 'Longest Open' ? `${value} days` : `$${Number(value).toLocaleString()}`,
          color: darkMode ? '#fff' : '#000',
          font: { weight: 'bold' },
        },
        title: {
          display: true,
          text:
            graphType === 'Longest Open'
              ? 'Top 5 Longest Open Issues'
              : 'Most Expensive Open Issues',
          font: { size: 14, weight: 'bold' },
          color: darkMode ? '#fff' : '#000',
        },
      },
      scales: {
        x: {
          max: xMax,
          title: {
            display: true,
            text: graphType === 'Longest Open' ? 'Days Open' : 'Cost due to Issue ($)',
            font: { size: 12 },
            color: darkMode ? '#fff' : '#000',
          },
          ticks: {
            stepSize: graphType === 'Longest Open' ? 250 : undefined,
            color: darkMode ? '#ccc' : '#333',
            callback: value =>
              graphType === 'Longest Open' ? value : `$${Number(value).toLocaleString()}`,
          },
          grid: { color: gridColor },
          border: { color: axisBorderColor },
        },
        y: {
          afterFit: scale => {
            scale.width = Math.round(Math.min(200, Math.max(90, scale.chart.width * 0.32)));
          },
          afterTickToLabelConversion: scale => {
            const maxChars = Math.max(10, Math.floor((scale.chart.width * 0.32) / 7.5));
            scale.ticks.forEach(tick => {
              const label = String(tick.label ?? '');
              tick.label = label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label;
            });
          },
          title: {
            display: true,
            text: graphType === 'Longest Open' ? 'Issue Title' : 'Issue Name',
            font: { size: 12 },
            color: darkMode ? '#fff' : '#000',
          },
          ticks: {
            color: darkMode ? '#ccc' : '#333',
            maxRotation: 0,
            autoSkip: false,
          },
          grid: { color: gridColor },
          border: { color: axisBorderColor },
        },
      },
      elements: {
        bar: { borderRadius: 4, borderSkipped: false },
      },
    };
  }, [graphType, darkMode, chartData]);

  const projectOptions = bmProjects.map(p => ({ value: p._id, label: p.name }));
  const selectedProjectOptions = projectOptions.filter(opt => selectedProjects.includes(opt.value));

  const selectStyles = {
    control: base => ({
      ...base,
      minHeight: 38,
      ...(darkMode && { background: '#2b3e59', borderColor: '#4a5a72', color: '#fff' })),
    }),
    menu: base => ({ ...base, zIndex: 5, ...(darkMode && { background: '#2b3e59' }) }),
    option: (base, { isFocused }) =>
      darkMode ? { ...base, background: isFocused ? '#4a5a72' : '#2b3e59', color: '#fff' } : base,
    multiValue: base => (darkMode ? { ...base, background: '#4a5a72' } : base),
    multiValueLabel: base => (darkMode ? { ...base, color: '#fff' } : base),
    singleValue: base => (darkMode ? { ...base, color: '#fff' } : base),
    input: base => (darkMode ? { ...base, color: '#fff' } : base),
    placeholder: base => ({ ...base, color: darkMode ? '#cfd7e3' : '#6c757d' }),
  };

  const chartHeight = Math.max(240, chartData.length * 56 + 110);

  return (
    <div className={darkMode ? styles.dark : ''}>
      <div className={styles.filtersRow}>
        <div className={styles.dateRangeGroup}>
          <DatePicker
            selected={dateRange.start}
            onChange={value => setDateRange(prev => ({ ...prev, start: value }))}
            placeholderText="Start date"
            ariaLabelledBy="issues-start-date"
            calendarClassName={darkMode ? styles.darkCalendar : styles.lightCalendar}
            className={`${darkMode ? styles.dateDark : styles.dateInput} ${styles.filterControl}`}
            isClearable
          />
          <span className={styles.dateSeparator}>to</span>
          <DatePicker
            selected={dateRange.end}
            onChange={value => setDateRange(prev => ({ ...prev, end: value }))}
            placeholderText="End date"
            ariaLabelledBy="issues-end-date"
            calendarClassName={darkMode ? styles.darkCalendar : styles.lightCalendar}
            className={`${darkMode ? styles.dateDark : styles.dateInput} ${styles.filterControl}`}
            isClearable
          />
        </div>
        <div className={styles.projectsFilter}>
          <Select
            isMulti
            options={projectOptions}
            value={selectedProjectOptions}
            onChange={selected => setSelectedProjects(selected.map(s => s.value))}
            placeholder="All Projects"
            aria-label="Filter by project"
            styles={selectStyles}
          />
        </div>
        <div className={styles.typeFilter}>
          <select
            id="type"
            aria-label="Chart type"
            value={graphType}
            onChange={e => setGraphType(e.target.value)}
            className={`${darkMode ? styles.selectDark : styles.select} ${styles.filterControl}`}
          >
            <option value="Longest Open">Longest Open</option>
            <option value="Most Expensive">Most Expensive</option>
          </select>
        </div>
      </div>
      <div
        className={styles.issuesChartArea}
        style={{ height: chartData.length > 0 ? chartHeight : 'auto' }}
      >
        {loading && <p className={styles.noData}>Loading issues...</p>}
        {!loading && error && <p className={styles.noData}>{error}</p>}
        {!loading && !error && chartData.length > 0 && (
          <Bar
            key={`${graphType}-${selectedProjects.join(',')}-${dateRange.start}-${dateRange.end}`}
            data={data}
            options={options}
            plugins={[ChartDataLabels]}
          />
        )}
        {!loading && !error && chartData.length === 0 && (
          <p className={styles.noData}>No issues found.</p>
        )}
      </div>
    </div>
  );
}

IssuesCharts.propTypes = {
  bmProjects: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string })),
};

export default IssuesCharts;