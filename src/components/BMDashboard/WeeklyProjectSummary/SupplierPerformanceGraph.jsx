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
  Cell,
  ReferenceLine,
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

const performanceColor = (value, target, minimum) => {
  if (value >= target) return '#2e9b50';
  return value >= minimum ? '#e5b325' : '#d64545';
};

export const CustomTooltip = ({ active, payload, label, target = 90 }) => {
  if (active && payload && payload.length) {
    const difference = Number((payload[0].value - target).toFixed(2));
    const { totalDeliveries } = payload[0].payload || {};
    return (
      <div className={styles['supplier-performance-tooltip']}>
        <p className={styles['supplier-performance-tooltip-label']}>{label}</p>
        <p style={{ margin: 0, fontWeight: 'bold' }}>On-Time Delivery: {payload[0].value}%</p>
        <p>
          {difference === 0
            ? 'At target'
            : `${Math.abs(difference)} percentage points ${
                difference > 0 ? 'above' : 'below'
              } target`}
        </p>
        {Number.isFinite(totalDeliveries) && <p>Total deliveries: {totalDeliveries}</p>}
      </div>
    );
  }
  return null;
};

const SupplierPerformanceDashboard = function({ height = 420, onDataLoaded }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const role = useSelector(state => state.auth?.user?.role);
  const canConfigure = role === 'Administrator' || role === 'Owner';
  const [target, setTarget] = useState(90);
  const [minimum, setMinimum] = useState(80);
  const [targetInput, setTargetInput] = useState('90');
  const [minimumInput, setMinimumInput] = useState('80');
  const validSettings =
    targetInput.trim() !== '' &&
    minimumInput.trim() !== '' &&
    Number.isFinite(Number(targetInput)) &&
    Number.isFinite(Number(minimumInput)) &&
    Number(minimumInput) >= 0 &&
    Number(targetInput) <= 100 &&
    Number(minimumInput) < Number(targetInput);

  const applySettings = event => {
    event.preventDefault();
    if (canConfigure && validSettings) {
      setTarget(Number(targetInput));
      setMinimum(Number(minimumInput));
    }
  };

  const [supplierData, setSupplierData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');

  const chartTheme = {
    textColor: darkMode ? '#e0e0e0' : '#333',
    axisColor: darkMode ? '#a0a0a0' : '#666',
    // UPDATE: Set a lighter grey for dark mode so grid lines are clearly visible
    gridColor: darkMode ? '#9CA3AF' : '#E2E8F0',
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

  const aboveTarget = supplierData.filter(item => item.onTimeDeliveryPercentage >= target).length;
  const best = supplierData.reduce(
    (result, item) =>
      !result || item.onTimeDeliveryPercentage > result.onTimeDeliveryPercentage ? item : result,
    null,
  );
  const worst = supplierData.reduce(
    (result, item) =>
      !result || item.onTimeDeliveryPercentage < result.onTimeDeliveryPercentage ? item : result,
    null,
  );

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
                {project.projectName}
              </option>
            ))}
          </Input>
        </div>
      </div>

      {canConfigure && (
        <form onSubmit={applySettings} className={styles['supplier-performance-filters']}>
          <div className={styles['supplier-performance-filter-group']}>
            <label htmlFor="supplier-target">Target (%)</label>
            <Input
              id="supplier-target"
              type="number"
              min="0.01"
              max="100"
              step="any"
              value={targetInput}
              onChange={event => setTargetInput(event.target.value)}
              className={styles['supplier-performance-select']}
            />
          </div>
          <div className={styles['supplier-performance-filter-group']}>
            <label htmlFor="supplier-minimum">Minimum acceptable SLA (%)</label>
            <Input
              id="supplier-minimum"
              type="number"
              min="0"
              max="100"
              step="any"
              value={minimumInput}
              onChange={event => setMinimumInput(event.target.value)}
              className={styles['supplier-performance-select']}
            />
          </div>
          <button type="submit" disabled={!validSettings} className="btn btn-primary">
            Apply
          </button>
          {!validSettings && (
            <p role="alert">Enter percentages from 0 to 100 with minimum SLA below target.</p>
          )}
          <small>Settings apply to this chart while it is open.</small>
        </form>
      )}
      <div className={styles['supplier-performance-legend']} aria-label="Performance thresholds">
        <span>
          <i style={{ background: performanceColor(target, target, minimum) }} />
          Meets target: ? {target}%
        </span>
        <span>
          <i style={{ background: performanceColor(minimum, target, minimum) }} />
          Warning: ? {minimum}% and &lt; {target}%
        </span>
        <span>
          <i style={{ background: '#d64545' }} />
          Below SLA: &lt; {minimum}%
        </span>
      </div>
      {!loading && !error && supplierData.length > 0 && (
        <dl
          className={styles['supplier-performance-summary']}
          aria-label="Supplier performance summary"
        >
          <div>
            <dt>At or above target</dt>
            <dd>{aboveTarget}</dd>
          </div>
          <div>
            <dt>Below target</dt>
            <dd>{supplierData.length - aboveTarget}</dd>
          </div>
          <div>
            <dt>Best-performing supplier</dt>
            <dd>
              {best.supplierName} ({best.onTimeDeliveryPercentage}%)
            </dd>
          </div>
          <div>
            <dt>Worst-performing supplier</dt>
            <dd>
              {worst.supplierName} ({worst.onTimeDeliveryPercentage}%)
            </dd>
          </div>
        </dl>
      )}
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
              {/* Added grid lines: Dotted (3 3) and custom theme color */}
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
                content={<CustomTooltip target={target} />}
                cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              />

              <ReferenceLine
                y={target}
                stroke={darkMode ? '#93c5fd' : '#1d4ed8'}
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{
                  value: `Target ${target}%`,
                  position: 'insideTopRight',
                  fill: chartTheme.textColor,
                }}
              />
              <Bar
                dataKey="onTimeDeliveryPercentage"
                fill="#2e9b50"
                maxBarSize={60}
                radius={[4, 4, 0, 0]}
              >
                {supplierData.map(item => (
                  <Cell
                    key={item.supplierName}
                    fill={performanceColor(item.onTimeDeliveryPercentage, target, minimum)}
                  />
                ))}
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
