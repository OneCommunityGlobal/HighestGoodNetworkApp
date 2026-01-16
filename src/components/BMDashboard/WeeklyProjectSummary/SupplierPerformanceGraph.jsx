import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Label,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from 'reactstrap';
import { fetchSupplierProjects, fetchSupplierPerformance } from '../../../actions/summaryDashboard';
import styles from './SupplierPerformanceGraph.module.css';

const getDateRangeOptions = () => {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const lastQuarter = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  return [
    { label: 'ALL', value: 'all', start: '1970-01-01', end: today.toISOString().split('T')[0] },
    {
      label: 'Last 30 Days',
      value: 'last30',
      start: lastMonth.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    },
    {
      label: 'Last 3 Months',
      value: 'last90',
      start: lastQuarter.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    },
    {
      label: 'Last Year',
      value: 'lastYear',
      start: lastYear.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    },
  ];
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles['supplier-performance-tooltip']}>
        <p className={styles['supplier-performance-tooltip-label']}>{label}</p>
        <p style={{ margin: 0, color: '#4CAF50', fontWeight: 'bold' }}>
          On-Time Delivery: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const SupplierPerformanceDashboard = function({ height = 420, onDataLoaded }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const [supplierData, setSupplierData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');

  const chartTheme = {
    textColor: darkMode ? '#e0e0e0' : '#333',
    axisColor: darkMode ? '#a0a0a0' : '#666',
    gridColor: darkMode ? '#364156' : '#E2E8F0',
    barColor: '#4CAF50',
    labelFill: darkMode ? '#ffffff' : '#333',
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await dispatch(fetchSupplierProjects());
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load projects:', err);
        setError('Failed to load projects');
      }
    };
    loadProjects();
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateRangeOptions = getDateRangeOptions();
        const selectedDateObj = dateRangeOptions.find(opt => opt.value === selectedDateRange);

        const data = await dispatch(
          fetchSupplierPerformance({
            projectId: selectedProject,
            startDate: selectedDateObj?.start || '1970-01-01',
            endDate: selectedDateObj?.end || new Date().toISOString().split('T')[0],
          }),
        );

        setSupplierData(Array.isArray(data) ? data : []);
        if (onDataLoaded && typeof onDataLoaded === 'function') {
          onDataLoaded(data);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load supplier performance:', err);
        setError('Failed to load supplier performance');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, selectedDateRange, selectedProject, onDataLoaded]);

  return (
    <div
      className={`${styles['supplier-performance-card']} ${
        darkMode ? styles['supplier-performance-dark-mode'] : ''
      }`}
    >
      <h4 className={styles['supplier-performance-title']}>
        Supplier Performance by On-Time Delivery %
      </h4>

      {/* Filters Row */}
      <div className={styles['supplier-performance-filters']}>
        <div className={styles['supplier-performance-filter-group']}>
          {/* Linked Label to Input via htmlFor and id */}
          <label htmlFor="supplier-date-select">Dates</label>
          <Input
            id="supplier-date-select"
            type="select"
            value={selectedDateRange}
            onChange={e => setSelectedDateRange(e.target.value)}
            className={styles['supplier-performance-select']}
          >
            {getDateRangeOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Input>
        </div>

        <div className={styles['supplier-performance-filter-group']}>
          {/* Linked Label to Input via htmlFor and id */}
          <label htmlFor="supplier-project-select">Project</label>
          <Input
            id="supplier-project-select"
            type="select"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className={styles['supplier-performance-select']}
          >
            <option value="all">ALL Projects</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project._id}
              </option>
            ))}
          </Input>
        </div>
      </div>

      {/* Chart Content */}
      <div className={styles['supplier-performance-content']}>
        {loading && <div className={styles['supplier-performance-loading']}>Loading...</div>}

        {error && <div className={styles['supplier-performance-error']}>{error}</div>}

        {!loading && !error && supplierData.length === 0 && (
          <div className={styles['supplier-performance-empty']}>
            No supplier performance data available.
          </div>
        )}

        {!loading && !error && supplierData.length > 0 && (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={supplierData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={0.3} />

              <XAxis
                dataKey="supplierName"
                interval={0}
                tickMargin={10}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12, fill: chartTheme.textColor, fontWeight: 500 }}
              >
                <Label
                  value="Supplier Name"
                  offset={0}
                  position="insideBottom"
                  style={{
                    textAnchor: 'middle',
                    fontSize: '14px',
                    fill: chartTheme.textColor,
                    fontWeight: 600,
                  }}
                />
              </XAxis>

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: chartTheme.textColor, fontWeight: 500 }}
              >
                <Label
                  value="On-time performance (%)"
                  angle={-90}
                  position="insideLeft"
                  style={{
                    textAnchor: 'middle',
                    fontSize: '14px',
                    fill: chartTheme.textColor,
                    fontWeight: 600,
                  }}
                />
              </YAxis>

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              />

              <Bar
                dataKey="onTimeDeliveryPercentage"
                fill={chartTheme.barColor}
                maxBarSize={60}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="onTimeDeliveryPercentage"
                  position="top"
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fill: chartTheme.labelFill,
                  }}
                  formatter={value => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SupplierPerformanceDashboard;
