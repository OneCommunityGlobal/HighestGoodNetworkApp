import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ENDPOINTS } from '../../../utils/URL';
import { FORECAST_MODES, TRAFFIC_LIGHT_COLORS } from './constants';
import { useUtilizationData } from './hooks/useUtilizationData';
import { useUtilizationInsights } from './hooks/useUtilizationInsights';
import ForecastModeToggle from './ForecastModeToggle';
import InsightsSummaryBar from './InsightsSummaryBar';
import RecommendationPanel from './RecommendationPanel';
import MaintenanceAlertPanel from './MaintenanceAlertPanel';
import ResourceBalancingPanel from './ResourceBalancingPanel';
import ExportReportButton from './ExportReportButton';
import styles from './UtilizationChart.module.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title, Legend, ChartDataLabels);

const getBarColor = trafficLight => TRAFFIC_LIGHT_COLORS[trafficLight] || '#94a3b8';

function UtilizationChart() {
  const [forecastMode, setForecastMode] = useState(FORECAST_MODES.HISTORICAL);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [toolFilter, setToolFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [toolTypes, setToolTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const darkMode = useSelector(state => state.theme.darkMode);

  const { toolsData, loading: chartLoading, error: chartError, fetchData } = useUtilizationData();
  const {
    insights,
    loading: insightsLoading,
    error: insightsError,
    fetchInsights,
  } = useUtilizationInsights();

  const fetchFilterData = useCallback(async () => {
    try {
      const [toolTypesResponse, projectsResponse] = await Promise.all([
        axios.get(ENDPOINTS.BM_TOOL_TYPES, {
          headers: { Authorization: localStorage.getItem('token') },
        }),
        axios.get(`${ENDPOINTS.BM_PROJECTS}Names`, {
          headers: { Authorization: localStorage.getItem('token') },
        }),
      ]);
      setToolTypes(toolTypesResponse.data);
      setProjects(projectsResponse.data);
    } catch {
      toast.error('Failed to load filter options. Please try refreshing the page.');
    }
  }, []);

  useEffect(() => {
    fetchFilterData();
    fetchData({ tool: 'ALL', project: 'ALL', mode: FORECAST_MODES.HISTORICAL });
    fetchInsights({ tool: 'ALL', project: 'ALL' });
  }, [fetchFilterData, fetchData, fetchInsights]);

  const buildParams = useCallback(
    () => ({
      tool: toolFilter,
      project: projectFilter,
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
    }),
    [toolFilter, projectFilter, startDate, endDate],
  );

  const handleApplyClick = () => {
    const params = buildParams();
    fetchData({ ...params, mode: forecastMode });
    fetchInsights(params);
  };

  const handleForecastModeChange = useCallback(
    newMode => {
      setForecastMode(newMode);
      const params = buildParams();
      fetchData({ ...params, mode: newMode });
    },
    [buildParams, fetchData],
  );

  const warningMessage = useMemo(() => toolsData.find(row => row.warning)?.warning || null, [
    toolsData,
  ]);

  const chartData = useMemo(
    () => ({
      labels: toolsData.map(tool => tool.name),
      datasets: [
        {
          label: 'Utilization (%)',
          data: toolsData.map(tool => tool.utilizationRate),
          backgroundColor: toolsData.map(tool => getBarColor(tool.classification?.trafficLight)),
          borderRadius: 6,
        },
        ...(forecastMode !== FORECAST_MODES.HISTORICAL
          ? [
              {
                label: 'Predicted Utilization (%)',
                data: toolsData.map(tool => tool.forecast?.predictedRate ?? null),
                backgroundColor: toolsData.map(tool =>
                  tool.forecast?.predictedClassification
                    ? `${
                        TRAFFIC_LIGHT_COLORS[tool.forecast.predictedClassification.trafficLight]
                      }80`
                    : '#94a3b880',
                ),
                borderRadius: 6,
                borderWidth: 2,
                borderColor: toolsData.map(tool =>
                  tool.forecast?.predictedClassification
                    ? TRAFFIC_LIGHT_COLORS[tool.forecast.predictedClassification.trafficLight]
                    : '#94a3b8',
                ),
              },
            ]
          : []),
      ],
    }),
    [toolsData, forecastMode],
  );

  const trafficLightPlugin = useMemo(
    () => ({
      id: 'trafficLightIndicators',
      afterDraw: chart => {
        const { ctx } = chart;
        const yAxis = chart.scales.y;
        toolsData.forEach((tool, index) => {
          const yPos = yAxis.getPixelForTick(index);
          const color = getBarColor(tool.classification?.trafficLight);
          ctx.beginPath();
          ctx.arc(yAxis.left - 12, yPos, 5, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        });
      },
    }),
    [toolsData],
  );

  const options = useMemo(
    () => ({
      indexAxis: 'y',
      responsive: true,
      layout: { padding: { left: 20 } },
      plugins: {
        legend: {
          labels: { color: darkMode ? '#ffffff' : '#333' },
        },
        datalabels: {
          color: darkMode ? '#ffffff' : '#333',
          anchor: 'end',
          align: 'end',
          font: { size: 12 },
          formatter: (value, context) => {
            if (context.datasetIndex === 1) {
              const tool = toolsData[context.dataIndex];
              return tool?.forecast ? `\u2192 ${tool.forecast.predictedRate}%` : '';
            }
            const tool = toolsData[context.dataIndex];
            return tool ? `${tool.downtime} hrs` : '';
          },
        },
        tooltip: {
          callbacks: {
            label: context => {
              const tool = toolsData[context.dataIndex];
              if (!tool) return '';
              if (context.datasetIndex === 0) {
                return `Utilization: ${tool.utilizationRate}% (${tool.classification?.label ||
                  'N/A'})`;
              }
              if (context.datasetIndex === 1 && tool.forecast) {
                return `Predicted: ${tool.forecast.predictedRate}% (${tool.forecast.confidence} confidence)`;
              }
              return '';
            },
            afterLabel: context => {
              const tool = toolsData[context.dataIndex];
              if (context.datasetIndex === 0 && tool) {
                return `Downtime: ${tool.downtime} hrs`;
              }
              return '';
            },
          },
        },
      },
      scales: {
        x: {
          max: 100,
          title: {
            display: true,
            text: 'Time (%)',
            color: darkMode ? '#ffffff' : '#333',
          },
          ticks: { color: darkMode ? '#ffffff' : '#333' },
          grid: { color: darkMode ? '#c7c7c7' : '#bebebe' },
        },
        y: {
          ticks: {
            autoSkip: false,
            color: darkMode ? '#ffffff' : '#333',
          },
          grid: { color: darkMode ? '#c7c7c7' : '#bebebe' },
        },
      },
    }),
    [darkMode, toolsData],
  );

  return (
    <div className={`${styles.utilizationChartContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h2 className={styles.chartTitle}>Tool Utilization Analysis</h2>

      <div className={styles.filters}>
        <select
          value={toolFilter}
          onChange={e => setToolFilter(e.target.value)}
          className={styles.select}
          aria-label="Filter by tool type"
        >
          <option value="ALL">All Tools</option>
          {toolTypes.map(toolType => (
            <option key={toolType._id} value={toolType._id}>
              {toolType.name}
            </option>
          ))}
        </select>

        <select
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
          className={styles.select}
          aria-label="Filter by project"
        >
          <option value="ALL">All Projects</option>
          {projects.map(project => (
            <option key={project.projectId} value={project.projectId}>
              {project.projectName}
            </option>
          ))}
        </select>

        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          placeholderText="Start Date"
          maxDate={endDate || new Date()}
          className={styles.datepickerWrapper}
          aria-label="Start date"
        />

        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          placeholderText="End Date"
          minDate={startDate || undefined}
          maxDate={new Date()}
          className={styles.datepickerWrapper}
          aria-label="End date"
        />

        <button type="button" onClick={handleApplyClick} className={styles.button}>
          Apply
        </button>
      </div>

      <ForecastModeToggle
        value={forecastMode}
        onChange={handleForecastModeChange}
        darkMode={darkMode}
      />

      {forecastMode === FORECAST_MODES.FORECAST_FULL && warningMessage && (
        <div className={styles.warningBanner} role="alert">
          {warningMessage}
        </div>
      )}

      {!insightsLoading && insights.summary && <InsightsSummaryBar summary={insights.summary} />}

      {chartLoading && (
        <div className={styles.loadingContainer} role="status" aria-live="polite">
          <div className={styles.spinner} />
          <span className={styles.srOnly}>Loading utilization data...</span>
        </div>
      )}

      {!chartLoading && chartError && (
        <div className={styles.utilizationChartError} role="alert">
          {chartError}
        </div>
      )}

      {!chartLoading && !chartError && toolsData.length === 0 && (
        <div className={styles.emptyMessage}>
          No utilization data available for the selected filters.
        </div>
      )}

      {!chartLoading && !chartError && toolsData.length > 0 && (
        <Bar data={chartData} options={options} plugins={[trafficLightPlugin]} />
      )}

      {!insightsLoading && !insightsError && (
        <div className={styles.insightsPanelsGrid}>
          <RecommendationPanel recommendations={insights.recommendations} />
          <MaintenanceAlertPanel alerts={insights.maintenanceAlerts} />
          <ResourceBalancingPanel suggestions={insights.resourceBalancing} />
        </div>
      )}

      <ExportReportButton
        tool={toolFilter}
        project={projectFilter}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}

export default UtilizationChart;
