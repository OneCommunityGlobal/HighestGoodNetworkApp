import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Row, Col, Button } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './ToolsStoppageHorizontalBarChart.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend,
  ChartDataLabels,
);

const CHART_COLORS = {
  usedForLifetime: '#2E7D32',
  damaged: '#C62828',
  lost: '#FFB300',
};

const formatPercentageValue = value => {
  if (value === null || value === undefined) {
    return '0%';
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '0%';
  }

  if (Number.isInteger(numeric)) {
    return `${numeric}%`;
  }

  return `${numeric.toFixed(1)}%`;
};

// Helper function to process API response data
const processResponseData = responseData => {
  if (responseData && responseData.length > 0) {
    return [...responseData].map(item => ({
      ...item,
      name: item.toolName || item.name,
    }));
  }
  return [];
};

// Helper function to fetch stoppage data for a project
const fetchStoppageDataForProject = async (projectId, startDate, endDate) => {
  const url = ENDPOINTS.BM_TOOLS_STOPPAGE_BY_PROJECT(projectId, startDate, endDate);
  const response = await axios.get(url);
  return processResponseData(response.data);
};

// Helper function to format dates for API calls
const formatDatesForAPI = (startDate, endDate) => ({
  formattedStart: startDate ? new Date(startDate).toISOString() : null,
  formattedEnd: endDate ? new Date(endDate).toISOString() : null,
});

// Helper function to handle successful data response
const handleDataResponse = (sortedData, setData, setError, emptyData) => {
  setData(sortedData.length > 0 ? sortedData : emptyData);
  setError(null);
};

// Helper function to handle project selection and data fetching
const handleSelectedProjectData = async (
  selectedProject,
  startDate,
  endDate,
  setData,
  setError,
  emptyData,
) => {
  const { formattedStart, formattedEnd } = formatDatesForAPI(startDate, endDate);
  const sortedData = await fetchStoppageDataForProject(
    selectedProject?.value,
    formattedStart,
    formattedEnd,
  );
  handleDataResponse(sortedData, setData, setError, emptyData);
};

// Helper function to handle first project auto-selection
const handleFirstProjectSelection = async (
  projects,
  setSelectedProject,
  setData,
  setError,
  emptyData,
) => {
  const firstProject = projects[0];
  setSelectedProject({ value: firstProject.projectId, label: firstProject.projectName });
  const sortedData = await fetchStoppageDataForProject(firstProject.projectId, null, null);
  handleDataResponse(sortedData, setData, setError, emptyData);
};

// Helper function to handle data fetching logic
const handleDataFetching = async params => {
  const {
    selectedProject,
    projects,
    startDate,
    endDate,
    setSelectedProject,
    setData,
    setError,
    emptyData,
  } = params;

  if (selectedProject) {
    await handleSelectedProjectData(
      selectedProject,
      startDate,
      endDate,
      setData,
      setError,
      emptyData,
    );
    return;
  }

  if (projects.length > 0) {
    await handleFirstProjectSelection(projects, setSelectedProject, setData, setError, emptyData);
    return;
  }

  setData(emptyData);
  setError(null);
};

// Helper function to truncate long tool names
const truncateToolName = name => (name.length > 20 ? `${name.substring(0, 18)}...` : name);

// Helper function to create chart dataset
const createDataset = (label, dataKey, backgroundColor) => ({
  label,
  data: data => data.map(item => Number(item[dataKey] ?? 0)),
  backgroundColor,
  barThickness: 30,
});

// Helper function to get chart data configuration
const getChartData = data => ({
  labels: data.map(item => truncateToolName(item.name)),
  datasets: [
    {
      label: 'Used its lifetime',
      data: data.map(item => Number(item.usedForLifetime ?? 0)),
      backgroundColor: CHART_COLORS.usedForLifetime,
      barThickness: 30,
    },
    {
      label: 'Damaged',
      data: data.map(item => Number(item.damaged ?? 0)),
      backgroundColor: CHART_COLORS.damaged,
      barThickness: 30,
    },
    {
      label: 'Lost',
      data: data.map(item => Number(item.lost ?? 0)),
      backgroundColor: CHART_COLORS.lost,
      barThickness: 30,
    },
  ],
});

// Helper functions for render conditions
const shouldShowChart = (loading, selectedProject, data) =>
  !loading && selectedProject && data.length > 0;
const shouldShowEmptyState = (loading, selectedProject, data) =>
  !loading && selectedProject && data.length === 0;

// Helper function to get chart configuration
const getChartOptions = darkMode => ({
  indexAxis: 'y',
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: { color: darkMode ? '#e0e0e0' : '#000' },
    },
    tooltip: {
      enabled: true,
      backgroundColor: darkMode ? '#2C3344' : '#FFFFFF',
      titleColor: darkMode ? '#FFFFFF' : '#000000',
      bodyColor: darkMode ? '#FFFFFF' : '#000000',
      callbacks: {
        label: context => {
          const label = context.dataset.label || '';
          const value = context.raw ?? 0;
          return `${label}: ${formatPercentageValue(value)}`;
        },
      },
    },
    datalabels: {
      display: true,
      color: context =>
        context.dataset.backgroundColor === CHART_COLORS.lost ? '#1f1f1f' : '#f7f7f7',
      textStrokeColor: context =>
        context.dataset.backgroundColor === CHART_COLORS.lost ? 'transparent' : '#1f1f1f',
      textStrokeWidth: context => (context.dataset.backgroundColor === CHART_COLORS.lost ? 0 : 1),
      formatter: value => formatPercentageValue(value),
      font: { weight: 'bold', size: 11 },
      anchor: 'center',
      align: 'center',
      clamp: true,
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { color: darkMode ? '#364156' : '#e0e0e0' },
      ticks: {
        color: darkMode ? '#e0e0e0' : '#000',
        callback: value => formatPercentageValue(value),
        maxTicksLimit: 6,
      },
      title: {
        display: true,
        text: 'Percentage of Tools (%)',
        color: darkMode ? '#FFFFFF' : '#000000',
      },
      min: 0,
      suggestedMax: 100,
    },
    y: {
      title: { display: true, text: 'Tools Name', color: darkMode ? '#FFFFFF' : '#000000' },
      stacked: true,
      grid: { display: false },
      ticks: { color: darkMode ? '#e0e0e0' : '#000' },
    },
  },
});

export default function ToolsStoppageHorizontalBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const emptyData = [];

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(ENDPOINTS.BM_TOOL_PROJECTS);
        setProjects(response.data);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchToolsStoppageData = async () => {
      setLoading(true);
      setError(null);

      try {
        await handleDataFetching({
          selectedProject,
          projects,
          startDate,
          endDate,
          setSelectedProject,
          setData,
          setError,
          emptyData,
        });
      } catch (err) {
        setData(emptyData);
        setError('Failed to load tools stoppage reason data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchToolsStoppageData();
  }, [selectedProject, startDate, endDate, projects]);

  const projectOptions = projects.map(project => ({
    value: project.projectId,
    label: project.projectName,
  }));

  // Format date for display
  const formatDate = date => date?.toISOString().split('T')[0];
  const dateRangeLabel =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '';

  const selectDarkStyles = {
    control: base => ({
      ...base,
      backgroundColor: '#2c3344',
      borderColor: '#364156',
    }),
    menu: base => ({
      ...base,
      backgroundColor: '#2c3344',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#364156' : '#2c3344',
      color: '#e0e0e0',
    }),
    singleValue: base => ({
      ...base,
      color: '#e0e0e0',
    }),
    placeholder: base => ({
      ...base,
      color: '#aaaaaa',
    }),
  };

  // ✅ Prepare Chart.js data
  const chartData = getChartData(data);

  // ✅ Chart.js options for horizontal stacked bars
  const chartOptions = getChartOptions(darkMode);

  return (
    <div className={`tools-availability-page ${darkMode ? 'dark-mode' : ''}`}>
      <h3 className={`tools-chart-title ${darkMode ? 'dark-mode' : ''}`}>
        Reason of Stoppage of Tools
      </h3>
      <Row className="mb-3 align-items-center">
        <Col xs={12} md={6}>
          <div className={styles.datepickerWrapper}>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={update => {
                setDateRange(update);
              }}
              placeholderText={dateRangeLabel || 'Filter by Date Range'}
              className={`${styles.datePickerInput} form-control ${darkMode ? 'darkTheme' : ''}`}
              calendarClassName={darkMode ? 'darkThemeCalendar' : 'customCalendar'}
            />
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => {
                setDateRange([null, null]);
                setError(null);
              }}
            >
              Clear
            </Button>
          </div>
        </Col>
        <Col xs={12} md={4}>
          <Select
            className="w-100"
            classNamePrefix="customSelect"
            value={selectedProject}
            onChange={opt => setSelectedProject(opt)}
            options={projectOptions}
            placeholder="Select a project ID to view data"
            isClearable={false}
            isDisabled={projects.length === 0}
            styles={darkMode ? selectDarkStyles : {}}
          />
        </Col>
        <Col xs={12} md={2}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setSelectedProject(null);
              setDateRange([null, null]);
              setData(emptyData);
              setError(null);
            }}
          >
            Reset
          </Button>
        </Col>
      </Row>

      <div className="tools-horizontal-chart-container">
        {error && <div className="tools-chart-error">{error}</div>}
        {loading && <div className="tools-chart-loading">Loading tools stoppage data...</div>}

        {shouldShowChart(loading, selectedProject, data) && (
          <Bar data={chartData} options={chartOptions} height={600} />
        )}

        {shouldShowEmptyState(loading, selectedProject, data) && (
          <div className="tools-chart-empty">
            <p>No data available for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
