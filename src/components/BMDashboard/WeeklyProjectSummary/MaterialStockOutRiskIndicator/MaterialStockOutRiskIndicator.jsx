import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './MaterialStockOutRiskIndicator.module.css';

const CHART_CONFIG = {
  MIN_HEIGHT: 400,
  ROW_HEIGHT: 50,
  MAX_HEIGHT: 1000,
  LEFT_MARGIN: 150,
  DAYS_NO_USAGE_DATA: 999,
};

const RISK_THRESHOLDS = {
  CRITICAL: 5,
  HIGH: 10,
  MEDIUM: 15,
  LOW: 20,
  SAFE: 25,
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div
      className={styles.tooltip}
      role="tooltip"
      aria-label={`Stock-out risk details for ${label}`}
    >
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>
        Days until stock-out: <strong>{data.daysUntilStockOut}</strong>
      </p>
      <p className={styles.tooltipProject}>Project: {data.projectName}</p>
      {data.stockAvailable !== undefined && (
        <p className={styles.tooltipStock}>
          Available: <strong>{data.stockAvailable}</strong> {data.unit || ''}
        </p>
      )}
      {data.averageDailyUsage !== undefined && data.averageDailyUsage > 0 && (
        <p className={styles.tooltipUsage}>
          Avg. daily usage: <strong>{data.averageDailyUsage}</strong> {data.unit || ''}/day
        </p>
      )}
    </div>
  );
}

const getColorByDays = days => {
  if (typeof days !== 'number' || days < 0) {
    return '#32CD32';
  }

  if (days <= RISK_THRESHOLDS.CRITICAL) return '#FF0000';
  if (days <= RISK_THRESHOLDS.HIGH) return '#FF6B35';
  if (days <= RISK_THRESHOLDS.MEDIUM) return '#FFA500';
  if (days <= RISK_THRESHOLDS.LOW) return '#FFD700';
  if (days <= RISK_THRESHOLDS.SAFE) return '#ADFF2F';
  return '#32CD32';
};

function MaterialStockOutRiskIndicator() {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [chartData, setChartData] = useState([]);

  const isMountedRef = useRef(true);
  const cancelTokenSourceRef = useRef(null);
  const isRequestInProgressRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    if (isRequestInProgressRef.current) {
      return;
    }

    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('New request initiated');
    }

    const CancelToken = axios.CancelToken;
    cancelTokenSourceRef.current = CancelToken.source();
    isRequestInProgressRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const selectedProjectIds = selectedProjects
        .map(p => p.value)
        .filter(id => id && typeof id === 'string');

      const params = {};
      if (selectedProjectIds.length > 0) {
        params.projectIds = selectedProjectIds.join(',');
      }

      const response = await axios.get(ENDPOINTS.BM_MATERIAL_STOCK_OUT_RISK, {
        params,
        headers: {
          Authorization: localStorage.getItem('token'),
        },
        cancelToken: cancelTokenSourceRef.current.token,
      });

      if (isMountedRef.current && Array.isArray(response.data)) {
        setChartData(response.data);
      } else if (isMountedRef.current) {
        setChartData([]);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        isRequestInProgressRef.current = false;
        return;
      }

      if (isMountedRef.current) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.details ||
          err.message ||
          'Failed to load material stock-out risk data';
        setError(errorMessage);
        setChartData([]);
      }
    } finally {
      isRequestInProgressRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [selectedProjects]);

  useEffect(() => {
    if ((projects.length > 0 || selectedProjects.length > 0) && !isRequestInProgressRef.current) {
      fetchData();
    } else if (projects.length === 0 && selectedProjects.length === 0) {
      setLoading(false);
    }
  }, [projects, selectedProjects, fetchData]);

  const formattedChartData = useMemo(() => {
    if (!Array.isArray(chartData) || chartData.length === 0) {
      return [];
    }

    return chartData
      .filter(item => {
        if (!item || typeof item !== 'object') return false;
        const days = item.daysUntilStockOut;
        return typeof days === 'number' && days >= 0 && days < CHART_CONFIG.DAYS_NO_USAGE_DATA;
      })
      .map(item => ({
        ...item,
        label: `${item.materialName || 'Unknown'} - ${item.projectName || 'Unknown'}`,
        color: getColorByDays(item.daysUntilStockOut),
      }));
  }, [chartData]);

  const projectOptions = useMemo(() => {
    if (!Array.isArray(projects) || projects.length === 0) {
      return [];
    }

    return projects
      .filter(project => project?._id)
      .map(project => ({
        label: project.name || `Project ${project._id}`,
        value: project._id,
      }));
  }, [projects]);

  const handleProjectChange = selectedOptions => {
    setSelectedProjects(Array.isArray(selectedOptions) ? selectedOptions : []);
  };

  const selectStyles = useMemo(
    () => ({
      control: base => ({
        ...base,
        backgroundColor: darkMode ? '#2c3344' : '#fff',
        borderColor: darkMode ? '#364156' : '#ccc',
        minHeight: '32px',
        fontSize: '12px',
      }),
      menu: base => ({
        ...base,
        backgroundColor: darkMode ? '#2c3344' : '#fff',
        fontSize: '12px',
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
          ? darkMode
            ? '#364156'
            : '#f0f0f0'
          : darkMode
          ? '#2c3344'
          : '#fff',
        color: darkMode ? '#e0e0e0' : '#333',
        fontSize: '12px',
      }),
      multiValue: base => ({
        ...base,
        backgroundColor: darkMode ? '#364156' : '#e6e6e6',
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#e0e0e0' : '#333',
        fontSize: '12px',
      }),
      placeholder: base => ({
        ...base,
        color: darkMode ? '#aaaaaa' : '#999',
        fontSize: '12px',
      }),
    }),
    [darkMode],
  );

  if (loading) {
    return (
      <div
        className={`${styles.card} ${darkMode ? styles.darkMode : ''}`}
        style={{ minHeight: '400px' }}
      >
        <h4 className={styles.title}>Material Stock-Out Risk Indicator</h4>
        <div className={styles.loading}>Loading chart data...</div>
      </div>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <div
        className={`${styles.card} ${darkMode ? styles.darkMode : ''}`}
        style={{ minHeight: '400px' }}
      >
        <h4 className={styles.title}>Material Stock-Out Risk Indicator</h4>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorContent}>
            <h5 className={styles.errorTitle}>Unable to Load Data</h5>
            <p className={styles.errorMessage}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => {
                setError(null);
                fetchData();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h4 className={styles.title}>Material Stock-Out Risk Indicator</h4>
        {selectedProjects.length === 0 && <span className={styles.projectLabel}>Project ALL</span>}
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="projects-select" className={styles.filterLabel}>
          Projects
        </label>
        <Select
          id="projects-select"
          className={styles.select}
          classNamePrefix="select"
          value={selectedProjects}
          onChange={handleProjectChange}
          options={projectOptions}
          placeholder={
            projectOptions.length === 0
              ? 'No projects available'
              : 'Select projects to filter (leave empty for all)'
          }
          isMulti
          isClearable={true}
          isDisabled={projectOptions.length === 0 || loading}
          closeMenuOnSelect={false}
          styles={selectStyles}
          aria-label="Select projects to filter material stock-out risk data"
        />
      </div>

      {formattedChartData.length > 0 ? (
        <div className={styles.chartContainer}>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer
              width="100%"
              height={Math.min(
                Math.max(
                  CHART_CONFIG.MIN_HEIGHT,
                  formattedChartData.length * CHART_CONFIG.ROW_HEIGHT,
                ),
                CHART_CONFIG.MAX_HEIGHT,
              )}
            >
              <BarChart
                layout="vertical"
                data={formattedChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: CHART_CONFIG.LEFT_MARGIN,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  type="number"
                  label={{
                    value: 'Days until Stock-Out',
                    position: 'insideBottom',
                    offset: -5,
                    style: { textAnchor: 'middle', fill: darkMode ? '#e0e0e0' : '#333' },
                  }}
                  tick={{ fill: darkMode ? '#e0e0e0' : '#333', fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: darkMode ? '#e0e0e0' : '#333', fontSize: 11 }}
                  width={140}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="daysUntilStockOut"
                  name="Days until Stock-Out"
                  radius={[0, 4, 4, 0]}
                  aria-label="Material stock-out risk bars"
                >
                  {formattedChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.materialId}-${entry.projectId}-${index}`}
                      fill={entry.color}
                    />
                  ))}
                  <LabelList
                    dataKey="daysUntilStockOut"
                    position="right"
                    style={{ fill: darkMode ? '#e0e0e0' : '#333', fontSize: 11 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendTitle}>Risk Level:</div>
            <div className={styles.legendItems}>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#FF0000' }} />
                <span>Critical (0-5 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#FF6B35' }} />
                <span>High (6-10 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#FFA500' }} />
                <span>Medium (11-15 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#FFD700' }} />
                <span>Low (16-20 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#ADFF2F' }} />
                <span>Safe (21-25 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#32CD32' }} />
                <span>Very Safe (26+ days)</span>
              </div>
            </div>
          </div>
        </div>
      ) : !loading && !error ? (
        <div className={styles.empty} role="status" aria-live="polite">
          <p>
            {selectedProjects.length > 0
              ? 'No material stock-out risk data available for selected projects'
              : 'No material stock-out risk data available. Please select projects to view data.'}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default MaterialStockOutRiskIndicator;
