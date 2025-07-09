import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './InjuryCategoryBarChart.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInjuryData,
  fetchSeverities,
  fetchInjuryTypes,
} from '../../../../actions/bmdashboard/injuryActions';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';

function InjuryCategoryBarChart() {
  const dispatch = useDispatch();

  // Redux selectors
  const { data = [], loading, error } = useSelector(state => state.bmInjury || {});
  const severities = useSelector(state => state.bmInjury?.severities || []);
  const injuryTypes = useSelector(state => state.bmInjury?.injuryTypes || []);
  const bmProjects = useSelector(state => state.bmProjects);

  // Filter states
  const [projectFilter, setProjectFilter] = useState([]);
  const [severityFilter, setSeverityFilter] = useState([]);
  const [injuryTypeFilter, setInjuryTypeFilter] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchBMProjects());
    dispatch(fetchSeverities());
    dispatch(fetchInjuryTypes());
  }, [dispatch]);

  // Dropdown options
  const projectOptions = Array.isArray(bmProjects)
    ? bmProjects.map(p => ({ value: p._id, label: p.name }))
    : [];

  const severityOptions = Array.isArray(severities)
    ? severities.map(s => ({ value: s, label: s }))
    : [];

  const typeOptions = Array.isArray(injuryTypes)
    ? injuryTypes.map(t => ({ value: t, label: t }))
    : [];

  // Fetch chart data when filters are changed
  useEffect(() => {
    if (!bmProjects.length || !severities.length || !injuryTypes.length) return;
    const filters = {
      projectIds: projectFilter.map(p => p.value).join(','),
      startDate: startDate ? startDate.toISOString() : '',
      endDate: endDate ? endDate.toISOString() : '',
      severities: severityFilter.map(s => s.value).join(','),
      types: injuryTypeFilter.map(t => t.value).join(','),
    };
    dispatch(fetchInjuryData(filters));
  }, [
    projectFilter,
    severityFilter,
    injuryTypeFilter,
    startDate,
    endDate,
    dispatch,
    bmProjects,
    severities,
    injuryTypes,
  ]);
  // Restructure data for grouped bar chart
  const chartData = Object.values(
    data.reduce((acc, curr) => {
      const key = curr.workerCategory;
      acc[key] = acc[key] || { workerCategory: key };
      acc[key][curr.projectName] = curr.totalInjuries;
      return acc;
    }, {}),
  );

  const uniqueProjects = [...new Set(data.map(d => d.projectName))];

  return (
    <div className="injury-chart-container">
      <h3 className="injury-chart-title">Injury Severity by Category of Worker Injured</h3>

      <div className="injury-chart-filters">
        <Select
          isMulti
          options={projectOptions}
          value={projectFilter}
          onChange={setProjectFilter}
          placeholder="Select Project(s)"
        />
        <Select
          isMulti
          options={severityOptions}
          value={severityFilter}
          onChange={setSeverityFilter}
          placeholder="Select Severity"
        />
        <Select
          isMulti
          options={typeOptions}
          value={injuryTypeFilter}
          onChange={setInjuryTypeFilter}
          placeholder="Select Injury Type"
        />
        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText="End Date"
        />
      </div>
      {loading && <p>Loading...</p>}
      {!loading && error && <p>Error: {error}</p>}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis dataKey="workerCategory" interval={0} angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            {uniqueProjects.map((project, index) => (
              <Bar key={project} dataKey={project} fill={index % 2 === 0 ? '#17c9d3' : '#000'}>
                <LabelList dataKey={project} position="top" />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default InjuryCategoryBarChart;
