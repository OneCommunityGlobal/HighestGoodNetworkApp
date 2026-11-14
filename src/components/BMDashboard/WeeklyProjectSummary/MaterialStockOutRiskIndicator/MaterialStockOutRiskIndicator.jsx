// File version: 1.1.0
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { FolderSearch, Info, PackageOpen } from 'lucide-react';
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

function StockOutRiskEmptyState({ hasSelectedProjects }) {
  const Icon = hasSelectedProjects ? PackageOpen : FolderSearch;

  return (
    <div className={styles.empty} role="status" aria-live="polite">
      <Icon className={styles.emptyIcon} size={48} aria-hidden="true" />
      <h5 className={styles.emptyTitle}>
        {hasSelectedProjects ? 'No stock-out risk data available' : 'No project selected'}
      </h5>
      <p className={styles.emptyMessage}>
        {hasSelectedProjects
          ? 'No estimates are available for the selected projects. Check these prerequisites:'
          : 'Select one or more projects above to view material stock-out risk.'}
      </p>
      <div className={styles.prerequisites}>
        <p className={styles.prerequisitesTitle}>Before viewing this chart:</p>
        <ol>
          <li>Select at least one project.</li>
          <li>Make sure materials are mapped to the selected projects.</li>
          <li>Record material consumption so stock-out estimates can be calculated.</li>
        </ol>
      </div>
    </div>
  );
}

function MaterialStockOutRiskIndicator() {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects);
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [readiness, setReadiness] = useState(null);

  const requestControllerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  const projectOptions = useMemo(() => {
    if (!Array.isArray(projects)) return [];

    return projects
      .filter(project => typeof project?._id === 'string' && project._id.trim())
      .map(project => ({
        label: project.name || `Project ${project._id}`,
        value: project._id,
      }));
  }, [projects]);

  const selectedProjectIds = useMemo(
    () =>
      selectedProjects
        .filter(selected => projectOptions.some(option => option.value === selected.value))
        .map(project => project.value),
    [selectedProjects, projectOptions],
  );
  const hasSelectedProjects = selectedProjectIds.length > 0;

  const fetchData = useCallback(async () => {
    // A previous project's response must not replace data for the current selection.
    requestControllerRef.current?.abort();

    setChartData([]);
    setReadiness(null);
    setError(null);

    if (selectedProjectIds.length === 0) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      setLoading(true);

      const response = await axios.get(ENDPOINTS.BM_MATERIAL_STOCK_OUT_RISK, {
        params: { projectIds: selectedProjectIds.join(','), includeReadiness: 'true' },
        headers: {
          Authorization: localStorage.getItem('token'),
        },
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        // Older backends still return the chart array without readiness metadata.
        const data = response.data;
        setChartData(Array.isArray(data) ? data : data?.chartData || []);
        setReadiness(Array.isArray(data?.readiness) ? data.readiness : null);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.details ||
          err.message ||
          'Failed to load material stock-out risk data';
        setError(errorMessage);
        setChartData([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [selectedProjectIds]);

  useEffect(() => {
    fetchData();
    return () => requestControllerRef.current?.abort();
  }, [fetchData]);

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

  return (
    <div className={`${styles.card} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h4 className={styles.title}>Material Stock-Out Risk Indicator</h4>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="projects-select" className={styles.filterLabel}>
          Projects
        </label>
        <Select
          inputId="projects-select"
          className={styles.select}
          classNamePrefix="select"
          value={selectedProjects}
          onChange={handleProjectChange}
          options={projectOptions}
          placeholder={
            projectOptions.length === 0 ? 'No projects available' : 'Select one or more projects'
          }
          isMulti
          isClearable={true}
          isDisabled={projectOptions.length === 0}
          closeMenuOnSelect={false}
          styles={selectStyles}
          aria-label="Select projects to filter material stock-out risk data"
        />
      </div>

      {hasSelectedProjects && !loading && !error && (
        <section className={styles.readiness} aria-label="Data Readiness Status">
          <h5>Data Readiness Status</h5>
          <details>
            <summary>
              <Info size={16} aria-hidden="true" /> About data readiness
            </summary>
            <p>
              Ready means every mapped material can produce an estimate. Partial means some
              materials lack a material type, positive stock, or a usage rate, or their estimate is
              outside the chart range. Not Configured means no materials are mapped.
            </p>
          </details>
          {readiness?.length > 0 ? (
            <ul>
              {readiness.map(project => (
                <li key={project.projectId}>
                  <strong>
                    {selectedProjects.find(selected => selected.value === project.projectId)?.label}
                  </strong>
                  : {project.status}
                  <p>
                    {project.readyMaterialCount} of {project.materialCount} materials ready
                  </p>
                  {project.missingInputs.map(message => (
                    <p key={message} className={styles.readinessWarning}>
                      {message}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          ) : (
            <p>Data readiness status is unavailable.</p>
          )}
        </section>
      )}

      <div
        className={!hasSelectedProjects ? styles.chartDisabled : undefined}
        role="group"
        aria-label="Material stock-out risk chart"
        aria-disabled={!hasSelectedProjects}
        aria-busy={loading}
      >
        {!hasSelectedProjects ? (
          <StockOutRiskEmptyState hasSelectedProjects={false} />
        ) : loading ? (
          <div className={styles.loading} role="status">
            Loading chart data...
          </div>
        ) : error ? (
          <div className={styles.errorContainer} role="alert">
            <div className={styles.errorIcon} aria-hidden="true">
              ⚠️
            </div>
            <div className={styles.errorContent}>
              <h5 className={styles.errorTitle}>Unable to Load Data</h5>
              <p className={styles.errorMessage}>{error}</p>
              <button type="button" className={styles.retryButton} onClick={fetchData}>
                Retry
              </button>
            </div>
          </div>
        ) : formattedChartData.length > 0 ? (
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
        ) : (
          <StockOutRiskEmptyState hasSelectedProjects />
        )}
      </div>
    </div>
  );
}

export default MaterialStockOutRiskIndicator;
