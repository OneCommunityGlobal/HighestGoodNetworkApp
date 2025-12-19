import { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
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
import ChartTypeToggle from './ChartTypeToggle';
import logger from '../../../services/logService';
import {
  fetchMaterialCostCorrelation,
  setProjectFilter,
  setMaterialTypeFilter,
  setDateRangeFilter,
  resetFilters,
} from '../../../actions/bmdashboard/materialCostCorrelationActions';
import styles from './MaterialCostCorrelationChart.module.css';

// Color palette for material types - accessible colors for light and dark modes
const MATERIAL_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
];

/**
 * Custom Tooltip Component for Scatter Chart
 * Displays project, material type, quantity, cost, and cost per unit information
 * @param {boolean} active - Whether tooltip is active
 * @param {Array} payload - Chart data payload
 * @param {boolean} darkMode - Whether dark mode is enabled
 */
function CustomTooltip({ active, payload, darkMode }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  if (!data) {
    return null;
  }

  return (
    <div
      className={`${styles.customTooltip} ${
        darkMode ? styles.customTooltipDark : styles.customTooltipLight
      }`}
    >
      <div className={styles.tooltipTitle}>{data.projectName}</div>
      <div className={styles.tooltipRow}>
        <strong>Material:</strong> {data.materialTypeName}
      </div>
      <div className={styles.tooltipRow}>
        <strong>Quantity Used:</strong> {data.x} {data.unit}
      </div>
      <div className={styles.tooltipRow}>
        <strong>Total Cost:</strong> ${data.totalCost.toFixed(2)}
      </div>
      <div className={styles.tooltipRow}>
        <strong>Cost per Unit:</strong>{' '}
        {data.costPerUnit !== null ? `$${data.costPerUnit.toFixed(2)}` : 'N/A'}
      </div>
    </div>
  );
}

function MaterialCostCorrelationChart() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const { loading, data, error, filters } = useSelector(
    state => state.materialCostCorrelation || {},
  );

  const [chartType, setChartType] = useState('scatter');
  const chartContainerRef = useRef(null);

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

  // Transform API data for chart with error handling
  const transformedData = useMemo(() => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return null;
      }

      const flattened = [];
      data.forEach(project => {
        // Use optional chaining and provide fallbacks
        if (project?.byMaterialType && Array.isArray(project.byMaterialType)) {
          project.byMaterialType.forEach(material => {
            // Filter out items where quantityUsed is zero or costPerUnit is null
            if (
              material?.quantityUsed > 0 &&
              material?.costPerUnit !== null &&
              material?.costPerUnit !== undefined
            ) {
              flattened.push({
                x: material.quantityUsed || 0,
                y: material.totalCostK || 0,
                projectName: project.projectName || 'Unknown Project',
                materialTypeName: material.materialTypeName || 'Unknown Material',
                unit: material.unit || '',
                totalCost: material.totalCost || 0,
                costPerUnit: material.costPerUnit || 0,
                projectId: project.projectId || '',
                materialTypeId: material.materialTypeId || '',
              });
            }
          });
        }
      });

      return flattened.length > 0 ? flattened : null;
    } catch (transformError) {
      logger.logError(
        new Error(
          `[MaterialCostCorrelation] Data transformation error: ${transformError.message ||
            transformError}`,
        ),
      );
      return null;
    }
  }, [data]);

  // Generate color map for material types
  const colorMap = useMemo(() => {
    if (!transformedData) return {};

    const uniqueMaterialTypes = [...new Set(transformedData.map(item => item.materialTypeName))];
    const map = {};
    uniqueMaterialTypes.forEach((materialType, index) => {
      map[materialType] = MATERIAL_COLORS[index % MATERIAL_COLORS.length];
    });
    return map;
  }, [transformedData]);

  // Prepare data for bar chart (grouped by project) with error handling
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
          `[MaterialCostCorrelation] Bar chart data transformation error: ${transformError.message ||
            transformError}`,
        ),
      );
      return null;
    }
  }, [data]);

  // Get common unit from transformed data (for scatter chart X-axis label)
  const commonUnit = useMemo(() => {
    if (!transformedData || transformedData.length === 0) return '';
    // Get the most common unit
    const units = transformedData.map(item => item.unit);
    const unitCounts = {};
    units.forEach(unit => {
      unitCounts[unit] = (unitCounts[unit] || 0) + 1;
    });
    const sortedUnits = Object.entries(unitCounts).sort((a, b) => b[1] - a[1]);
    return sortedUnits.length > 0 ? sortedUnits[0][0] : '';
  }, [transformedData]);

  // Chart configuration
  const chartConfig = useMemo(() => {
    const textColor = darkMode ? '#f7fafc' : '#1a202c';
    const gridColor = darkMode ? '#4a5568' : '#e2e8f0';

    return {
      textColor,
      gridColor,
      margin: { top: 20, right: 30, left: 20, bottom: 60 },
    };
  }, [darkMode]);

  // Handlers
  const handleChartTypeToggle = newType => {
    setChartType(newType);
  };

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
  const hasData = chartType === 'scatter' ? transformedData : barChartData;

  return (
    <div
      className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}
      ref={chartContainerRef}
    >
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Material Usage vs Cost Correlation</h2>
        <ChartTypeToggle
          currentChartType={chartType}
          onToggle={handleChartTypeToggle}
          darkMode={darkMode}
        />
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
        {!hasData ? (
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
        ) : chartType === 'scatter' ? (
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />
              <XAxis
                type="number"
                dataKey="x"
                name="Quantity"
                label={{
                  value: `Quantity of Materials Used ${commonUnit ? `(${commonUnit})` : ''}`,
                  position: 'insideBottom',
                  offset: -5,
                  fill: chartConfig.textColor,
                }}
                tick={{ fill: chartConfig.textColor }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Cost"
                label={{
                  value: 'Total Material Cost (×1000$)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: chartConfig.textColor,
                }}
                tick={{ fill: chartConfig.textColor }}
              />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Legend />
              {/* Group scatter points by material type */}
              {Object.entries(colorMap).map(([materialType, color]) => {
                const materialData = transformedData.filter(
                  item => item.materialTypeName === materialType,
                );
                return (
                  <Scatter
                    key={materialType}
                    name={materialType}
                    data={materialData}
                    fill={color}
                  />
                );
              })}
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={barChartData} margin={chartConfig.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />
              <XAxis
                dataKey="projectName"
                label={{
                  value: 'Project',
                  position: 'insideBottom',
                  offset: -5,
                  fill: chartConfig.textColor,
                }}
                tick={{ fill: chartConfig.textColor }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                label={{
                  value: 'Total Material Cost (×1000$)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: chartConfig.textColor,
                }}
                tick={{ fill: chartConfig.textColor }}
              />
              <Tooltip
                formatter={(value, name) => [`$${value.toFixed(2)}K`, 'Total Cost']}
                contentStyle={{
                  backgroundColor: darkMode ? '#2d3748' : '#ffffff',
                  border: darkMode ? '1px solid #4a5568' : '1px solid #e2e8f0',
                  color: darkMode ? '#f7fafc' : '#1a202c',
                }}
              />
              <Legend />
              <Bar dataKey="totalCostK" fill="#0088FE" name="Total Cost (×1000$)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend Section */}
      <div className={styles.legendSection}>
        <h3 className={styles.legendTitle}>Chart Information</h3>
        <div className={styles.legendContent}>
          <div className={styles.legendItem}>
            <strong>X-axis:</strong>{' '}
            {chartType === 'scatter'
              ? `Quantity of Materials Used ${commonUnit ? `(${commonUnit})` : ''}`
              : 'Project Names'}
          </div>
          <div className={styles.legendItem}>
            <strong>Y-axis:</strong> Total Material Cost in thousands of dollars (×1000$)
          </div>
          {chartType === 'scatter' && (
            <div className={styles.legendItem}>
              <strong>Colors:</strong> Each color represents a different material type
            </div>
          )}
          <div className={styles.legendItem}>
            <strong>Data Source:</strong> Material usage and purchase records from selected date
            range
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialCostCorrelationChart;
