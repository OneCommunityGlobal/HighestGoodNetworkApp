import { useEffect, useState, useRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import Select from 'react-select';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import {
  fetchLongestOpenIssues,
  setProjectFilter,
} from '../../../actions/bmdashboard/issueChartActions';
import styles from './issueChart.module.css';

function IssueCharts() {
  const dispatch = useDispatch();

  const { issues, loading, error, selectedProjects } = useSelector(state => state.bmissuechart);
  const projects = useSelector(state => state.bmProjects);
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const chartContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  // Enhanced color scheme for accessibility
  const textColor = darkMode ? '#f7fafc' : '#1a202c';
  const gridColor = darkMode ? '#4a5568' : '#e2e8f0';
  const tooltipBg = darkMode ? '#2d3748' : '#ffffff';
  const tooltipBorder = darkMode ? '#4a5568' : '#e2e8f0';

  // Normalize issues for chart
  const normalizedIssues = useMemo(() => {
    return (issues || []).map((item, index) => ({
      issueName: item.issueName || `Issue #${index + 1}`,
      durationOpen: item.durationOpen ?? 0,
    }));
  }, [issues]);

  // Load projects on mount
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // Fetch issues when filters change
  useEffect(() => {
    let dateRange = [];
    if (startDate && endDate) {
      dateRange = [
        `${startDate.toISOString().split('T')[0]},${endDate.toISOString().split('T')[0]}`,
      ];
    } else if (startDate && !endDate) {
      const today = new Date().toISOString().split('T')[0];
      dateRange = [`${startDate.toISOString().split('T')[0]},${today}`];
    } else if (!startDate && endDate) {
      dateRange = [`1980-01-01,${endDate.toISOString().split('T')[0]}`];
    }

    dispatch(fetchLongestOpenIssues(dateRange, selectedProjects));
  }, [dispatch, startDate, endDate, selectedProjects]);

  // Handle chart container width
  useEffect(() => {
    function handleResize() {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.offsetWidth);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleProjectChange = selected => {
    dispatch(setProjectFilter(selected ? selected.map(option => option.value) : []));
  };

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.name,
  }));

  const getChartLayout = () => {
    const leftRightMargin = Math.max(20, Math.min(200, containerWidth * 0.12));
    const yAxisWidth = Math.max(60, Math.min(180, containerWidth * 0.13));
    return {
      margin: { top: 20, right: leftRightMargin, left: leftRightMargin, bottom: 5 },
      yAxisWidth,
    };
  };

  const { margin, yAxisWidth } = getChartLayout();

  if (loading) {
    return (
      <div style={{ color: textColor, textAlign: 'center', padding: '20px' }}>
        Loading chart data...
      </div>
    );
  }
  if (error) {
    return (
      <div
        style={{ color: darkMode ? '#fca5a5' : '#dc2626', textAlign: 'center', padding: '20px' }}
      >
        Error: {error}
      </div>
    );
  }

  const containerClass = `${styles.issueChartContainer} ${
    darkMode ? styles.issueChartContainerDark : ''
  }`;
  const labelClass = `${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`;

  return (
    <div className={containerClass}>
      <h2>Longest Open Issues</h2>
      <label className={labelClass} htmlFor="start-date">
        Date Range
      </label>
      <div className={styles.filterCenterWrapper}>
        {/* Label: Date */}
        <div className={styles.rowLabel}>Date</div>

        {/* Row 1: Date picker */}
        <div className={styles.dateRow}>
          <span className={darkMode ? styles.dateLabelDark : styles.dateLabelLight}>From</span>
          <div className={styles.dateField}>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="Start Date"
              isClearable
              className={darkMode ? styles.dateDark : styles.dateLight}
            />
          </div>
          <span className={styles.dateLabel}>to</span>
          <div className={styles.dateField}>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              placeholderText="End Date"
              isClearable
              className={darkMode ? styles.dateDark : styles.dateLight}
            />
          </div>
        </div>

        {/* Row 2: Project selector */}
        <label className={labelClass} htmlFor="start-date">
          Project
        </label>
        <div className={styles.projectRow}>
          <Select
            isMulti
            id="project-select"
            options={projectOptions}
            onChange={handleProjectChange}
            value={projectOptions.filter(option => (selectedProjects ?? []).includes(option.value))}
            classNamePrefix="select"
            classNames={{
              control: () => (darkMode ? styles.controlDark : styles.controlLight),
              menu: () => (darkMode ? styles.menuDark : styles.menuLight),
              singleValue: () => (darkMode ? styles.valueDark : styles.valueLight),
              placeholder: () => (darkMode ? styles.valueDark : styles.valueLight),
              option: () => (darkMode ? styles.optionDark : styles.optionLight),
              multiValue: () => (darkMode ? styles.multiValueDark : styles.multiValueLight),
              multiValueLabel: () =>
                darkMode ? styles.multiValueLabelDark : styles.multiValueLabelLight,
              multiValueRemove: () =>
                darkMode ? styles.multiValueRemoveDark : styles.multiValueRemoveLight,
            }}
            styles={{
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? darkMode
                    ? '#3a3f47'
                    : '#dceeff'
                  : state.isFocused
                  ? darkMode
                    ? '#3a3f47'
                    : '#dceeff'
                  : 'transparent',
                color: darkMode ? '#cfd7e3' : 'black',
              }),

              multiValue: base => ({
                ...base,
                backgroundColor: darkMode ? '#3a3f47' : '#dceeff',
                color: darkMode ? '#cfd7e3' : 'black',
              }),

              multiValueLabel: base => ({
                ...base,
                color: darkMode ? '#cfd7e3' : 'black',
              }),

              control: base => ({
                ...base,
                backgroundColor: darkMode ? '#22272e' : 'white',
                borderColor: darkMode ? '#3d444d' : '#ccc',
                color: darkMode ? '#cfd7e3' : 'black',
              }),
            }}
          />
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartContainer} ref={chartContainerRef}>
        {normalizedIssues.length === 0 ? (
          <p className={styles.noData}>No issues found.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={normalizedIssues} layout="vertical" margin={margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                label={{
                  value: 'Duration in Months',
                  position: 'insideBottom',
                  offset: -5,
                  fill: darkMode ? '#fff' : '#000',
                }}
                tick={{ fill: darkMode ? '#ccc' : '#333' }}
              />
              <YAxis
                dataKey="issueName"
                type="category"
                tick={{ fontSize: 14, fontWeight: 500, fill: darkMode ? '#fff' : '#000' }}
                width={yAxisWidth}
              />
              <Bar dataKey="durationOpen" fill="#6495ED" barSize={30}>
                <LabelList
                  dataKey="durationOpen"
                  position="right"
                  formatter={v => `${v} mo`}
                  fill={darkMode ? '#fff' : '#000'}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default IssueCharts;
