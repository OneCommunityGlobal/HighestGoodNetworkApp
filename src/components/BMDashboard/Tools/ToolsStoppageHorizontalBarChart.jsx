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
import httpService from '../../../services/httpService';
import logService from '../../../services/logService';
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

export default function ToolsStoppageHorizontalBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const emptyData = [];

  // Responsive height calculation
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gradient responsive chart height scaling based on screen width
  // Scales smoothly from smallest phones (180px) to desktop (300px)
  const getChartHeight = () => {
    if (windowWidth <= 375) {
      // Small phones (iPhone SE, iPhone 12 mini): 180px
      return 180;
    } else if (windowWidth <= 428) {
      // Medium phones (iPhone 12/13/14): 200px
      return 200;
    } else if (windowWidth <= 480) {
      // Large phones: 220px
      return 220;
    } else if (windowWidth <= 768) {
      // Tablets in portrait: 240px
      return 240;
    } else if (windowWidth <= 1024) {
      // Tablets in landscape: 280px
      return 280;
    }
    // Desktop: 300px
    return 300;
  };

  // Gradient responsive maxBarThickness scaling
  const getMaxBarThickness = () => {
    if (windowWidth <= 375) {
      return 15;
    } else if (windowWidth <= 428) {
      return 16;
    } else if (windowWidth <= 480) {
      return 18;
    } else if (windowWidth <= 768) {
      return 20;
    } else if (windowWidth <= 1024) {
      return 22;
    }
    return 25;
  };

  // Gradient responsive categoryPercentage scaling
  const getCategoryPercentage = () => {
    if (windowWidth <= 375) {
      return 0.45;
    } else if (windowWidth <= 428) {
      return 0.47;
    } else if (windowWidth <= 480) {
      return 0.48;
    } else if (windowWidth <= 768) {
      return 0.5;
    } else if (windowWidth <= 1024) {
      return 0.55;
    }
    return 0.6;
  };

  // Gradient responsive barPercentage scaling
  const getBarPercentage = () => {
    if (windowWidth <= 375) {
      return 0.8;
    } else if (windowWidth <= 428) {
      return 0.82;
    } else if (windowWidth <= 480) {
      return 0.84;
    } else if (windowWidth <= 768) {
      return 0.85;
    } else if (windowWidth <= 1024) {
      return 0.87;
    }
    return 0.9;
  };

  // Gradient responsive font size scaling
  const getFontSize = () => {
    if (windowWidth <= 375) {
      return 8;
    } else if (windowWidth <= 428) {
      return 9;
    } else if (windowWidth <= 480) {
      return 9.5;
    } else if (windowWidth <= 768) {
      return 10;
    } else if (windowWidth <= 1024) {
      return 11;
    }
    return 12;
  };

  // Gradient responsive title font size scaling
  const getTitleFontSize = () => {
    if (windowWidth <= 375) {
      return 9;
    } else if (windowWidth <= 428) {
      return 10;
    } else if (windowWidth <= 480) {
      return 10.5;
    } else if (windowWidth <= 768) {
      return 11;
    } else if (windowWidth <= 1024) {
      return 12;
    }
    return 14;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await httpService.get(ENDPOINTS.BM_TOOL_PROJECTS);
        const responseData = response.data;

        // Handle new structured response format
        if (responseData.success === false) {
          setError(responseData.message || 'Failed to load projects.');
          setProjects([]);
          return;
        }

        // Extract data array from structured response
        const projectsData = responseData.data || responseData;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (err) {
        logService.logError(err);
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
        } else if (!err.response) {
          setError('Network error. Please check your connection.');
        } else if (err.response?.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(
            `Failed to load projects. Please try again. (Status: ${err.response?.status ||
              'unknown'})`,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Auto-select first project when projects load
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      const firstProject = projects[0];
      setSelectedProject({
        value: firstProject.projectId,
        label: firstProject.projectName,
      });
    }
  }, [projects, selectedProject]);

  // Fetch tools stoppage data when project or date filters change
  useEffect(() => {
    const fetchToolsStoppageData = async () => {
      // Early return if no project selected
      if (!selectedProject) {
        setData(emptyData);
        return;
      }

      setLoading(true);
      setError(null);
      const formattedStart = startDate ? new Date(startDate).toISOString() : null;
      const formattedEnd = endDate ? new Date(endDate).toISOString() : null;

      try {
        const url = ENDPOINTS.BM_TOOLS_STOPPAGE_BY_PROJECT(
          selectedProject.value,
          formattedStart,
          formattedEnd,
        );
        const response = await httpService.get(url);
        const responseData = response.data;

        // Handle new structured response format
        if (responseData.success === false) {
          setError(responseData.message || 'Failed to load stoppage data.');
          setData(emptyData);
          return;
        }

        // Extract data array from structured response
        const stoppageData = responseData.data || responseData;

        if (stoppageData && Array.isArray(stoppageData) && stoppageData.length > 0) {
          const sortedData = [...stoppageData].map(item => ({
            ...item,
            name: item.toolName || item.name,
          }));
          setData(sortedData);
        } else {
          setData(emptyData);
          // Use message from API if available
          const message =
            responseData.message || 'No tool stoppage reason data found for this project.';
          setError(message);
        }
      } catch (err) {
        logService.logError(err);
        setData(emptyData);

        // Enhanced error handling
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Session expired. Please log in again.');
        } else if (!err.response) {
          setError('Network error. Please check your connection.');
        } else if (err.response?.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(
            `Failed to load tools stoppage reason data. Please try again. (Status: ${err.response
              ?.status || 'unknown'})`,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchToolsStoppageData();
  }, [selectedProject, startDate, endDate]);

  const projectOptions = projects.map(project => ({
    value: project.projectId,
    label: project.projectName,
  }));

  // Format date for display
  const formatDate = date => date?.toISOString().split('T')[0];
  const dateRangeLabel =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '';

  // Consistent react-select styles matching paid-labor-cost pattern
  const selectStyles = {
    control: base => ({
      ...base,
      minHeight: '38px',
      fontSize: '12px',
      backgroundColor: darkMode ? '#253342' : '#fff',
      borderColor: darkMode ? '#2d4059' : '#ccc',
      color: darkMode ? '#ffffff' : '#000',
      boxShadow: 'none',
      borderRadius: '6px',
      '&:hover': {
        borderColor: darkMode ? '#2d4059' : '#999',
      },
    }),
    valueContainer: base => ({
      ...base,
      padding: '2px 8px',
      color: darkMode ? '#ffffff' : '#000',
    }),
    input: base => ({
      ...base,
      margin: '0px',
      padding: '0px',
      color: darkMode ? '#ffffff' : '#000',
    }),
    indicatorsContainer: base => ({
      ...base,
      padding: '0 4px',
    }),
    menu: base => ({
      ...base,
      backgroundColor: darkMode ? '#253342' : '#fff',
      fontSize: '12px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? darkMode
          ? '#e8a71c'
          : '#0d55b3'
        : state.isFocused
        ? darkMode
          ? '#3a506b'
          : '#f0f0f0'
        : darkMode
        ? '#253342'
        : '#fff',
      color: state.isSelected ? (darkMode ? '#000' : '#fff') : darkMode ? '#ffffff' : '#000',
      cursor: 'pointer',
      padding: '8px 12px',
      fontSize: '12px',
      ':active': {
        backgroundColor: darkMode ? '#3a506b' : '#e0e0e0',
      },
    }),
    singleValue: base => ({
      ...base,
      color: darkMode ? '#ffffff' : '#000',
      fontSize: '12px',
    }),
    placeholder: base => ({
      ...base,
      color: darkMode ? '#aaaaaa' : '#666',
      fontSize: '12px',
    }),
    indicatorSeparator: base => ({
      ...base,
      backgroundColor: darkMode ? '#2d4059' : '#ccc',
    }),
    dropdownIndicator: base => ({
      ...base,
      color: darkMode ? '#ffffff' : '#999',
      padding: '4px',
      ':hover': {
        color: darkMode ? '#ffffff' : '#666',
      },
    }),
  };

  // Prepare Chart.js data with responsive bar thickness
  const chartData = {
    labels: data.map(item =>
      item.name.length > 20 ? `${item.name.substring(0, 18)}...` : item.name,
    ),
    datasets: [
      {
        label: 'Used its lifetime',
        data: data.map(item => item.usedForLifetime || 0),
        backgroundColor: '#4589FF',
        maxBarThickness: getMaxBarThickness(),
      },
      {
        label: 'Damaged',
        data: data.map(item => item.damaged || 0),
        backgroundColor: '#FF0000',
        maxBarThickness: getMaxBarThickness(),
      },
      {
        label: 'Lost',
        data: data.map(item => item.lost || 0),
        backgroundColor: '#FFB800',
        maxBarThickness: getMaxBarThickness(),
      },
    ],
  };

  // Chart.js options for horizontal stacked bars with responsive settings
  const chartOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e0e0e0' : '#000',
          font: { size: getFontSize() },
        },
      },
      tooltip: { enabled: true, color: darkMode ? '#FFFFFF' : '#000000' },
      datalabels: {
        display: true,
        color: '#fff',
        font: { weight: 'bold', size: getFontSize() },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: darkMode ? '#364156' : '#e0e0e0' },
        border: {
          color: darkMode ? '#ffffff' : '#000000', // Make axis border visible in dark mode
          width: 1,
        },
        ticks: {
          color: darkMode ? '#ffffff' : '#000', // Brighter color in dark mode for better visibility
          font: { size: getFontSize() },
          maxRotation: 0,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Tools',
          color: darkMode ? '#FFFFFF' : '#000000',
          font: { size: getTitleFontSize() },
        },
        stacked: true,
        grid: { display: false },
        border: {
          color: darkMode ? '#ffffff' : '#000000', // Make axis border visible in dark mode
          width: 1,
        },
        ticks: {
          color: darkMode ? '#ffffff' : '#000', // Brighter color in dark mode for better visibility
          font: { size: getFontSize() },
        },
        categoryPercentage: getCategoryPercentage(),
        barPercentage: getBarPercentage(),
      },
    },
  };

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
            <Button variant="outline-danger" size="sm" onClick={() => setDateRange([null, null])}>
              ✕
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
            styles={selectStyles}
          />
        </Col>
        <Col xs={12} md={2}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setSelectedProject(null);
              setDateRange([null, null]);
            }}
          >
            Reset
          </Button>
        </Col>
      </Row>

      <div className="tools-horizontal-chart-container">
        {error && <div className="tools-chart-error">{error}</div>}
        {loading && <div className="tools-chart-loading">Loading tool availability data...</div>}

        {!loading && selectedProject && data.length > 0 && (
          <div
            style={{
              width: '100%',
              maxWidth: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'stretch',
              position: 'relative',
              backgroundColor: darkMode ? '#2c3344' : '#ffffff',
              borderRadius: '4px',
              padding: '8px',
              /* Allow container to shrink to match donut chart height */
              minHeight: 0,
            }}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              <Bar data={chartData} options={chartOptions} height={getChartHeight()} />
            </div>
          </div>
        )}

        {!loading && selectedProject && data.length === 0 && (
          <div className="tools-chart-empty">
            <p>No data available for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
