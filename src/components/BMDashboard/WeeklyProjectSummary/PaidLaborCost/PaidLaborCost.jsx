import { useState, useEffect, useMemo } from 'react';
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
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import styles from './PaidLaborCost.module.css';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import PaidLaborCostDatePicker from './PaidLaborCostDatePicker';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Sample data (cost in dollars) - Used as fallback when API is unavailable
const mockData = [
  { project: 'Project A', task: 'Task 1', date: '2025-04-01', cost: 5000 },
  { project: 'Project A', task: 'Task 2', date: '2025-04-02', cost: 3000 },
  { project: 'Project A', task: 'Task 3', date: '2025-04-03', cost: 12000 },
  { project: 'Project A', task: 'Task 4', date: '2025-04-04', cost: 48000 },
  { project: 'Project A', task: 'Task 5', date: '2025-04-04', cost: 18000 },
  { project: 'Project A', task: 'Task 6', date: '2025-04-04', cost: 82000 },
  { project: 'Project A', task: 'Task 7', date: '2025-04-04', cost: 48000 },
  { project: 'Project A', task: 'Task 8', date: '2025-04-04', cost: 28000 },
  { project: 'Project A', task: 'Task 9', date: '2025-04-04', cost: 87000 },
  { project: 'Project A', task: 'Task 10', date: '2025-04-04', cost: 88000 },
  { project: 'Project A', task: 'Task 11', date: '2025-04-04', cost: 180900 },
  { project: 'Project A', task: 'Task 12', date: '2025-04-04', cost: 280000 },
  { project: 'Project A', task: 'Task 13', date: '2025-04-04', cost: 480050 },
  { project: 'Project A', task: 'Task 14', date: '2025-04-04', cost: 68000 },
  { project: 'Project A', task: 'Task 15', date: '2025-04-04', cost: 80500 },
  { project: 'Project A', task: 'Task 16', date: '2025-04-04', cost: 80400 },
  { project: 'Project A', task: 'Task 17', date: '2025-04-04', cost: 680360 },
  { project: 'Project A', task: 'Task 18', date: '2025-04-04', cost: 80600 },
  { project: 'Project A', task: 'Task 19', date: '2025-04-04', cost: 800230 },
  { project: 'Project B', task: 'Task 20', date: '2025-04-02', cost: 100200 },
  { project: 'Project B', task: 'Task 21', date: '2025-04-03', cost: 70200 },
  { project: 'Project B', task: 'Task 22', date: '2025-04-04', cost: 215000 },
  { project: 'Project B', task: 'Task 23', date: '2025-04-05', cost: 92000 },

  { project: 'Project C', task: 'Task 1', date: '2025-04-03', cost: 25000 },
  { project: 'Project C', task: 'Task 2', date: '2025-04-04', cost: 20000 },
  { project: 'Project C', task: 'Task 3', date: '2025-04-05', cost: 18000 },
  { project: 'Project C', task: 'Task 4', date: '2025-04-06', cost: 22000 },

  { project: 'Project D', task: 'Task 1', date: '2025-04-04', cost: 4000 },
  { project: 'Project D', task: 'Task 2', date: '2025-04-05', cost: 6000 },
  { project: 'Project D', task: 'Task 3', date: '2025-04-06', cost: 14000 },
  { project: 'Project D', task: 'Task 4', date: '2025-04-07', cost: 10000 },

  { project: 'Project E', task: 'Task 1', date: '2025-04-05', cost: 8000 },
  { project: 'Project E', task: 'Task 2', date: '2025-04-06', cost: 11000 },
  { project: 'Project E', task: 'Task 3', date: '2025-04-07', cost: 9000 },
  { project: 'Project E', task: 'Task 4', date: '2025-04-08', cost: 13000 },
];

/**
 * aggregateData:
 * - If the Project Filter is "All Projects", aggregate all projects into one group labeled "All Projects"
 *   and—if the Task Filter is 'ALL'—include only the two most expensive sub-tasks (plus Total Cost).
 * - Otherwise, aggregate only for the selected project.
 * - If a custom date range is active, only data within that range is included.
 */
function aggregateData(data, taskFilter, projectFilter, dateMode, startDate, endDate) {
  let filtered = data;
  if (dateMode === 'CUSTOM' && startDate && endDate) {
    filtered = data.filter(item => {
      const itemDate = moment(item.date, 'YYYY-MM-DD');
      return itemDate.isBetween(startDate, endDate, 'day', '[]');
    });
  }

  if (projectFilter === 'All Projects') {
    const label = 'All Projects';
    const aggregation = { [label]: { totalCost: 0 } };
    // Get unique tasks from filtered data
    const tasks = [...new Set(filtered.map(d => d.task))];
    tasks.forEach(task => {
      aggregation[label][task] = 0;
    });

    // Sum up totals
    filtered.forEach(item => {
      aggregation[label].totalCost += item.cost;
      if (aggregation[label][item.task] !== undefined) {
        aggregation[label][item.task] += item.cost;
      }
    });

    let tasksToInclude;
    if (taskFilter === 'ALL') {
      // Pick the two most expensive tasks by cost
      tasksToInclude = tasks
        .sort((a, b) => aggregation[label][b] - aggregation[label][a])
        .slice(0, 2);
    } else {
      tasksToInclude = [taskFilter];
    }
    return { labels: [label], aggregation, tasksToInclude };
  }

  // Specific project selected – display that project name along x-axis.
  const projectsToInclude = [projectFilter];
  const distinctTasks = [
    ...new Set(filtered.filter(d => d.project === projectFilter).map(d => d.task)),
  ];
  const tasksToInclude = taskFilter === 'ALL' ? distinctTasks : [taskFilter];

  const aggregation = {};
  projectsToInclude.forEach(proj => {
    aggregation[proj] = { totalCost: 0 };
    tasksToInclude.forEach(t => {
      aggregation[proj][t] = 0;
    });
  });

  filtered.forEach(item => {
    if (item.project === projectFilter) {
      aggregation[projectFilter].totalCost += item.cost;
      if (tasksToInclude.includes(item.task)) {
        aggregation[projectFilter][item.task] += item.cost;
      }
    }
  });

  return { labels: projectsToInclude, aggregation, tasksToInclude };
}

// Component for displaying the chart/dashboard
export default function PaidLaborCost() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const darkMode = useSelector(state => state.theme.darkMode);
  const textColor = darkMode ? '#ffffff' : '#666';
  // Filter States
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [dateMode, setDateMode] = useState('ALL');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // API data fetching with fallback to mock data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/labor-cost', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projects: projectFilter !== 'All Projects' ? [projectFilter] : [],
            tasks: taskFilter !== 'ALL' ? [taskFilter] : [],
            date_range:
              dateMode === 'CUSTOM'
                ? {
                    start_date: dateRange.startDate
                      ? moment(dateRange.startDate).format('YYYY-MM-DD')
                      : null,
                    end_date: dateRange.endDate
                      ? moment(dateRange.endDate).format('YYYY-MM-DD')
                      : null,
                  }
                : null,
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const apiData = await response.json();
        setData(apiData);
      } catch (error) {
        toast.info('Error fetching data:', error);
        // Fall back to mock data if API is unavailable
        toast.info('Using mock data as fallback');
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectFilter, taskFilter, dateMode, dateRange.startDate, dateRange.endDate]);

  // Use mock data initially until API data is loaded
  const currentData = data.length > 0 ? data : mockData;

  // Derive unique filter values from current data
  const distinctProjects = useMemo(() => [...new Set(currentData.map(d => d.project))], [
    currentData,
  ]);

  const distinctTasks = useMemo(() => [...new Set(currentData.map(d => d.task))], [currentData]);

  // Aggregate data based on filters
  const { labels, aggregation, tasksToInclude } = aggregateData(
    currentData,
    taskFilter,
    projectFilter,
    dateMode,
    dateRange.startDate,
    dateRange.endDate,
  );

  // Build stable option lists for selects
  const taskOptions = useMemo(
    () =>
      distinctTasks.map(task => ({
        id: uuidv4(),
        value: task,
      })),
    [distinctTasks],
  );

  const projectOptions = useMemo(
    () =>
      distinctProjects.map(proj => ({
        id: uuidv4(),
        value: proj,
      })),
    [distinctProjects],
  );

  const dateOptions = useMemo(
    () => [
      { id: uuidv4(), value: 'ALL', label: 'ALL' },
      { id: uuidv4(), value: 'CUSTOM', label: 'CUSTOM' },
    ],
    [],
  );

  // Handle date range changes
  const handleDateRangeChange = ({ startDate, endDate }) => {
    setDateRange({ startDate, endDate });
  };

  // Build Chart.js datasets
  // Always include the Total Cost dataset
  const totalCostDataset = {
    label: 'Total Cost',
    backgroundColor: '#00A3A1',
    borderRadius: 4,
    data: labels.map(label => Math.round(aggregation[label].totalCost / 1000)),
  };

  // Generate one distinct HSL color per task
  const taskDatasets = tasksToInclude.map((task, idx) => {
    // spread hues evenly around the 360° color wheel
    const hue = Math.round((idx * 360) / tasksToInclude.length);
    // keep saturation moderate, and lightness high so bars pop in dark mode
    const saturation = 65;
    const lightness = darkMode ? 70 : 50;
    return {
      label: task,
      backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      borderRadius: 4,
      data: labels.map(label => Math.round(aggregation[label][task] / 1000)),
    };
  });

  const chartData = {
    labels,
    datasets: [totalCostDataset, ...taskDatasets],
  };

  // Chart options: grid lines, responsive layout, and tooltip callback for interactivity.
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 12 }, color: textColor },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const project = context.chart.data.labels[context.dataIndex];
            const costThousands = context.parsed.y || 0;
            const costDollars = costThousands * 1000;
            return `${project}, ${context.dataset.label}, Cost $${costDollars.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: textColor },
      },
      y: {
        grid: { color: '#ccc' },
        title: {
          display: true,
          text: 'Cost (000s)',
          font: { size: 12 },
          color: textColor,
        },
        ticks: { font: { size: 12 }, color: textColor },
      },
    },
  };

  return (
    <div className={`${styles.paidLaborCostContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h4 className={`${styles.paidLaborCostTitle}`}>Paid Labor Cost</h4>

      {/* Loading indicator */}
      {loading ? (
        <div className={styles.paidLaborCostLoading}>Loading data...</div>
      ) : (
        <>
          {/* Filter Row */}
          <div className={styles.paidLaborCostFilters}>
            {/* Task Filter */}
            <div className={styles.paidLaborCostFilterGroup}>
              <label className={styles.paidLaborCostFilterLabel} htmlFor="task-filter">
                Tasks
              </label>
              <select
                id="task-filter"
                value={taskFilter}
                onChange={e => setTaskFilter(e.target.value)}
                className={styles.paidLaborCostFilterSelect}
              >
                <option value="ALL">ALL</option>
                {taskOptions.map(option => (
                  <option key={option.id} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div className={styles.paidLaborCostFilterGroup}>
              <label className={styles.paidLaborCostFilterLabel} htmlFor="project-filter">
                Project
              </label>
              <select
                id="project-filter"
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className={styles.paidLaborCostFilterSelect}
              >
                <option value="All Projects">ALL</option>
                {projectOptions.map(option => (
                  <option key={option.id} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className={styles.paidLaborCostFilterGroup}>
              <label className={styles.paidLaborCostFilterLabel} htmlFor="date-filter">
                Dates
              </label>
              <select
                id="date-filter"
                value={dateMode}
                onChange={e => {
                  setDateMode(e.target.value);
                  // Reset date range when the date filter changes
                  setDateRange({ startDate: null, endDate: null });
                }}
                className={styles.paidLaborCostFilterSelect}
              >
                {dateOptions.map(option => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Our Custom DateRangePicker shown in CUSTOM mode - replacing Airbnb DateRangePicker */}
          {dateMode === 'CUSTOM' && (
            <div className={styles.paidLaborCostDaterangeRow}>
              <PaidLaborCostDatePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDatesChange={handleDateRangeChange}
                minDate={new Date(1980, 0, 1)}
                placeholder="Select date range"
              />
            </div>
          )}

          {/* Chart Container */}
          <div className={styles.paidLaborCostChartScrollWrapper}>
            <div
              style={{
                width: tasksToInclude.length > 3 ? `${(tasksToInclude.length + 1) * 50}px` : '100%',
                height: '300px',
              }}
            >
              <Bar data={chartData} options={options} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
