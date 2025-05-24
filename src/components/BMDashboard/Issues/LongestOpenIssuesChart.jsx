import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from './IssueCharts.module.css';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

function IssuesCharts({
  bmProjects = [],
  longestOpenIssues = [],
  mostExpensiveIssues = [],
  loading = false,
  error = null,
  fetchLongestOpenIssues,
  fetchMostExpensiveIssues,
}) {
  const [graphType, setGraphType] = useState('Longest Open');
  const [selectedProject, setSelectedProject] = useState('all');

  // Fetch data on mount and when graph type or selected project changes
  useEffect(() => {
    if (graphType === 'Longest Open') {
      fetchLongestOpenIssues(selectedProject === 'all' ? null : selectedProject);
    } else {
      fetchMostExpensiveIssues(selectedProject === 'all' ? null : selectedProject);
    }
  }, [graphType, selectedProject, fetchLongestOpenIssues, fetchMostExpensiveIssues]);

  // Determine which data to use based on graph type
  const chartData = graphType === 'Longest Open' ? longestOpenIssues : mostExpensiveIssues;

  // Prepare chart data
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
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'right',
        formatter: value => (graphType === 'Longest Open' ? `${value} days` : `$${value}`),
        color: '#000',
        font: { weight: 'bold' },
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
        {/* <div className={styles.dateInputs}>
          <div className={styles.inputGroup}>
            <label htmlFor="startDate">Start:</label>
            <input
              id="startDate"
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="endDate">End:</label>
            <input
              id="endDate"
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              className={styles.input}
            />
          </div>
        </div> */}
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
            <option>Longest Open</option>
            <option>Most Expensive</option>
          </select>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {chartData.length > 0 ? (
          <Bar data={data} options={options} plugins={[ChartDataLabels]} />
        ) : (
          <p className={styles.noData}>No issues found.</p>
        )}
      </div>
    </div>
  );
}

export default IssuesCharts;
