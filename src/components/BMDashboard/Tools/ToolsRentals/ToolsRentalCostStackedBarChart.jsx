import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../../../utils/URL';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
import styles from './ToolsRentalChartStyles.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const ToolsRentalCostStackedBarChart = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProjects] = useState([]);
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
    const fetchToolsRentalCostDataWithFilters = async (selectedProject, startDate, endDate) => {
      setLoading(true);
      setError(null);

      const formattedStart = startDate ? new Date(startDate).toISOString() : null;
      const formattedEnd = endDate ? new Date(endDate).toISOString() : null;
      const projectIds = selectedProject?.length > 0 ? selectedProject.join(',') : null;
      try {
        const url = ENDPOINTS.GET_TOOLS_RENTAL_COST_DATA(projectIds, formattedStart, formattedEnd);
        const responseData = await axios.get(url);

        if (responseData.data && responseData.data.length > 0) {
          setData(responseData.data);
          setError(null);
        } else {
          setData(emptyData);
          setError('No tool rental cost data found for this project.');
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

    fetchToolsRentalCostDataWithFilters(selectedProject, startDate, endDate);
  }, [selectedProject, startDate, endDate, dateRange]);

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

  // Transform API response (data state) into chart.js structure
  const chartData = {
    labels: data.map(item => item.projectName),
    datasets: [
      {
        label: 'Owned Tool Cost',
        data: data.map(item => item.ownedToolsCost),
        backgroundColor: 'rgba(9, 100, 210, 0.8)',
        stack: 'Tools',
      },
      {
        label: 'Rental Tool Cost',
        data: data.map(item => item.rentedToolsCost),
        backgroundColor: 'rgba(197, 9, 50, 0.8)',
        stack: 'Tools',
      },
    ],
  };

  // chartOptions.js
  const stackedBarOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'How Much of Tools Costs Are Due to Rentals?',
        font: { size: 18 },
        color: darkMode ? '#FFFFFF' : '#000000',
      },
      tooltip: { enabled: true, color: darkMode ? '#FFFFFF' : '#000000' },
      legend: {
        display: true,
        position: 'top',
        labels: { color: darkMode ? '#FFFFFF' : '#000000' },
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: { weight: 'bold' },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: { display: true, text: 'Projects', color: darkMode ? '#FFFFFF' : '#000000' },
        ticks: { color: darkMode ? '#FFFFFF' : '#000000' },
      },
      y: {
        stacked: true,
        title: { display: true, text: 'Total Cost', color: darkMode ? '#FFFFFF' : '#000000' },
        beginAtZero: true,
        ticks: { color: darkMode ? '#FFFFFF' : '#000000' },
      },
    },
  };

  return (
    <div className={`${styles.toolsRentalPage} ${darkMode ? 'darkTheme' : ''}`}>
      <h3 className={`${styles.toolsChartTitle} ${darkMode ? 'darkTheme' : ''}`}>
        Tools Rental Cost Chart
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
            isMulti
            classNamePrefix="customSelect"
            className="w-100"
            options={projectOptions}
            value={projectOptions.filter(option => selectedProject?.includes(option.label))}
            onChange={opts => setSelectedProjects(opts.map(o => o.label))}
            placeholder="Filter by Projects"
          />
        </Col>
        <Col xs={12} md={2}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setSelectedProjects([]);
              setDateRange([null, null]);
            }}
          >
            Reset
          </Button>
        </Col>
      </Row>
      <div className={styles.toolsLineChartContainer}>
        {error && <div className={styles.toolsChartError}>{error}</div>}
        {loading && <div className={styles.toolsChartLoad}>Loading tool availability data...</div>}

        {!loading && selectedProject && data.length > 0 && (
          <Bar data={chartData} options={stackedBarOptions} />
        )}

        {!loading && selectedProject && data.length === 0 && (
          <div className={styles.toolsChartNoData}>
            <p>No data available for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsRentalCostStackedBarChart;
