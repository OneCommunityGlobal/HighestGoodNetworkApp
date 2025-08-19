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
import './ToolsRentalChartStyles.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const ToolsRentalCostStackedBarChart = () => {
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
        setProjects(response.data);
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
    const fetchToolsRentalCostDataWithFilters = async () => {
      setLoading(true);
      setError(null);

      const formattedStart = startDate ? new Date(startDate).toISOString() : null;
      const formattedEnd = endDate ? new Date(endDate).toISOString() : null;
      const projectIds = selectedProject.length > 0 ? selectedProject.join(',') : null;
      try {
        const url = ENDPOINTS.GET_TOOLS_RENTAL_COST_DATA(projectIds, formattedStart, formattedEnd);
        const responseData = await axios.get(url);
        if (responseData && responseData.length > 0) {
          setData(responseData);
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

    fetchToolsRentalCostDataWithFilters();
  }, [selectedProject, startDate, endDate, projects]);

  const projectOptions = projects.map(project => ({
    value: project.projectId,
    label: project.projectName,
  }));

  // Handle project selection change
  const handleProjectChange = selectedOption => {
    setSelectedProject(selectedOption);
  };

  // useEffect(() => {
  //   if (!selectedProject) return;
  //   const [startDate, endDate] = dateRange;

  //   axios
  //     .get("http://localhost:5000/api/tools/rental-cost-bar", {
  //       params: {
  //         projectId: selectedProject.value,
  //         startDate,
  //         endDate,
  //       },
  //     })
  //     .then((res) => {
  //       setChartData({
  //         labels: res.data.labels,
  //         datasets: [
  //           {
  //             label: "Owned Tools Cost",
  //             data: res.data.owned,
  //             backgroundColor: "rgba(54, 162, 235, 0.8)",
  //           },
  //           {
  //             label: "Rented Tools Cost",
  //             data: res.data.rented,
  //             backgroundColor: "rgba(255, 99, 132, 0.8)",
  //           },
  //         ],
  //       });
  //     });
  // }, [selectedProject, dateRange]);

  // Format date for display
  const formatDate = date => date?.toISOString().split('T')[0];
  const dateRangeLabel =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '';

  // chartOptions.js
  const stackedBarOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'How Much of Tools Costs Are Due to Rentals?',
        font: { size: 18 },
      },
      tooltip: { enabled: true },
      legend: { display: true, position: 'top' },
      datalabels: {
        display: true,
        color: '#fff',
        font: { weight: 'bold' },
      },
    },
    scales: {
      x: { stacked: true, title: { display: true, text: 'Projects' } },
      y: { stacked: true, title: { display: true, text: 'Total Cost' }, beginAtZero: true },
    },
  };

  return (
    <div className={`tools-rental-page ${darkMode ? 'dark-mode' : ''}`}>
      <h3 className={`tools-chart-title ${darkMode ? 'dark-mode' : ''}`}>
        Tools Rental Cost Chart
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
                const [newStartDate, newEndDate] = update;
                fetchIssuesWithFilters(selectedProjects, newStartDate, newEndDate, tagFilter);
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
            isMulti
            classNamePrefix="custom-select"
            className="w-100"
            options={projectOptions}
            value={projectOptions.filter(option => selectedProject.includes(option.value))}
            onChange={opts => handleProjectChange(opts.map(o => o.value))}
            placeholder="Filter by Projects"
          />
        </Col>
        <Col xs={12} md={2}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setTagFilter(null);
              setSelectedProjects([]);
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
          <Bar data={chartData} options={stackedBarOptions} />
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

export default ToolsRentalCostStackedBarChart;
