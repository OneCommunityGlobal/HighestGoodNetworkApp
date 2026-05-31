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
import Select from 'react-select';
import { fetchSupplierProjects, fetchSupplierPerformance } from '../../../actions/summaryDashboard';
import styles from './SupplierPerformanceGraph.module.css';
import { buildChartSelectStyles } from './sharedSelectStyles';

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
    gridColor: darkMode ? '#9CA3AF' : '#E2E8F0',
    barColor: '#4CAF50',
    labelFill: darkMode ? '#ffffff' : '#333',
  };

  const selectStyles = buildChartSelectStyles(darkMode);

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

  // Build react-select options
  const dateOptions = getDateRangeOptions().map(opt => ({ value: opt.value, label: opt.label }));
  const selectedDateOption =
    dateOptions.find(opt => opt.value === selectedDateRange) || dateOptions[0];

  const projectOptions = [
    { value: 'all', label: 'ALL Projects' },
    ...projects.map(p => ({ value: p._id, label: p._id })),
  ];
  const selectedProjectOption =
    projectOptions.find(opt => opt.value === selectedProject) || projectOptions[0];

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
          <span className={styles['supplier-performance-label']} id="supplier-date-label">
            Dates
          </span>
          <Select
            inputId="supplier-date-select"
            aria-labelledby="supplier-date-label"
            options={dateOptions}
            value={selectedDateOption}
            onChange={opt => setSelectedDateRange(opt.value)}
            styles={selectStyles}
            isSearchable={false}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
          />
        </div>

        <div className={styles['supplier-performance-filter-group']}>
          <span className={styles['supplier-performance-label']} id="supplier-project-label">
            Project
          </span>
          <Select
            inputId="supplier-project-select"
            aria-labelledby="supplier-project-label"
            options={projectOptions}
            value={selectedProjectOption}
            onChange={opt => setSelectedProject(opt.value)}
            styles={selectStyles}
            isSearchable={false}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
          />
        </div>
      </div>

      {/* Chart Content */}
      <div className={styles['supplier-performance-content']}>
        {loading && <div className={styles['supplier-performance-loading']}>Loading...</div>}

        {error && <div className={styles['supplier-performance-error']}>{error}</div>}

        {loading === false && error === null && supplierData.length === 0 && (
          <div className={styles['supplier-performance-empty']}>
            No supplier performance data available.
          </div>
        )}

        {loading === false && error === null && supplierData.length > 0 && (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={supplierData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} opacity={0.5} />

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
