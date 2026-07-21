// InjuryChartForm.jsx - Form and chart display component
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormGroup, Label, Input } from 'reactstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';
import { fetchInjuryProjects, getInjuryData } from '../../../actions/bmdashboard/injuryActions';

import 'react-datepicker/dist/react-datepicker.css';
import styles from './InjuryChartForm.module.css';

const severityColors = {
  Serious: '#dc3545',
  Medium: '#fd7e14',
  Low: '#198754',
};

const severities = ['Serious', 'Medium', 'Low'];

function InjuryTrendTooltip({
  active,
  payload,
  label,
  projectName,
  dark,
  showAllSeverities = false,
}) {
  if (!active || !payload?.length) return null;

  const hoveredSeverity = payload[0]?.dataKey || payload[0]?.name;
  // Bar charts use item hover, so rebuild the month's full severity list from the hovered row.
  const tooltipItems = showAllSeverities
    ? severities.map(severity => ({
        dataKey: severity,
        name: severity,
        value: payload[0]?.payload?.[severity],
      }))
    : payload;

  return (
    <div
      className={styles.tooltip}
      style={{
        backgroundColor: dark ? '#1e293b' : '#fff',
        borderColor: dark ? '#475569' : '#ddd',
        color: dark ? '#e2e8f0' : '#333',
      }}
    >
      <div className={styles.tooltipTitle}>{label}</div>
      {projectName !== 'all' && <div className={styles.tooltipProject}>{projectName}</div>}
      {tooltipItems.map(item => (
        <div
          key={item.dataKey}
          className={`${styles.tooltipRow} ${
            showAllSeverities && item.dataKey === hoveredSeverity ? styles.tooltipRowActive : ''
          }`}
        >
          <span
            className={styles.tooltipMarker}
            style={{ backgroundColor: severityColors[item.name] || item.color }}
          />
          <span>{item.name}</span>
          <span>{Number(item.value) || 0}</span>
        </div>
      ))}
    </div>
  );
}

function InjuryChartForm({ dark }) {
  const wrapperClass = dark ? styles.wrapperDark : 'bg-white';
  const labelClass = dark ? styles.wrapperDark : '';
  const gridStroke = dark ? '#374151' : '#eee';
  const tickStyle = { fill: dark ? '#d1d5db' : '#666' };
  const xLabelStyle = {
    value: 'Month',
    position: 'insideBottom',
    offset: -10,
    fill: tickStyle.fill,
  };
  const yLabelStyle = {
    value: 'Number of Injuries',
    angle: -90,
    position: 'insideLeft',
    fill: tickStyle.fill,
  };
  const noDataClass = dark ? 'bg-dark text-light' : 'bg-white';
  const noDataText = dark ? 'text-light' : 'text-muted';

  const [chartType, setChartType] = useState('line');
  const dispatch = useDispatch();
  const injuryProjects = useSelector(state => state.bmInjury?.projects || []);
  // Form state
  const [projectName, setProjectName] = useState('all');
  const [startDate, setStartDate] = useState(
    moment()
      .subtract(6, 'months')
      .toDate(),
  );
  const [endDate, setEndDate] = useState(new Date());

  // Chart state
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Send projectName so duplicate legacy project IDs are aggregated under one displayed project.
  useEffect(() => {
    dispatch(fetchInjuryProjects({})).catch(err => {
      toast.error(`Failed to load projects: ${err.message}`);
    });
  }, [dispatch]);

  // Transform API data to chart format
  const transformData = data => {
    if (!data || !data.months || !Array.isArray(data.months)) {
      return [];
    }

    const transformed = data.months.map((month, index) => ({
      month,
      Serious: Number(data.serious?.[index]) || 0,
      Medium: Number(data.medium?.[index]) || 0,
      Low: Number(data.low?.[index]) || 0,
    }));

    return transformed;
  };

  const selectedProject = injuryProjects.find(project => project.name === projectName);

  // Fetch injury data
  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
      const formattedEndDate = moment(endDate).format('YYYY-MM-DD');

      // Send grouped IDs with projectName so specific selections cannot fall back to all-project data.
      const response = await getInjuryData(
        projectName,
        formattedStartDate,
        formattedEndDate,
        selectedProject?.projectIds || [],
      );
      const transformedData = transformData(response);
      setChartData(transformedData);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [projectName, startDate, endDate, selectedProject]);

  // Handle project change
  const handleProjectChange = e => {
    setProjectName(e.target.value);
  };

  // Handle date changes
  const handleStartDateChange = date => {
    setStartDate(date);
  };

  const handleEndDateChange = date => {
    setEndDate(date);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.injuryChartContainer} p-4`}>
      {/* Filter Form */}
      <div className={`${styles.filterForm} mb-4 p-3 ${wrapperClass} rounded shadow-sm`}>
        <div className="row g-3">
          <div className="col-md-4">
            <FormGroup>
              <Label for="project" className={labelClass}>
                Project
              </Label>
              <Input id="project" type="select" value={projectName} onChange={handleProjectChange}>
                <option value="all">All Projects</option>
                {injuryProjects.map(project => (
                  <option key={project._id} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </div>

          <div className="col-md-4">
            <FormGroup>
              <Label className={labelClass}>Start Date</Label>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="form-control"
                dateFormat="yyyy-MM-dd"
              />
            </FormGroup>
          </div>

          <div className="col-md-4">
            <FormGroup>
              <Label className={labelClass}>End Date</Label>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="form-control"
                dateFormat="yyyy-MM-dd"
              />
            </FormGroup>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Chart Display with Toggle */}
      {!error && chartData && chartData.length > 0 && (
        <div className={`${styles.injuryChartContainer} ${wrapperClass} p-4 rounded shadow-sm`}>
          <div className="d-flex justify-content-end mb-2">
            <button
              className={`btn btn-sm ${
                chartType === 'line'
                  ? `btn-primary ${styles.toggleBtnSpace}`
                  : 'btn-outline-primary'
              }`}
              onClick={() => setChartType('line')}
              aria-pressed={chartType === 'line'}
            >
              Line Chart
            </button>
            <button
              className={`btn btn-sm ${
                chartType === 'bar' ? `btn-primary ${styles.toggleBtnSpace}` : 'btn-outline-primary'
              }`}
              onClick={() => setChartType('bar')}
              aria-pressed={chartType === 'bar'}
            >
              Bar Chart
            </button>
          </div>

          <h3 className="text-center mb-4">Injury Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="month"
                  padding={{ left: 20, right: 20 }}
                  tick={tickStyle}
                  label={xLabelStyle}
                />
                <YAxis allowDecimals={false} tick={tickStyle} label={yLabelStyle} />
                {/* Keep item hover/cursor off, but show all severities for the hovered month. */}
                <Tooltip
                  content={
                    <InjuryTrendTooltip projectName={projectName} dark={dark} showAllSeverities />
                  }
                  cursor={false}
                  shared={false}
                />
                <Legend verticalAlign="top" align="center" />
                <Bar dataKey="Serious" fill="#dc3545" name="Serious" barSize={20} />
                <Bar dataKey="Medium" fill="#fd7e14" name="Medium" barSize={20} />
                <Bar dataKey="Low" fill="#198754" name="Low" barSize={20} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="month"
                  padding={{ left: 20, right: 20 }}
                  tick={tickStyle}
                  label={xLabelStyle}
                />
                <YAxis allowDecimals={false} tick={tickStyle} label={yLabelStyle} />
                {/* Line tooltip stays shared so all severity values for the hovered month remain visible. */}
                <Tooltip content={<InjuryTrendTooltip projectName={projectName} dark={dark} />} />
                <Legend verticalAlign="top" align="center" />
                <Line
                  type="monotone"
                  dataKey="Serious"
                  stroke="#dc3545"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Medium"
                  stroke="#fd7e14"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Low"
                  stroke="#198754"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* No Data Display */}
      {!error && !loading && (!chartData || chartData.length === 0) && (
        <div className={`text-center p-5 rounded shadow-sm ${noDataClass}`}>
          <p className={noDataText}>No injury data available for the selected criteria.</p>
        </div>
      )}
    </div>
  );
}

export default InjuryChartForm;
