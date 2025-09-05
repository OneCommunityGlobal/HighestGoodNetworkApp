import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../../../utils/URL';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Button, Row, Col } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import './ToolsRentalChartStyles.css';
import { color } from 'd3';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const ToolsRentalCostLineChart = () => {
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
        const response = await axios.get(ENDPOINTS.GET_BM_PROJECTS);
        setProjects(response.data.projects || response.data);
      } catch (err) {
        // Error logging should be replaced with proper logging service
        // eslint-disable-next-line no-console
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchToolsRentalCostData = async () => {
      setLoading(true);
      setError(null);
      const formattedStart = startDate ? new Date(startDate).toISOString() : null;
      const formattedEnd = endDate ? new Date(endDate).toISOString() : null;

      try {
        // If we have a specific project ID, fetch data for that project
        if (selectedProject) {
          const url = ENDPOINTS.GET_TOOLS_RENTAL_COST_OVER_TIME_BY_PROJECT(
            selectedProject?.value,
            formattedStart,
            formattedEnd,
          );
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            setData(responseData);
            setError(null);
          } else {
            setData(emptyData);
            setError('No tool rental cost data found for this project.');
          }
        }
        // when no specific project is selected, fetch first project as sample
        else if (projects.length > 0) {
          // Use first project for the widget view
          const firstProject = projects[0];
          setSelectedProject({ value: firstProject.projectId, label: firstProject.projectName });
          const url = ENDPOINTS.GET_TOOLS_RENTAL_COST_OVER_TIME_BY_PROJECT(
            firstProject.projectId,
            null,
            null,
          );
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            setData(responseData);
            setError(null);
          } else {
            setData(emptyData);
            setError('No tool rental cost data found for this project.');
          }
        } else {
          setData(emptyData);
          setError('No projects available to fetch tool rental cost data.');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching tools data:', err);
        setData(emptyData);
        setError('Failed to load tools rental cost data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchToolsRentalCostData();
  }, [selectedProject, startDate, endDate, projects]);

  const projectOptions = Array.isArray(projects)
    ? projects.map(project => ({
        value: project.projectId,
        label: project.projectName,
      }))
    : [];

  // Format date for display
  const formatDate = date => date?.toISOString().split('T')[0];
  const dateRangeLabel =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '';

  // Prepare data for the line chart
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Rental Cost',
        data: data.map(d => d.value),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        tension: 0.3,
      },
    ],
  };

  // chartOptions.js
  const lineChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Total Rentals Cost Over Time',
        font: { size: 18 },
        color: darkMode ? '#FFFFFF' : '#000000',
      },
      tooltip: { enabled: true, color: darkMode ? '#FFFFFF' : '#000000' },
      legend: { display: false, labels: { color: darkMode ? '#FFFFFF' : '#000000' } },
      datalabels: {
        display: true,
        color: darkMode ? '#FFFFFF' : '#000000',
        font: { weight: 'bold' },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Date', color: darkMode ? '#FFFFFF' : '#000000' },
        ticks: { color: darkMode ? '#FFFFFF' : '#000000' },
      },
      y: {
        title: {
          display: true,
          text: 'Total Rental Cost',
          color: darkMode ? '#FFFFFF' : '#000000',
        },
        beginAtZero: true,
        ticks: { color: darkMode ? '#FFFFFF' : '#000000' },
      },
    },
  };

  return (
    <div className={`tools-rental-page ${darkMode ? 'dark-mode' : ''}`}>
      <h3 className={`tools-chart-title ${darkMode ? 'dark-mode' : ''}`}>
        Tools Rental Cost Over Time
      </h3>
      <Row className="mb-3 align-items-center">
        <Col xs={12} md={6}>
          <div className="datepicker-wrapper">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={update => {
                setDateRange(update);
              }}
              placeholderText={dateRangeLabel || 'Filter by Date Range'}
              className={`date-picker-input form-control ${darkMode ? 'dark-theme' : ''}`}
              calendarClassName={darkMode ? 'dark-theme-calendar' : ''}
            />
            <Button variant="outline-danger" size="sm" onClick={() => setDateRange([null, null])}>
              ✕
            </Button>
          </div>
        </Col>
        <Col xs={12} md={4}>
          <Select
            classNamePrefix="custom-select"
            className="w-100"
            options={projectOptions}
            value={selectedProject}
            onChange={opt => setSelectedProject(opt)}
            placeholder="Filter by Projects"
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
      <div className="tools-line-chart-container">
        {error && <div className="tools-chart-error">{error}</div>}
        {loading && <div className="tools-chart-loading">Loading tool availability data...</div>}

        {!loading && selectedProject && data.length > 0 && (
          <Line data={chartData} options={lineChartOptions} />
        )}

        {!loading && selectedProject && data.length === 0 && (
          <div className="tools-chart-empty">
            <p>No data available for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsRentalCostLineChart;
