import { useEffect, useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import Select from 'react-select';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import {
  fetchLongestOpenIssues,
  setProjectFilter,
} from '../../../actions/bmdashboard/issueChartActions';
import './issueCharts.css';

function IssueCharts() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { issues, loading, error, selectedProjects } = useSelector(state => state.bmissuechart);
  const projects = useSelector(state => state.bmProjects);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const chartContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  // Enhanced color scheme for accessibility
  const textColor = darkMode ? '#f7fafc' : '#1a202c';
  const gridColor = darkMode ? '#4a5568' : '#e2e8f0';
  const tooltipBg = darkMode ? '#2d3748' : '#ffffff';
  const tooltipBorder = darkMode ? '#4a5568' : '#e2e8f0';

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

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

  useEffect(() => {
    function handleResize() {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.offsetWidth);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial set
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleProjectChange = selected => {
    dispatch(setProjectFilter(selected ? selected.map(option => option.value) : []));
  };

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.name,
  }));

  // Calculate margins and YAxis width based on container width
  const getChartLayout = () => {
    // Margins and YAxis width scale with container width
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

  return (
    <div className={`issue-chart-container ${darkMode ? 'dark' : ''}`}>
      <h2>Longest Open Issues</h2>

      <div className="filters-container">
        <div className="filter">
          <label className="issue-chart-label" htmlFor="start-date">
            Date Range:
          </label>
          <div className="date-range-picker">
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              placeholderText="Start Date"
              isClearable
              className="filter-select"
            />
            <span>to</span>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              placeholderText="End Date"
              isClearable
              className="filter-select"
            />
          </div>
        </div>

        <div className="filter">
          <label className="issue-chart-label" htmlFor="start-date">
            Projects:
          </label>
          <Select
            id="start-date"
            isMulti
            options={projectOptions}
            onChange={handleProjectChange}
            value={projectOptions.filter(option => (selectedProjects ?? []).includes(option.value))}
            className="filter-select"
            classNamePrefix="select"
          />
        </div>
      </div>

      <div className="chart-container" ref={chartContainerRef}>
        {!issues || issues.length === 0 ? (
          <div className="no-data-message">
            <div className="no-data-content">
              <h3>No Open Issues Found</h3>
              <p>There are currently no open issues matching your selected criteria.</p>
              <p>Try adjusting your date range or project filters to see more results.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={issues} layout="vertical" margin={margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                label={{ value: 'Duration in Months', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                dataKey="issueName"
                type="category"
                tick={{ fontSize: 14, fontWeight: 500 }}
                width={yAxisWidth}
              />
              <Tooltip
                formatter={value => `${value} months`}
                labelFormatter={label => `Issue: ${label}`}
              />
              <Bar dataKey="durationOpen" fill="#6495ED" barSize={30}>
                <LabelList
                  dataKey="durationOpen"
                  position="right"
                  formatter={v => `${v} mo`}
                  className="recharts-label"
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
