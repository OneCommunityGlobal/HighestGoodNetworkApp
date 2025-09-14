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
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import { fetchLongestOpenIssues, setProjectFilter } from '~/actions/bmdashboard/issueChartActions';
import styles from './openissueCharts.module.css';

function Spinner({ dark }) {
  return (
    <div className={styles.spinnerContainer}>
      <div className={dark ? styles.spinnerDark : styles.spinner}></div>
    </div>
  );
}

function IssueCharts() {
  const dispatch = useDispatch();
  const { issues, loading, error, selectedProjects } = useSelector(state => state.bmissuechart);
  const projects = useSelector(state => state.bmProjects);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const chartContainerRef = useRef(null);

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

  const handleProjectChange = selected => {
    dispatch(setProjectFilter(selected ? selected.map(option => option.value) : []));
  };

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.name,
  }));

  const chartHeight = Math.max(250, issues.length * 50);

  if (error) return <div>Error: {error}</div>;

  return (
    <div
      className={`${styles.issueChartContainer} ${darkMode ? styles.issueChartContainerDark : ''}`}
    >
      <h2 className={darkMode ? styles.issueChartHeadingDark : ''}>Longest Open Issues</h2>

      <div className={styles.filtersContainer}>
        <div className={styles.filter}>
          <label
            className={`${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`}
            htmlFor="start-date"
          >
            Date Range:
          </label>
          <div className={styles.dateRangePicker}>
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
              className={`${styles.filterSelect} ${darkMode ? styles.filterSelectDark : ''}`}
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
              className={`${styles.filterSelect} ${darkMode ? styles.filterSelectDark : ''}`}
            />
          </div>
        </div>

        <div className={styles.filter}>
          <label
            className={`${styles.issueChartLabel} ${darkMode ? styles.issueChartLabelDark : ''}`}
            htmlFor="project-select"
          >
            Projects:
          </label>
          <Select
            id="project-select"
            isMulti
            options={projectOptions}
            onChange={handleProjectChange}
            value={projectOptions.filter(option => (selectedProjects ?? []).includes(option.value))}
            classNamePrefix="select"
            className={`${styles.filterSelect} ${darkMode ? styles.filterSelectDark : ''}`}
            menuClassName={darkMode ? '_filterSelectDark_6f0tj_126_menu' : undefined}
            styles={
              darkMode
                ? {
                    control: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#2c3344',
                      borderColor: '#364156',
                    }),
                    menu: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#2c3344',
                    }),
                    option: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: state.isFocused ? '#364156' : '#2c3344',
                      color: '#e0e0e0',
                    }),
                    multiValue: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#253242',
                      color: '#e0e0e0',
                    }),
                    multiValueLabel: baseStyles => ({
                      ...baseStyles,
                      color: '#e0e0e0',
                    }),
                    multiValueRemove: baseStyles => ({
                      ...baseStyles,
                      color: '#fff',
                      backgroundColor: '#2c3440',
                    }),
                    singleValue: baseStyles => ({
                      ...baseStyles,
                      color: '#e0e0e0',
                    }),
                    placeholder: baseStyles => ({
                      ...baseStyles,
                      color: '#aaaaaa',
                    }),
                    menuPortal: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#2c3344',
                      zIndex: 9999,
                    }),
                  }
                : {}
            }
            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
          />
        </div>
      </div>

      <div
        className={`${styles.chartContainer} ${darkMode ? styles.chartContainerDark : ''}`}
        ref={chartContainerRef}
        style={{ height: chartHeight }}
      >
        {loading ? (
          <Spinner dark={darkMode} />
        ) : !issues || issues.length === 0 ? (
          <div className={`${styles.noDataMessage} ${darkMode ? styles.noDataMessageDark : ''}`}>
            <div className={`${styles.noDataContent} ${darkMode ? styles.noDataContentDark : ''}`}>
              <h3>No Open Issues Found</h3>
              <p>There are currently no open issues matching your selected criteria.</p>
              <p>Try adjusting your date range or project filters to see more results.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={issues}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                label={{ value: 'Duration in Months', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                dataKey="issueName"
                type="category"
                width={100}
                tick={{ fontSize: 14, fontWeight: 500 }}
                tickFormatter={value =>
                  value.length > 25 ? `${value.substring(0, 25)}...` : value
                }
              />
              <Tooltip
                formatter={value => `${value} months`}
                labelFormatter={label => `Issue: ${label}`}
              />
              <Bar dataKey="durationOpen" fill={darkMode ? '#1665C0' : '#6495ED'} barSize={30}>
                <LabelList
                  dataKey="durationOpen"
                  position="right"
                  formatter={v => `${v} mo`}
                  className={`${styles.rechartsLabel} ${darkMode ? styles.rechartsLabelDark : ''}`}
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
