import { useState, useEffect, useMemo, useRef } from 'react';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './PaidLaborCost.module.css';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import logger from '../../../../services/logService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Date Handling Strategy:
 * - React state uses Date objects (or null) for maximum flexibility
 * - API calls convert Date objects to ISO 8601 strings using moment.js
 * - API responses contain ISO 8601 date strings which are validated but not converted back to Date objects
 * - Date picker components work directly with Date objects
 * - All date formatting and parsing uses moment.js consistently
 */

/**
 * Converts a Date object to ISO 8601 string for API requests
 * @param {Date|null} date - Date object to convert
 * @returns {string|null} ISO 8601 string or null
 */
const dateToISOString = date => {
  if (!date) return null;
  return moment(date).toISOString();
};

/**
 * Validates if a date string is a valid ISO 8601 format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid ISO 8601 date
 */
const isValidISODate = dateString => {
  if (!dateString) return false;
  return moment(dateString).isValid();
};

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
 * - Backend handles all date filtering, so this function works with pre-filtered data.
 */
function aggregateData(data, taskFilter, projectFilter) {
  // Validate data structure
  if (!Array.isArray(data)) {
    logger.logError(new Error(`aggregateData: Expected array, received: ${typeof data}`));
    return { labels: [], aggregation: {}, tasksToInclude: [] };
  }

  // Validate each item has required fields
  const validData = data.filter(item => {
    if (!item || typeof item !== 'object') return false;
    if (typeof item.project !== 'string' || typeof item.task !== 'string') return false;
    if (typeof item.cost !== 'number' || isNaN(item.cost)) return false;
    if (!item.date) return false;
    return true;
  });

  if (validData.length !== data.length) {
    logger.logInfo(
      `aggregateData: Filtered out ${data.length - validData.length} invalid items from ${
        data.length
      } total`,
    );
  }

  const filtered = validData;

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
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const darkMode = useSelector(state => state.theme.darkMode);
  const textColor = darkMode ? '#ffffff' : '#666';
  // Filter States
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // Ref to track if an API call is in progress to prevent race conditions
  const isFetchingRef = useRef(false);

  // API data fetching with fallback to mock data
  useEffect(() => {
    // Prevent multiple simultaneous API calls
    if (isFetchingRef.current) {
      return;
    }

    const fetchData = async () => {
      isFetchingRef.current = true;
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();

        // Add projects parameter if a specific project is selected
        if (projectFilter !== 'All Projects') {
          params.append('projects', JSON.stringify([projectFilter]));
        }

        // Add tasks parameter if a specific task is selected
        if (taskFilter !== 'ALL') {
          params.append('tasks', JSON.stringify([taskFilter]));
        }

        // Add date_range parameter when at least one date is selected
        // No dates selected means all data (no filter)
        // Convert Date objects to ISO 8601 strings for API
        if (dateRange.startDate || dateRange.endDate) {
          params.append(
            'date_range',
            JSON.stringify({
              start_date: dateToISOString(dateRange.startDate),
              end_date: dateToISOString(dateRange.endDate),
            }),
          );
        }

        // Build the URL with query string
        const queryString = params.toString();
        const url = queryString ? `/api/labor-cost?${queryString}` : '/api/labor-cost';

        const response = await fetch(url, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const apiData = await response.json();

        // Validate response structure
        if (!apiData || typeof apiData !== 'object') {
          throw new Error('Invalid response structure: expected an object');
        }

        // Extract data array and totalCost from response
        if (Array.isArray(apiData.data)) {
          // Validate data structure and format
          const validatedData = apiData.data.filter(item => {
            if (!item || typeof item !== 'object') return false;
            if (typeof item.project !== 'string' || typeof item.task !== 'string') return false;
            if (typeof item.cost !== 'number' || isNaN(item.cost)) return false;
            if (!item.date) return false;
            // Validate date format (should be ISO 8601 from backend)
            if (!isValidISODate(item.date)) return false;
            return true;
          });

          if (validatedData.length !== apiData.data.length) {
            logger.logInfo(
              `Data validation: Filtered out ${apiData.data.length -
                validatedData.length} invalid items`,
            );
          }

          setData(validatedData);
        } else {
          throw new Error('Invalid response structure: data property is not an array');
        }

        // Extract and set totalCost (handle 0 or undefined)
        const cost = typeof apiData.totalCost === 'number' ? apiData.totalCost : 0;
        setTotalCost(cost);
      } catch (error) {
        toast.info('Error fetching data:', error);
        // Fall back to mock data if API is unavailable
        toast.info('Using mock data as fallback');
        setData(mockData);
        // Calculate total cost from mock data as fallback
        const mockTotalCost = mockData.reduce((sum, item) => sum + item.cost, 0);
        setTotalCost(mockTotalCost);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [projectFilter, taskFilter, dateRange.startDate, dateRange.endDate]);

  // Use mock data initially until API data is loaded
  const currentData = data.length > 0 ? data : mockData;

  // Derive unique filter values from current data
  const distinctProjects = useMemo(() => [...new Set(currentData.map(d => d.project))], [
    currentData,
  ]);

  const distinctTasks = useMemo(() => [...new Set(currentData.map(d => d.task))], [currentData]);

  // Aggregate data based on filters (backend handles date filtering)
  const { labels, aggregation, tasksToInclude } = aggregateData(
    currentData,
    taskFilter,
    projectFilter,
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

  // Handle individual date changes - triggers immediate API call
  const handleStartDateChange = date => {
    setDateRange(prev => ({ ...prev, startDate: date }));
  };

  const handleEndDateChange = date => {
    setDateRange(prev => ({ ...prev, endDate: date }));
  };

  // Build Chart.js datasets
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
    datasets: taskDatasets,
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
    <div className={styles.paidLaborCostContainer}>
      <h4 className={styles.paidLaborCostTitle}>Paid Labor Cost</h4>

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

            {/* Date Range Filter */}
            <div className={styles.paidLaborCostFilterGroup}>
              <label className={styles.paidLaborCostFilterLabel} htmlFor="date-range">
                Date Range
              </label>
              <div className={styles.paidLaborCostDateRangePicker}>
                <DatePicker
                  id="start-date"
                  selected={dateRange.startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  maxDate={dateRange.endDate || new Date()}
                  placeholderText="Start Date"
                  isClearable
                  dateFormat="MM/dd/yyyy"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  className={styles.paidLaborCostDatePicker}
                />
                <span className={styles.paidLaborCostDateSeparator}>to</span>
                <DatePicker
                  id="end-date"
                  selected={dateRange.endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  minDate={dateRange.startDate}
                  maxDate={new Date()}
                  placeholderText="End Date"
                  isClearable
                  dateFormat="MM/dd/yyyy"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  className={styles.paidLaborCostDatePicker}
                />
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className={styles.paidLaborCostChartScrollWrapper}>
            <div
              style={{
                width: tasksToInclude.length > 3 ? `${tasksToInclude.length * 50}px` : '100%',
                height: '300px',
              }}
            >
              <Bar data={chartData} options={options} />
            </div>
          </div>

          {/* Total Cost Summary Section */}
          <div className={styles.paidLaborCostSummary}>
            <span className={styles.paidLaborCostSummaryLabel}>Total Labor Cost:</span>
            <span className={styles.paidLaborCostSummaryValue}>
              $
              {totalCost.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
