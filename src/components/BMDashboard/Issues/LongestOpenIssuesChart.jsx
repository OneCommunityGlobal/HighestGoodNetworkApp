import { useState } from 'react';
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

// Mock data
const allIssuesData = [
  {
    IssueId: '662d6479aa9fee05811b7d2e',
    title: 'testing issue',
    daysOpen: 701,
    totalCost: 12500,
    project: 'Project A',
    openedDate: '2022-05-15',
  },
  {
    IssueId: '67b7c723432ea2100f636011',
    title: 'safety concern',
    daysOpen: 73,
    totalCost: 8500,
    project: 'Project A',
    openedDate: '2023-10-01',
  },
  {
    IssueId: '67b7c774432ea2100f63601a',
    title: 'worker safety issue',
    daysOpen: 73,
    totalCost: 42000,
    project: 'Project C',
    openedDate: '2023-10-01',
  },
  {
    IssueId: '67b7c832432ea2100f63601d',
    title: 'minor injury report',
    daysOpen: 73,
    totalCost: 3200,
    project: 'Project B',
    openedDate: '2023-10-01',
  },
  {
    IssueId: '68a8d832432ea2100f73642e',
    title: 'new feature request',
    daysOpen: 45,
    totalCost: 1500,
    project: 'Project A',
    openedDate: '2024-01-20',
  },
];

function IssuesCharts() {
  const [dateRange, setDateRange] = useState({
    start: '2022-01-01',
    end: '2024-12-31',
  });
  const [selectedProject, setSelectedProject] = useState('All Projects');

  // Get unique projects for dropdown
  const projects = ['All Projects', ...new Set(allIssuesData.map(issue => issue.project))];

  // Filter data based on selections
  const filteredData = allIssuesData
    .filter(issue => {
      // Filter by project
      const projectMatch = selectedProject === 'All Projects' || issue.project === selectedProject;

      // Filter by date range
      const dateMatch =
        new Date(issue.openedDate) >= new Date(dateRange.start) &&
        new Date(issue.openedDate) <= new Date(dateRange.end);

      return projectMatch && dateMatch;
    })
    .sort((a, b) => b.daysOpen - a.daysOpen); // Sort by daysOpen descending

  // Prepare chart data
  const data = {
    labels: filteredData.map(issue => issue.title || issue.IssueId),
    datasets: [
      {
        label: 'Days Open',
        data: filteredData.map(issue => issue.daysOpen),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
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
        text: 'Longest Open Issues',
        font: { size: 16 },
      },
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'right',
        formatter: value => `${value} days`,
        color: '#000',
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Days Open' },
      },
      y: {
        title: { display: true, text: 'Issue Title' },
      },
    },
  };

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
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="endDate">End:</label>
            <input
              id="endDate"
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="project">Project:</label>
          <select
            id="project"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            {projects.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredData.length > 0 ? (
        <Bar data={data} options={options} plugins={[ChartDataLabels]} />
      ) : (
        <p className={styles.noData}>No issues match the selected filters.</p>
      )}
    </div>
  );
}

export default IssuesCharts;
