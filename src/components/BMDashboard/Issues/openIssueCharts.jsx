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

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={darkMode ? styles.issueChartContainerDark : styles.issueChartContainer}>
      <h2 className={darkMode ? styles.titleDark : styles.title}>Longest Open Issues</h2>

      <div className={styles.filterCenterWrapper}>
        {/* Row 1: Date picker */}
        <div className={styles.dateRow}>
          <span className={styles.dateLabel}>From</span>
          <div className={styles.dateField}>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="Start Date"
              className={darkMode ? styles.dateDark : styles.dateLight}
            />
          </div>
          <span className={styles.dateLabel}>to</span>
          <div className={styles.dateField}>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              placeholderText="End Date"
              className={darkMode ? styles.dateDark : styles.dateLight}
            />
          </div>
        </div>

        {/* Row 2: Project selector */}
        <div className={styles.projectRow}>
          <Select
            isMulti
            id="project-select"
            options={projectOptions}
            onChange={handleProjectChange}
            value={projectOptions.filter(option => (selectedProjects ?? []).includes(option.value))}
            classNamePrefix="select"
            className={`${styles.selectReact} ${darkMode ? styles.selectDark : ''}`}
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
