import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from './IssueCharts.module.css';

// Import Redux actions
import {
  fetchLongestOpenIssues,
  fetchMostExpensiveIssues,
} from '../../../actions/bmdashboard/issueChartActions';

function IssuesCharts({ bmProjects = [] }) {
  const dispatch = useDispatch();

  const [graphType, setGraphType] = useState('Longest Open');
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { longestOpenIssues = [], mostExpensiveIssues = [], loading, error } = useSelector(
    state => state.issue || {},
  );

  const formatFilters = ({ projectIds, startDate, endDate }) => {
    const formatted = {};
    if (
      (typeof projectIds === 'string' && projectIds.trim() !== '') ||
      (Array.isArray(projectIds) && projectIds.length > 0)
    ) {
      formatted.projectIds = Array.isArray(projectIds) ? projectIds.join(',') : projectIds.trim();
    }
    if (startDate !== undefined && startDate !== '') {
      formatted.startDate = startDate;
    }
    if (endDate !== undefined && endDate !== '') {
      formatted.endDate = endDate;
    }
    return formatted;
  };

  useEffect(() => {
    const params = formatFilters({
      projectIds: selectedProject === 'all' ? undefined : selectedProject,
      startDate: dateRange.start,
      endDate: dateRange.end,
    });

    if (graphType === 'Longest Open') {
      dispatch(fetchLongestOpenIssues(params));
    } else {
      dispatch(fetchMostExpensiveIssues(params));
    }
  }, [graphType, selectedProject, dateRange.start, dateRange.end, dispatch]);

  const chartData = graphType === 'Longest Open' ? longestOpenIssues : mostExpensiveIssues;

  const data = {
    labels: chartData.map(issue => issue.title || issue.IssueId),
    datasets: [
      {
        label: graphType === 'Longest Open' ? 'Days Open' : 'Total Cost ($)',
        data: chartData.map(issue =>
          graphType === 'Longest Open' ? issue.daysOpen : issue.totalCost,
        ),
        backgroundColor:
          graphType === 'Longest Open' ? 'rgba(54, 162, 235, 0.7)' : 'rgba(255, 99, 132, 0.7)',
        borderColor:
          graphType === 'Longest Open' ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'right',
        formatter: value => (graphType === 'Longest Open' ? `${value} days` : `$${value}`),
        color: '#000',
        font: { weight: 'bold' },
      },
      title: {
        display: true,
        text:
          graphType === 'Longest Open'
            ? `Longest Open Issues${
                selectedProject !== 'all'
                  ? ` (${bmProjects.find(p => p._id === selectedProject)?.name || ''})`
                  : ''
              }`
            : `Most Expensive Issues${
                selectedProject !== 'all'
                  ? ` (${bmProjects.find(p => p._id === selectedProject)?.name || ''})`
                  : ''
              }`,
        font: { size: 12 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: graphType === 'Longest Open' ? 'Days Open' : 'Total Cost ($)',
          font: { size: 12 },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Issue Title',
          font: { size: 12 },
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
    },
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.dateInputs}>
          <div className={styles.inputGroup}>
            <label htmlFor="startDate">Start:</label>
            <input
              id="startDate"
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="endDate">End:</label>
            <input
              id="endDate"
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="project">Project:</label>
          <select
            id="project"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Projects</option>
            {bmProjects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            value={graphType}
            onChange={e => setGraphType(e.target.value)}
            className={styles.select}
          >
            <option value="Longest Open">Longest Open</option>
            <option value="Most Expensive">Most Expensive</option>
          </select>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {chartData.length > 0 ? (
          <Bar
            key={`${graphType}-${selectedProject}-${dateRange.start}-${dateRange.end}`}
            data={data}
            options={options}
            plugins={[ChartDataLabels]}
          />
        ) : (
          <p className={styles.noData}>No issues found.</p>
        )}
      </div>
    </div>
  );
}

export default IssuesCharts;
