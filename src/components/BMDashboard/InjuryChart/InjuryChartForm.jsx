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
import { getInjuryData } from '../../../actions/bmdashboard/injuryActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';

import 'react-datepicker/dist/react-datepicker.css';
import styles from './InjuryChartForm.module.css';

function InjuryChartForm({ dark }) {
  // Chart type toggle state
  const [chartType, setChartType] = useState('line'); // 'bar' or 'line'
  const dispatch = useDispatch();
  const bmProjects = useSelector(state => state.bmProjects || []);
  // Form state
  const [projectId, setProjectId] = useState('all');
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

  // Load projects on mount
  useEffect(() => {
    dispatch(fetchBMProjects()).catch(err => {
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

  // Fetch injury data
  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
      const formattedEndDate = moment(endDate).format('YYYY-MM-DD');

      const response = await getInjuryData(projectId, formattedStartDate, formattedEndDate);
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
  }, [projectId, startDate, endDate]);

  // Handle project change
  const handleProjectChange = e => {
    setProjectId(e.target.value);
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
      <div
        className={`${styles.filterForm} mb-4 p-3  ${
          dark ? styles.wrapperDark : 'bg-white'
        } rounded shadow-sm`}
      >
        <div className="row g-3">
          <div className="col-md-4">
            <FormGroup>
              <Label for="project" className={dark ? styles.wrapperDark : ''}>
                Project
              </Label>
              <Input id="project" type="select" value={projectId} onChange={handleProjectChange}>
                <option value="all">All Projects</option>
                {bmProjects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </div>

          <div className="ol-md-4">
            <FormGroup>
              <Label className={dark ? styles.wrapperDark : ''}>Start Date</Label>
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
              <Label className={dark ? styles.wrapperDark : ''}>End Date</Label>
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
        <div
          className={`${styles.injuryChartContainer} ${
            dark ? styles.wrapperDark : 'bg-white'
          } p-4 rounded shadow-sm`}
        >
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
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="month"
                  padding={{ left: 20, right: 20 }}
                  label={{ value: 'Month', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                  allowDecimals={false}
                  label={{ value: 'Number of Injuries', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend verticalAlign="top" align="center" />
                <Bar dataKey="Serious" fill="#dc3545" name="Serious" barSize={20} />
                <Bar dataKey="Medium" fill="#fd7e14" name="Medium" barSize={20} />
                <Bar dataKey="Low" fill="#198754" name="Low" barSize={20} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="month"
                  padding={{ left: 20, right: 20 }}
                  label={{ value: 'Month', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                  allowDecimals={false}
                  label={{ value: 'Number of Injuries', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
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
        <div className="text-center p-5 bg-white rounded shadow-sm">
          <p className="text-muted">No injury data available for the selected criteria.</p>
        </div>
      )}
    </div>
  );
}

export default InjuryChartForm;
