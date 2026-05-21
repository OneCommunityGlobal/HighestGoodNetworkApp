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
import PropTypes from 'prop-types';

/**
 * Custom Tooltip Component for Combined Chart
 * Displays project name, total cost, and quantity used
 * @param {boolean} active - Whether tooltip is active
 * @param {Array} payload - Chart data payload
 * @param {boolean} darkMode - Whether dark mode is enabled
 */
function CustomTooltip({ active, payload, darkMode }) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0]?.payload;
  if (!data) {
    return null;
  }

  const costPayload = payload.find(p => p.dataKey === 'totalCostK');
  const quantityPayload = payload.find(p => p.dataKey === 'quantityUsed');

  return (
    <div
      className={`${styles.customTooltip} ${
        darkMode ? styles.customTooltipDark : styles.customTooltipLight
      }`}
    >
      <div className={styles.tooltipTitle}>{data.materialTypeName}</div>
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
      <div className={styles.tooltipHint}>
        <strong>Cost per Unit:</strong> $
        {data.costPerUnit != null ? data.costPerUnit.toFixed(2) : '0.00'}
      </div>
    </div>
  );
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string,
      value: PropTypes.number,
      payload: PropTypes.shape({
        materialTypeName: PropTypes.string,
      }),
    }),
  ),
  darkMode: PropTypes.bool,
};

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  darkMode: false,
};

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

function getXAxisInterval(isNarrow, isMedium, dataLength) {
  if (isNarrow) return dataLength > 5 ? Math.ceil(dataLength / 5) - 1 : 0;
  if (isMedium) return dataLength > 8 ? Math.ceil(dataLength / 8) - 1 : 0;
  return dataLength > 12 ? Math.ceil(dataLength / 12) - 1 : 0;
}

function getXAxisConfig(isNarrow, isMedium, dataLength) {
  const xAxisInterval = getXAxisInterval(isNarrow, isMedium, dataLength);
  if (isNarrow) {
    return {
      xAxisAngle: -90,
      xAxisHeight: 90,
      xAxisTickFontSize: 10,
      xAxisMaxNameLength: 8,
      xAxisInterval,
    };
  }
  if (isMedium) {
    return {
      xAxisAngle: -90,
      xAxisHeight: 85,
      xAxisTickFontSize: 11,
      xAxisMaxNameLength: 10,
      xAxisInterval,
    };
  }
  return {
    xAxisAngle: -45,
    xAxisHeight: 100,
    xAxisTickFontSize: 12,
    xAxisMaxNameLength: 15,
    xAxisInterval,
  };
}

function getMarginConfig(isNarrow, isMedium) {
  if (isNarrow) return { top: 10, right: 40, left: 40, bottom: 90 };
  if (isMedium) return { top: 10, right: 50, left: 50, bottom: 90 };
  return { top: 10, right: 60, left: 60, bottom: 80 };
}

function getYAxisWidth(isNarrow, isMedium) {
  if (isNarrow) return 44;
  if (isMedium) return 52;
  return 64;
}

function getChartHeight(width) {
  if (width < 500) return 400;
  if (width < 700) return 450;
  return 500;
}

function formatTickValue(value, maxLength) {
  if (!value) return '';
  if (value.length > maxLength) return `${value.substring(0, maxLength)}...`;
  return value;
}

function getYAxisProps(shortYAxisLabels, textColor, yAxisWidth) {
  const fontSize = shortYAxisLabels ? 10 : 12;
  const tick = { fill: textColor, fontSize };
  return {
    costLabel: {
      value: shortYAxisLabels ? 'Cost (×1k$)' : 'Total Material Cost (×1000$)',
      angle: -90,
      position: 'insideLeft',
      offset: 8,
      style: { textAnchor: 'middle', fill: textColor, fontSize },
    },
    quantityLabel: {
      value: shortYAxisLabels ? 'Qty Used' : 'Quantity of Materials Used',
      angle: 90,
      position: 'insideRight',
      offset: 8,
      style: { textAnchor: 'middle', fill: textColor, fontSize },
    },
    tick,
    width: yAxisWidth,
  };
}

function ErrorDisplay({ error, errorType, darkMode, onRetry }) {
  const shouldShowRetry = errorType !== 'permission' && errorType !== 'authentication';
  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <BiErrorCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          {errorType === 'authentication' && (
            <p className={styles.errorHint}>You will be redirected to the login page shortly...</p>
          )}
          {errorType === 'permission' && (
            <p className={styles.errorHint}>
              This error is not transient. Please contact an administrator for assistance.
            </p>
          )}
          {errorType === 'network' && (
            <p className={styles.errorHint}>Please check your internet connection and try again.</p>
          )}
          {errorType === 'general' && (
            <p className={styles.errorHint}>
              If this problem persists, please try different filters or contact support.
            </p>
          )}
        </div>
        {shouldShowRetry && (
          <button type="button" onClick={onRetry} className={styles.retryButton}>
            <BiRefresh className={styles.retryIcon} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

ErrorDisplay.propTypes = {
  error: PropTypes.string.isRequired,
  errorType: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  onRetry: PropTypes.func.isRequired,
};

ErrorDisplay.defaultProps = {
  darkMode: false,
};

function MaterialCostCorrelationChart() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const { loading, data, error, filters } = useSelector(
    state => state.materialCostCorrelation || {},
  );

  const chartContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(400);

  useEffect(() => {
    if (!chartContainerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

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

  const barChartData = useMemo(() => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return null;
      }
      // Flatten byMaterialType across all projects
      const materialMap = new Map();
      data.forEach(project => {
        (project.byMaterialType || []).forEach(mat => {
          const key = mat.materialTypeName || mat.materialTypeId;
          if (!materialMap.has(key)) {
            materialMap.set(key, {
              materialTypeName: key,
              quantityUsed: 0,
              totalCostK: 0,
              costPerUnit: mat.costPerUnit || 0,
            });
          }
          const existing = materialMap.get(key);
          existing.quantityUsed += mat.quantityUsed || 0;
          existing.totalCostK += mat.totalCostK || 0;
        });
      });
      return Array.from(materialMap.values());
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

  const chartConfig = useMemo(() => {
    const textColor = darkMode ? '#f7fafc' : '#1a202c';
    const gridColor = darkMode ? '#4a5568' : '#e2e8f0';
    const isNarrow = containerWidth < 500;
    const isMedium = containerWidth < 700;
    const margin = getMarginConfig(isNarrow, isMedium);
    const dataLength = barChartData?.length || 0;
    const {
      xAxisAngle,
      xAxisHeight,
      xAxisTickFontSize,
      xAxisMaxNameLength,
      xAxisInterval,
    } = getXAxisConfig(isNarrow, isMedium, dataLength);
    const yAxisWidth = getYAxisWidth(isNarrow, isMedium);
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

  const errorType = error ? getErrorType(error) : null;

  if (error && errorType !== 'validation') {
    return (
      <ErrorDisplay
        error={error}
        errorType={errorType}
        darkMode={darkMode}
        onRetry={() =>
          dispatch(
            fetchMaterialCostCorrelation(
              filters.selectedProjects || [],
              filters.selectedMaterialTypes || [],
              filters.startDate,
              filters.endDate,
            ),
          )
        }
      />
    );
  }

  const hasData = barChartData;
  const yAxisProps = getYAxisProps(
    chartConfig.shortYAxisLabels,
    chartConfig.textColor,
    chartConfig.yAxisWidth,
  );

  return (
    <div
      className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}
      ref={chartContainerRef}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Material Usage vs Cost Correlation</h2>
      </div>

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

      <div className={styles.chartContainer}>
        {hasData ? (
          <ResponsiveContainer width="100%" height={getChartHeight(containerWidth)}>
            <ComposedChart data={barChartData} margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />
              <XAxis
                dataKey="materialTypeName"
                tick={{
                  fill: chartConfig.textColor,
                  fontSize: chartConfig.xAxisTickFontSize,
                }}
                angle={chartConfig.xAxisAngle}
                textAnchor="end"
                height={chartConfig.xAxisHeight}
                interval={chartConfig.xAxisInterval}
                tickFormatter={value => formatTickValue(value, chartConfig.xAxisMaxNameLength)}
              />
              <YAxis
                yAxisId="cost"
                label={yAxisProps.costLabel}
                tick={yAxisProps.tick}
                width={yAxisProps.width}
              />
              <YAxis
                yAxisId="quantity"
                orientation="right"
                label={yAxisProps.quantityLabel}
                tick={yAxisProps.tick}
                width={yAxisProps.width}
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
