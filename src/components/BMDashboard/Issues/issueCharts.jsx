import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Select from 'react-select';
import { fetchIssues } from '../../../actions/bmdashboard/issueChartActions';
import './issueChart.css';

function IssueChart() {
  const dispatch = useDispatch();
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
    const issueTypes = [...new Set(Object.keys(issues))].map(issue => ({
      label: issue,
      value: issue,
    }));

    const years = [
      ...new Set(
        Object.values(issues)
          .flatMap(issueData => Object.keys(issueData))
          .map(year => parseInt(year, 10)),
      ),
    ]
      .sort((a, b) => a - b)
      .map(year => ({ label: year.toString(), value: year }));

    const addAll = options => [{ label: 'All', value: 'All' }, ...options];
    return {
      issueTypes: addAll(issueTypes),
      years: addAll(years),
    };
  };

  const { issueTypes, years } = extractDropdownOptions();

  const generateColor = index => {
    const hue = (index * 60) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const uniqueYears = years.filter(year => year.value !== 'All').map(year => year.value);
  const yearColorMap = uniqueYears.reduce((acc, year, index) => {
    acc[year] = generateColor(year, index);
    return acc;
  }, {});

  const handleFilterChange = (selectedOptions, field) => {
    if (selectedOptions.some(option => option.value === 'All')) {
      const allValues = field === 'issueTypes' ? Object.keys(issues) : uniqueYears;
      setFilters({
        ...filters,
        [field]: allValues,
      });
    } else {
      setFilters({
        ...filters,
        [field]: selectedOptions.map(option => option.value),
      });
    }
  };

  const processData = () => {
    if (!issues || Object.keys(issues).length === 0) return [{ issueType: 'No Data' }];

    if (filters.issueTypes.length === 0 && filters.years.length >= 0) {
      return [{ issueType: 'No Issues Selected' }];
    }

    const groupedData = {};
    const allYears = [...filters.years].sort((a, b) => a - b);

    const filteredIssueTypes = filters.issueTypes.length ? filters.issueTypes : Object.keys(issues);

    filteredIssueTypes.forEach(issueType => {
      if (!issues[issueType]) return;

      const issueData = issues[issueType];
      groupedData[issueType] = { issueType };

      allYears.forEach(year => {
        groupedData[issueType][year] = 0;
      });

      Object.keys(issueData).forEach(year => {
        const yearNum = parseInt(year, 10);
        if (filters.years.includes(yearNum)) {
          groupedData[issueType][yearNum] = issueData[year] || 0;
        }
      });
    });

    return Object.values(groupedData);
  };

  const processedData = processData();

  const allYValues = processedData.flatMap(data =>
    Object.values(data).filter(val => typeof val === 'number'),
  );

  const yTicks = [...new Set(allYValues.map(val => Math.floor(val)))].sort((a, b) => a - b);

  const sortedProcessedData = processedData.sort((a, b) => {
    const issueTypeA = a.issueType;
    const issueTypeB = b.issueType;
    return (
      issueTypes.findIndex(option => option.value === issueTypeA) -
      issueTypes.findIndex(option => option.value === issueTypeB)
    );
  });

  return (
    <div className="issue-chart-event-container">
      <h2 className="issue-chart-event-title">Issues Chart</h2>

      <div>
        <label className="issue-chart-label" htmlFor="issue-type-select">
          Issue Type:
        </label>
        <Select
          inputId="issue-type-select"
          className="issue-chart-select"
          isMulti
          options={issueTypes}
          onChange={selectedOptions => handleFilterChange(selectedOptions, 'issueTypes')}
          value={issueTypes.filter(option => filters.issueTypes.includes(option.value))}
        />

        <label className="issue-chart-label" htmlFor="year-select">
          Year:
        </label>
        <Select
          inputId="year-select"
          className="issue-chart-select"
          isMulti
          // other props...
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedProcessedData} margin={{ top: 60, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="issueType" />
            <YAxis ticks={yTicks} tickFormatter={tick => tick} />
            <Tooltip />
            <Legend />
            {(filters.years.length ? filters.years : uniqueYears)
              .sort((a, b) => a - b)
              .map(year => (
                <Bar key={year} dataKey={year} fill={yearColorMap[year]} />
              ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default IssueChart;
