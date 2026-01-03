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
import styles from './issueCharts.module.css';

/* ---------- helpers ---------- */

const getThemeColors = isDark => ({
  textColor: isDark ? '#f7fafc' : '#1a202c',
  gridColor: isDark ? '#4a5568' : '#e2e8f0',
  tooltipBg: isDark ? '#2d3748' : '#ffffff',
  tooltipBorder: isDark ? '#4a5568' : '#e2e8f0',
  hoverBg: isDark ? '#2d3748' : '#e2e8f0',
});

const getErrorColor = isDark => (isDark ? '#fca5a5' : '#dc2626');

const getOptionBackground = (isDark, isFocused) => {
  if (isFocused) {
    return isDark ? '#2d3748' : '#e2e8f0';
  }
  return isDark ? '#1a202c' : '#ffffff';
};

const getChartClasses = (css, isDark) => ({
  containerClass: `${css.issueChartContainer} ${isDark ? css.issueChartContainerDark : ''}`,
  labelClass: `${css.issueChartLabel} ${isDark ? css.issueChartLabelDark : ''}`,
  filterSelectClass: `${css.filterSelect} ${isDark ? css.filterSelectDark : ''}`,
  chartContainerClass: `${css.chartContainer} ${isDark ? css.chartContainerDark : ''}`,
  noDataMessageClass: `${css.noDataMessage} ${isDark ? css.noDataMessageDark : ''}`,
  noDataContentClass: `${css.noDataContent} ${isDark ? css.noDataContentDark : ''}`,
});

const createSelectStyles = (isDark, textColor) => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: isDark ? '#2d3748' : '#ffffff',
    borderColor: isDark ? '#4a5568' : '#cbd5e0',
    boxShadow: state.isFocused ? '0 0 0 1px #4caf50' : 'none',
    '&:hover': {
      borderColor: '#4caf50',
    },
    color: textColor,
  }),
  menu: base => ({
    ...base,
    backgroundColor: isDark ? '#1a202c' : '#ffffff',
    color: textColor,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: getOptionBackground(isDark, state.isFocused),
    color: textColor,
    cursor: 'pointer',
  }),
  singleValue: base => ({
    ...base,
    color: textColor,
  }),
  multiValue: base => ({
    ...base,
    backgroundColor: isDark ? '#4a5568' : '#e2e8f0',
  }),
  multiValueLabel: base => ({
    ...base,
    color: textColor,
  }),
  placeholder: base => ({
    ...base,
    color: isDark ? '#a0aec0' : '#718096',
  }),
});

/* --------------------------- component --------------------------- */

function IssueCharts() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { issues, loading, error, selectedProjects } = useSelector(state => state.bmissuechart);
  const projects = useSelector(state => state.bmProjects);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const chartContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  const { textColor, gridColor, tooltipBg, tooltipBorder, hoverBg } = getThemeColors(darkMode);
  const errorColor = getErrorColor(darkMode);
  const {
    containerClass,
    labelClass,
    filterSelectClass,
    chartContainerClass,
    noDataMessageClass,
    noDataContentClass,
  } = getChartClasses(styles, darkMode);
  const selectStyles = createSelectStyles(darkMode, textColor);

  const loadingMessageStyle = {
    color: textColor,
    textAlign: 'center',
    padding: '20px',
  };

  const errorMessageStyle = {
    color: errorColor,
    textAlign: 'center',
    padding: '20px',
  };

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

  /* ------------ decide what to show inside chart container ------------ */

  let chartContent;

  if (error) {
    chartContent = <div style={errorMessageStyle}>Error: {error}</div>;
  } else if (loading) {
    chartContent = <div style={loadingMessageStyle}>Loading chart data...</div>;
  } else if (!issues || issues.length === 0) {
    chartContent = (
      <div className={noDataMessageClass}>
        <div className={noDataContentClass}>
          <h3>No Open Issues Found</h3>
          <p>There are currently no open issues matching your selected criteria.</p>
          <p>Try adjusting your date range or project filters to see more results.</p>
        </div>
      </div>
    );
  } else {
    chartContent = (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={issues} layout="vertical" margin={margin}>
          <CartesianGrid stroke={gridColor} />
          <XAxis
            type="number"
            tick={{ fill: textColor }}
            label={{
              value: 'Duration in Months',
              position: 'insideBottom',
              offset: -5,
              fill: textColor,
            }}
          />
          <YAxis
            dataKey="issueName"
            type="category"
            tick={{ fontSize: 14, fill: textColor }}
            width={yAxisWidth}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
            }}
            itemStyle={{ color: textColor }}
            labelStyle={{ color: textColor }}
            formatter={value => `${value} months`}
            labelFormatter={label => `Issue : ${label}`}
            cursor={{ fill: hoverBg, opacity: 0.8 }}
          />
          <Bar name="Duration Open" dataKey="durationOpen" fill="#6495ED" barSize={30}>
            <LabelList
              dataKey="durationOpen"
              position="right"
              formatter={v => `${v} months`}
              style={{ fill: textColor }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  /* --------------------------- render --------------------------- */

  return (
    <div className={containerClass}>
      <h2>Longest Open Issues</h2>

      <div className={styles.filtersContainer}>
        <div className={styles.dateFilter}>
          <label className={labelClass} htmlFor="start-date">
            Date Range:
          </label>
          <div className={styles.dateRangePicker}>
            <div className={styles.dateRangePickerStart}>
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
                className={filterSelectClass}
                calendarClassName={darkMode ? 'darkCalendar' : 'lightCalendar'}
              />
            </div>
            <span className={styles.dateRangeSeparator}>to</span>
            <div className={styles.dateRangePickerEnd}>
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
                className={filterSelectClass}
                calendarClassName={darkMode ? 'darkCalendar' : 'lightCalendar'}
              />
            </div>
          </div>
        </div>

        <div className={styles.projectFilter}>
          <label className={labelClass} htmlFor="projects-select">
            Projects:
          </label>
          <Select
            id="projects-select"
            isMulti
            options={projectOptions}
            onChange={handleProjectChange}
            value={projectOptions.filter(option => (selectedProjects ?? []).includes(option.value))}
            classNamePrefix="select"
            styles={selectStyles}
          />
        </div>
      </div>

      <div className={chartContainerClass} ref={chartContainerRef}>
        {chartContent}
      </div>
    </div>
  );
}

export default IssueCharts;
