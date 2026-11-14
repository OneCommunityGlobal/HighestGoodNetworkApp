import { useState, useEffect, useMemo, useCallback } from 'react';
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
import styles from './MostExpensiveIssuesChart.module.css';

// Register chart components once
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatDate = date => {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MostExpensiveOpenIssuesChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const reduxProjects = useSelector(state => state.bmProjects);

  const [projects, setProjects] = useState([]);
  const [openIssues, setOpenIssues] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [startDate, endDate] = dateRange;

  // Fetch projects from the backend with fallback to Redux bmProjects
  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(ENDPOINTS.BM_GET_ISSUE_PROJECTS);
      const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setProjects(list);
    } catch (err) {
      if (Array.isArray(reduxProjects) && reduxProjects.length > 0) {
        setProjects(reduxProjects);
      } else {
        setError(`Error fetching projects: ${err.response?.data?.message || err.message}`);
      }
    }
  }, [reduxProjects]);

  // Fetch open issues with applied filters
  const fetchIssuesWithFilters = useCallback(async (projectList, start, end) => {
    // Wait until both start and end dates are selected (or both cleared)
    if ((start && !end) || (!start && end)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedStart = formatDate(start);
      const formattedEnd = formatDate(end);
      const validProjects = (projectList || []).filter(Boolean);
      const projectIds = validProjects.length > 0 ? validProjects.join(',') : null;

      const url = ENDPOINTS.BM_GET_OPEN_ISSUES(projectIds, formattedStart, formattedEnd);
      const response = await axios.get(url);

      const rawIssues = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const sortedIssues = [...rawIssues].sort(
        (a, b) => (Number(b.totalCost ?? b.cost) || 0) - (Number(a.totalCost ?? a.cost) || 0),
      );
      setOpenIssues(sortedIssues);
    } catch (err) {
      setError(
        `Error fetching open issues with filters: ${err.response?.data?.message || err.message}`,
      );
      setOpenIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchIssuesWithFilters(selectedProjects, startDate, endDate);
  }, [selectedProjects, startDate, endDate, fetchIssuesWithFilters]);

  // Memoize the mapped issues to avoid unnecessary recalculations
  const mappedIssues = useMemo(() => {
    return openIssues.map(issue => {
      const created = issue.createdDate ? new Date(issue.createdDate) : null;
      const diffDays =
        created && !Number.isNaN(created.getTime())
          ? Math.floor((new Date() - created) / (1000 * 60 * 60 * 24))
          : issue.daysOpen ?? 0;

      const issueName =
        (Array.isArray(issue.issueTitle) ? issue.issueTitle[0] : issue.issueTitle) ||
        issue.title ||
        issue.issueName ||
        'Untitled';

      return {
        id: issue._id || issue.issueId,
        name: issueName,
        tag: issue.tag || '',
        openSince: diffDays,
        cost: Number(issue.totalCost ?? issue.cost) || 0,
        person: issue.person,
      };
    });
  }, [openIssues]);

  const projectOptions = useMemo(
    () =>
      projects
        .map(p => ({
          value: p.projectId || p._id,
          label: p.projectName || p.name,
        }))
        .filter(opt => Boolean(opt.value)),
    [projects],
  );

  const dateRangeLabel =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : '';

  // Prepare data object for Chart.js
  const chartData = useMemo(
    () => ({
      labels: mappedIssues.map(d => d.name),
      datasets: [
        {
          label: 'Cost ($)',
          data: mappedIssues.map(d => d.cost),
          backgroundColor: '#007bff',
          borderRadius: 4,
          barThickness: 24,
          maxBarThickness: 28,
          barPercentage: 0.1,
          categoryPercentage: 0.1,
        },
      ],
    }),
    [mappedIssues],
  );

  // Chart appearance options
  const chartOptions = useMemo(
    () => ({
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
    }),
    [darkMode],
  );

  return (
    <div className={`chart-container ${darkMode ? 'dark-mode' : ''}`}>
      <h2 className="chart-title">Most Expensive Open Issues</h2>

      <Row className="mb-3 align-items-center">
        <Col md={6}>
          <div className="datepicker-wrapper">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={update => setDateRange(update || [null, null])}
              isClearable
              placeholderText="Filter by Date Range"
              className={`datepicker ${darkMode ? 'dark-mode' : ''}`}
              value={dateRangeLabel}
            />
            {dateRangeLabel && (
              <span>
                <button
                  type="button"
                  style={{ color: darkMode ? 'white' : 'black', paddingLeft: '8px' }}
                  onClick={() => setDateRange([null, null])}
                >
                  x
                </button>
              </span>
            )}
          </div>
        </Col>
        <Col md={6}>
          <Select
            isMulti
            classNamePrefix="custom-select"
            className="w-100"
            options={projectOptions}
            value={projectOptions.filter(option => selectedProjects.includes(option.value))}
            onChange={opts => setSelectedProjects((opts || []).map(o => o.value))}
            placeholder="Filter by Projects"
          />
        </Col>
      </Row>

      {/* Render the bar chart */}
      <div className="chart-wrapper">
        {error && <div className="alert alert-danger">{error}</div>}
        {!error && loading && <p className="text-center my-3">Loading issues...</p>}
        {!error && !loading && mappedIssues.length === 0 && (
          <p className="text-center my-3">No open issues found for the selected filters.</p>
        )}
        {!error && !loading && mappedIssues.length > 0 && (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
