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
      const formattedStart = startDate ? new Date(startDate).toISOString() : null;
      const formattedEnd = endDate ? new Date(endDate).toISOString() : null;

      try {
        if (selectedProject) {
          const url = ENDPOINTS.BM_TOOLS_STOPPAGE_BY_PROJECT(
            selectedProject?.value,
            formattedStart,
            formattedEnd,
          );
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            const sortedData = [...responseData].map(item => ({
              ...item,
              name: item.toolName || item.name,
            }));
            setData(sortedData);
          } else {
            setData(emptyData);
            setError('No tool stoppage reason data found for this project.');
          }
        } else if (projects.length > 0) {
          const firstProject = projects[0];
          setSelectedProject({ value: firstProject.projectId, label: firstProject.projectName });
          const url = ENDPOINTS.BM_TOOLS_STOPPAGE_BY_PROJECT(firstProject.projectId, null, null);
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            const sortedData = [...responseData].map(item => ({
              ...item,
              name: item.toolName || item.name,
            }));
            setData(sortedData);
          } else {
            setData(emptyData);
          }
        } else {
          setData(emptyData);
        }
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
  const chartData = {
    labels: data.map(item =>
      item.name.length > 20 ? `${item.name.substring(0, 18)}...` : item.name,
    ),
    datasets: [
      {
        label: 'Used its lifetime',
        data: data.map(item => item.usedForLifetime || 0),
        backgroundColor: '#4589FF',
        barThickness: 30,
      },
      {
        label: 'Damaged',
        data: data.map(item => item.damaged || 0),
        backgroundColor: '#FF0000',
        barThickness: 30,
      },
      {
        label: 'Lost',
        data: data.map(item => item.lost || 0),
        backgroundColor: '#FFB800',
        barThickness: 30,
      },
    ],
  };

  // ✅ Chart.js options for horizontal stacked bars
  const chartOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: darkMode ? '#e0e0e0' : '#000' },
      },
      tooltip: { enabled: true, color: darkMode ? '#FFFFFF' : '#000000' },
      datalabels: {
        display: true,
        color: '#fff',
        font: { weight: 'bold' },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: darkMode ? '#364156' : '#e0e0e0' },
        ticks: { color: darkMode ? '#e0e0e0' : '#000' },
      },
      y: {
        title: { display: true, text: 'Tools', color: darkMode ? '#FFFFFF' : '#000000' },
        stacked: true,
        grid: { display: false },
        ticks: { color: darkMode ? '#e0e0e0' : '#000' },
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
          <Bar data={chartData} options={chartOptions} height={600} />
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
