import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';
import { BiErrorCircle, BiRefresh } from 'react-icons/bi';
import FilterPanel from './FilterPanel';
import logger from '../../../services/logService';
import {
  fetchMaterialCostCorrelation,
  setProjectFilter,
  setMaterialTypeFilter,
  setDateRangeFilter,
  resetFilters,
} from '../../../actions/bmdashboard/materialCostCorrelationActions';
import styles from './MaterialCostCorrelationChart.module.css';

/**
 * Custom Tooltip Component for Combined Chart
 * Displays project name, total cost, and quantity used
 * @param {boolean} active - Whether tooltip is active
 * @param {Array} payload - Chart data payload
 * @param {boolean} darkMode - Whether dark mode is enabled
 */
function CustomTooltip({ active, payload, darkMode }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0]?.payload;
  if (!data) {
    return null;
  }

  // Find cost and quantity from payload
  const costPayload = payload.find(p => p.dataKey === 'totalCostK');
  const quantityPayload = payload.find(p => p.dataKey === 'quantityUsed');

  return (
    <div
      className={`${styles.customTooltip} ${
        darkMode ? styles.customTooltipDark : styles.customTooltipLight
      }`}
    >
      <div className={styles.tooltipTitle}>{data.projectName}</div>
      {costPayload && (
        <div className={styles.tooltipRow}>
          <strong>Total Material Cost:</strong> ${(costPayload.value * 1000).toFixed(2)}
        </div>
      )}
      {quantityPayload && (
        <div className={styles.tooltipRow}>
          <strong>Quantity Used:</strong> {quantityPayload.value.toFixed(2)}
        </div>
      )}
    </div>
  );
}

function MaterialCostCorrelationChart() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const { loading, data, error, filters } = useSelector(
    state => state.materialCostCorrelation || {},
  );

  const chartContainerRef = useRef(null);
  // Track the actual rendered container width so breakpoints work correctly
  // whether the chart is full-width or inside a narrow grid column.
  const [containerWidth, setContainerWidth] = useState(400);

  useEffect(() => {
    if (!chartContainerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    dispatch(
      fetchMaterialCostCorrelation(
        filters.selectedProjects || [],
        filters.selectedMaterialTypes || [],
        filters.startDate,
        filters.endDate,
      ),
    );
  }, [
    dispatch,
    filters.selectedProjects,
    filters.selectedMaterialTypes,
    filters.startDate,
    filters.endDate,
  ]);

  // Prepare data for combined chart (grouped by project) with error handling
  const barChartData = useMemo(() => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return null;
      }

      return data.map(project => ({
        projectName: project?.projectName || 'Unknown Project',
        totalCostK: project?.totals?.totalCostK || 0,
        quantityUsed: project?.totals?.quantityUsed || 0,
      }));
    } catch (transformError) {
      logger.logError(
        new Error(
          `[MaterialCostCorrelation] Chart data transformation error: ${transformError.message ||
            transformError}`,
        ),
      );
      return null;
    }
  }, [data]);

  // Chart configuration — breakpoints use the actual rendered container width,
  // not the window width, so the chart looks correct inside a narrow grid column.
  // narrow < 500 px  (column card on any desktop or a small phone)
  // medium < 700 px  (half-width layout or portrait tablet)
  // wide   ≥ 700 px  (full-width on desktop)
  const chartConfig = useMemo(() => {
    const textColor = darkMode ? '#f7fafc' : '#1a202c';
    const gridColor = darkMode ? '#4a5568' : '#e2e8f0';

    const isNarrow = containerWidth < 500;
    const isMedium = containerWidth < 700;

    let margin;
    if (isNarrow) {
      margin = { top: 10, right: 40, left: 40, bottom: 90 };
    } else if (isMedium) {
      margin = { top: 10, right: 50, left: 50, bottom: 90 };
    } else {
      margin = { top: 10, right: 60, left: 60, bottom: 80 };
    }

    const dataLength = barChartData?.length || 0;
    let xAxisInterval;
    let xAxisAngle;
    let xAxisHeight;
    let xAxisTickFontSize;
    let xAxisMaxNameLength;

    if (isNarrow) {
      // Vertical labels + aggressive skipping to prevent label pile-up
      xAxisAngle = -90;
      xAxisHeight = 90;
      xAxisTickFontSize = 10;
      xAxisMaxNameLength = 8;
      xAxisInterval = dataLength > 5 ? Math.ceil(dataLength / 5) - 1 : 0;
    } else if (isMedium) {
      xAxisAngle = -90;
      xAxisHeight = 85;
      xAxisTickFontSize = 11;
      xAxisMaxNameLength = 10;
      xAxisInterval = dataLength > 8 ? Math.ceil(dataLength / 8) - 1 : 0;
    } else {
      xAxisAngle = -45;
      xAxisHeight = 100;
      xAxisTickFontSize = 12;
      xAxisMaxNameLength = 15;
      xAxisInterval = dataLength > 12 ? Math.ceil(dataLength / 12) - 1 : 0;
    }

    const yAxisWidth = isNarrow ? 44 : isMedium ? 52 : 64;
    const shortYAxisLabels = isNarrow;

    return {
      textColor,
      gridColor,
      margin,
      xAxisInterval,
      xAxisAngle,
      xAxisHeight,
      xAxisTickFontSize,
      xAxisMaxNameLength,
      yAxisWidth,
      shortYAxisLabels,
    };
  }, [darkMode, containerWidth, barChartData?.length]);

  // Handlers
  const handleProjectChange = projectIds => {
    dispatch(setProjectFilter(projectIds));
  };

  const handleMaterialTypeChange = materialTypeIds => {
    dispatch(setMaterialTypeFilter(materialTypeIds));
  };

  const handleDateRangeChange = (startDate, endDate) => {
    dispatch(setDateRangeFilter(startDate, endDate));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Determine error type from error message
  const getErrorType = errorMessage => {
    if (!errorMessage) return 'unknown';
    const message = errorMessage.toLowerCase();
    if (message.includes('session') || message.includes('expired') || message.includes('log in')) {
      return 'authentication';
    }
    if (message.includes('permission') || message.includes('access')) {
      return 'permission';
    }
    if (message.includes('network') || message.includes('connect')) {
      return 'network';
    }
    if (message.includes('start date') || message.includes('end date')) {
      return 'validation';
    }
    return 'general';
  };

  const errorType = error ? getErrorType(error) : null;

  // Render error state
  if (error && errorType !== 'validation') {
    const shouldShowRetry = errorType !== 'permission' && errorType !== 'authentication';
    const errorIcon = <BiErrorCircle className={styles.errorIcon} />;

    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            {errorIcon}
            <p className={styles.errorText}>{error}</p>
            {errorType === 'authentication' && (
              <p className={styles.errorHint}>
                You will be redirected to the login page shortly...
              </p>
            )}
            {errorType === 'permission' && (
              <p className={styles.errorHint}>
                This error is not transient. Please contact an administrator for assistance.
              </p>
            )}
            {errorType === 'network' && (
              <p className={styles.errorHint}>
                Please check your internet connection and try again.
              </p>
            )}
            {errorType === 'general' && (
              <p className={styles.errorHint}>
                If this problem persists, please try different filters or contact support.
              </p>
            )}
          </div>
          {shouldShowRetry && (
            <button
              type="button"
              onClick={() =>
                dispatch(
                  fetchMaterialCostCorrelation(
                    filters.selectedProjects || [],
                    filters.selectedMaterialTypes || [],
                    filters.startDate,
                    filters.endDate,
                  ),
                )
              }
              className={styles.retryButton}
            >
              <BiRefresh className={styles.retryIcon} />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Determine if we have data to display
  const hasData = barChartData;

  return (
    <div
      className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}
      ref={chartContainerRef}
    >
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Material Usage vs Cost Correlation</h2>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        selectedProjects={filters.selectedProjects || []}
        selectedMaterialTypes={filters.selectedMaterialTypes || []}
        startDate={filters.startDate}
        endDate={filters.endDate}
        onProjectChange={handleProjectChange}
        onMaterialTypeChange={handleMaterialTypeChange}
        onDateRangeChange={handleDateRangeChange}
        onResetFilters={handleResetFilters}
        darkMode={darkMode}
      />

      {/* Chart Section */}
      <div className={styles.chartContainer}>
        {hasData ? (
          <ResponsiveContainer
            width="100%"
            height={containerWidth < 500 ? 400 : containerWidth < 700 ? 450 : 500}
          >
            <ComposedChart data={barChartData} margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />
              <XAxis
                dataKey="projectName"
                tick={{
                  fill: chartConfig.textColor,
                  fontSize: chartConfig.xAxisTickFontSize,
                }}
                angle={chartConfig.xAxisAngle}
                textAnchor="end"
                height={chartConfig.xAxisHeight}
                interval={chartConfig.xAxisInterval}
                tickFormatter={value => {
                  const maxLength = chartConfig.xAxisMaxNameLength;
                  if (value && value.length > maxLength) {
                    return `${value.substring(0, maxLength)}...`;
                  }
                  return value || '';
                }}
              />
              <YAxis
                yAxisId="cost"
                label={{
                  value: chartConfig.shortYAxisLabels
                    ? 'Cost (×1k$)'
                    : 'Total Material Cost (×1000$)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 8,
                  style: {
                    textAnchor: 'middle',
                    fill: chartConfig.textColor,
                    fontSize: chartConfig.shortYAxisLabels ? 10 : 12,
                  },
                }}
                tick={{
                  fill: chartConfig.textColor,
                  fontSize: chartConfig.shortYAxisLabels ? 10 : 12,
                }}
                width={chartConfig.yAxisWidth}
              />
              <YAxis
                yAxisId="quantity"
                orientation="right"
                label={{
                  value: chartConfig.shortYAxisLabels ? 'Qty Used' : 'Quantity of Materials Used',
                  angle: 90,
                  position: 'insideRight',
                  offset: 8,
                  style: {
                    textAnchor: 'middle',
                    fill: chartConfig.textColor,
                    fontSize: chartConfig.shortYAxisLabels ? 10 : 12,
                  },
                }}
                tick={{
                  fill: chartConfig.textColor,
                  fontSize: chartConfig.shortYAxisLabels ? 10 : 12,
                }}
                width={chartConfig.yAxisWidth}
              />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Legend />
              <Bar
                yAxisId="cost"
                dataKey="totalCostK"
                fill="#0088FE"
                name="Total Material Cost (×1000$)"
              />
              <Line
                yAxisId="quantity"
                type="monotone"
                dataKey="quantityUsed"
                stroke="#FF8042"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Quantity of Materials Used"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noDataContainer}>
            <p className={styles.noDataText}>No data available for selected filters</p>
            <p className={styles.noDataHint}>
              Try expanding your date range or selecting different projects or material types.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className={styles.resetFiltersButton}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaterialCostCorrelationChart;
