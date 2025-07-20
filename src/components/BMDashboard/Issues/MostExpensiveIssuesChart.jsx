import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import { Row, Col } from 'react-bootstrap';
import './MostExpensiveIssuesChart.css';
import { ENDPOINTS } from '../../../utils/URL';

// Register chart components once
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MostExpensiveOpenIssuesChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [projects, setProjects] = useState([]);
  const [openIssues, setOpenIssues] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [error, setError] = useState('');

  const [startDate, endDate] = dateRange;

  // Fetch projects from the backend
  const fetchProjects = async () => {
    try {
      const response = await axios.get(ENDPOINTS.BM_GET_ISSUE_PROJECTS);
      setProjects(response.data);
    } catch (err) {
      setError(`Error fetching projects: ${err}`);
    }
  };

  // Fetch open issues with applied filters
  const fetchIssuesWithFilters = async () => {
    try {
      const formattedStart = startDate ? new Date(startDate).toISOString() : null;
      const formattedEnd = endDate ? new Date(endDate).toISOString() : null;
      const projectIds = selectedProjects.length > 0 ? selectedProjects.join(',') : null;
      const url = ENDPOINTS.BM_GET_OPEN_ISSUES(projectIds, formattedStart, formattedEnd);
      const response = await axios.get(url);
      const sortedIssues = response.data.sort((a, b) => b.cost - a.cost);
      setOpenIssues(sortedIssues);
    } catch (err) {
      setError(`Error fetching open issues with filters: ${err}`);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchIssuesWithFilters();
  }, [selectedProjects, startDate, endDate]);

  // Memoize the mapped issues to avoid unnecessary recalculations
  const mappedIssues = useMemo(() => {
    return openIssues.map(issue => {
      const created = new Date(issue.createdDate);
      const diffDays = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
      return {
        id: issue._id,
        name: issue.issueTitle?.[0] || 'Untitled',
        tag: issue.tag || '',
        openSince: diffDays,
        cost: issue.cost,
        person: issue.person,
      };
    });
  }, [openIssues]);

  const projectOptions = useMemo(
    () => projects.map(p => ({ value: p.projectId, label: p.projectName })),
    [projects],
  );

  const filtered = useMemo(() => mappedIssues, [mappedIssues]);

  // Format date for display
  const formatDate = date => date?.toISOString().split('T')[0];
  const dateRangeLabel =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '';

  // Prepare data object for Chart.js
  const chartData = useMemo(() => ({
    labels: filtered.map(d => d.name),
    datasets: [{
      label: 'Cost ($)',
      data: filtered.map(d => d.cost),
      backgroundColor: '#007bff',
      borderRadius: 4,
      barThickness: 24,
      maxBarThickness: 28,
      barPercentage: 0.1,
      categoryPercentage: 0.1,
    }],
  }), [filtered]);

  // Chart appearance options
  const chartOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => `$${ctx.parsed.x.toLocaleString()}` },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cost ($)',
          font: { size: 12 },
          color: darkMode ? '#fff' : '#666',
        },
        ticks: {
          callback: val => `$${val}`,
          color: darkMode ? '#fff' : '#666',
          font: { size: 11 },
        },
        grid: { display: false },
      },
      y: {
        offset: true,
        title: {
          display: true,
          text: 'Issue Name',
          font: { size: 12 },
          color: darkMode ? '#fff' : '#666',
        },
        ticks: {
          color: darkMode ? '#fff' : '#666',
          font: { size: 11 },
          maxRotation: 0,
          autoSkip: false,
        },
        grid: { display: false },
      },
    },
    layout: { padding: 0 },
  }), [darkMode]);

  return (
    <div className="chart-container">
      <h2 className="chart-title">Most Expensive Open Issues</h2>

      <Row className="mb-3 align-items-center">
        <Col md={6}>
          <div className="datepicker-wrapper">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={update => {
                setDateRange(update);
                // Trigger fetch with updated date range
                const [newStartDate, newEndDate] = update;
                fetchIssuesWithFilters(selectedProjects, newStartDate, newEndDate);
              }}
              placeholderText="Filter by Date Range"
              className={`form-control ${darkMode ? 'datepicker-dark' : ''}`}
              value={dateRangeLabel}
            />
          </div>
        </Col>
        <Col md={6}>
          <Select
            isMulti
            classNamePrefix="custom-select"
            className="w-100"
            options={projectOptions}
            value={projectOptions.filter(option => selectedProjects.includes(option.value))}
            onChange={opts => setSelectedProjects(opts.map(o => o.value))}
            placeholder="Filter by Projects"
          />
        </Col>
      </Row>

      {/* Render the bar chart */}
      <div className="chart-wrapper">
        {error && <div className="alert alert-danger">{error}</div>}
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
