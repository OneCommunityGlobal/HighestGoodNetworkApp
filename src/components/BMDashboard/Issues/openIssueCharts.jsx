import { useEffect, useState } from 'react';
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

function OpenIssueCharts() {
  const dispatch = useDispatch();
  const { issues, loading, error, selectedProjects } = useSelector(state => state.bmissuechart);
  const projects = useSelector(state => state.bmProjects);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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
      // Fetch all issues from the beginning of time until the end date
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

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="issue-chart-container">
      <h2>Longest Open Issues</h2>

      <div className="filters-container">
        <div className="filter">
          <label className="issue-chart-label" htmlFor="date-range-picker">
            Date Range:
          </label>
          <div id="date-range-picker" className="date-range-picker">
            <div className="date-picker-wrapper">
              <DatePicker
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
            </div>
            <span>to</span>
            <div className="date-picker-wrapper">
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
        </div>

        <div className="filter">
          <label className="issue-chart-label" htmlFor="project-select">
            Projects:
          </label>
          <Select
            id="project-select"
            isMulti
            options={projectOptions}
            onChange={handleProjectChange}
            value={projectOptions.filter(option => (selectedProjects ?? []).includes(option.value))}
            className="filter-select"
            classNamePrefix="select"
          />
        </div>
      </div>

      <div className="chart-container">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        {!loading && !error && (!issues || issues.length === 0) ? (
          <div className="no-data-message">
            <div className="no-data-content">
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
              margin={{ top: 20, right: 50, left: 100, bottom: 20 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                label={{ value: 'Duration in Months', position: 'insideBottom', offset: -10 }}
              />
              <YAxis dataKey="issueName" type="category" tick={{ fontSize: 12 }} width={150} />
              <Tooltip
                formatter={value => `${value} months`}
                labelFormatter={label => `Issue: ${label}`}
                cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}
              />
              <Bar dataKey="durationOpen" fill="#6495ED" barSize={25}>
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

export default OpenIssueCharts;
