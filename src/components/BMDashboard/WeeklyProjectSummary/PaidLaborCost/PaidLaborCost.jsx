import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import styles from './PaidLaborCost.module.css';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import logger from '../../../../services/logService';
import config from '../../../../config.json';
import { ENDPOINTS } from '../../../../utils/URL';

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

/**
 * Checks if the current environment is development
 * @returns {boolean} True if running in development environment
 */
const isDevelopmentEnvironment = () => {
  const hostname = window.location.hostname;
  // Check if hostname contains 'dev' or 'localhost' or '127.0.0.1'
  return (
    hostname.includes('dev') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    process.env.NODE_ENV === 'development'
  );
};

/**
 * aggregateData:
 * - If the Project Filter is "All Projects", aggregate all projects into one group labeled "All Projects"
 *   and—if the Task Filter is empty or 'ALL'—include only the two most expensive sub-tasks.
 * - Otherwise, aggregate only for the selected project.
 * - Backend handles all date filtering, so this function works with pre-filtered data.
 * @param {Array} data - Array of labor cost records
 * @param {Array|string} taskFilter - Array of selected task names, or 'ALL' for all tasks
 * @param {string} projectFilter - Selected project name or 'All Projects'
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
    // Handle both array and 'ALL' string for backward compatibility
    if (taskFilter === 'ALL' || (Array.isArray(taskFilter) && taskFilter.length === 0)) {
      // Pick the two most expensive tasks by cost
      tasksToInclude = tasks
        .sort((a, b) => aggregation[label][b] - aggregation[label][a])
        .slice(0, 2);
    } else if (Array.isArray(taskFilter)) {
      // Multiple tasks selected
      tasksToInclude = taskFilter.filter(task => tasks.includes(task));
    } else {
      // Single task (backward compatibility)
      tasksToInclude = [taskFilter];
    }
    return { labels: [label], aggregation, tasksToInclude };
  }

  // Specific project selected – display that project name along x-axis.
  const projectsToInclude = [projectFilter];
  const distinctTasks = [
    ...new Set(filtered.filter(d => d.project === projectFilter).map(d => d.task)),
  ];
  let tasksToInclude;
  // Handle both array and 'ALL' string for backward compatibility
  if (taskFilter === 'ALL' || (Array.isArray(taskFilter) && taskFilter.length === 0)) {
    tasksToInclude = distinctTasks;
  } else if (Array.isArray(taskFilter)) {
    // Multiple tasks selected
    tasksToInclude = taskFilter.filter(task => distinctTasks.includes(task));
  } else {
    // Single task (backward compatibility)
    tasksToInclude = [taskFilter];
  }

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
  const [taskFilter, setTaskFilter] = useState([]); // Array of selected task names, empty = all tasks
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // State to store all available tasks (unfiltered by task filter)
  // This is separate from data which contains filtered results for charting
  const [allAvailableTasks, setAllAvailableTasks] = useState([]);

  // State to store all available projects (unfiltered by project filter)
  // This prevents circular dependency where options disappear after selection
  const [allAvailableProjects, setAllAvailableProjects] = useState([]);

  // Ref to track if an API call is in progress to prevent race conditions
  const isFetchingRef = useRef(false);

  /**
   * Common fetch helper to reduce code duplication
   */
  const fetchLaborCostData = useCallback(
    async (includeProjectFilter = true, includeTaskFilter = true) => {
      const params = new URLSearchParams();

      if (includeProjectFilter && projectFilter !== 'All Projects') {
        params.append('projects', JSON.stringify([projectFilter]));
      }

      if (includeTaskFilter && Array.isArray(taskFilter) && taskFilter.length > 0) {
        params.append('tasks', JSON.stringify(taskFilter));
      }

      if (dateRange.startDate || dateRange.endDate) {
        params.append(
          'date_range',
          JSON.stringify({
            start_date: dateToISOString(dateRange.startDate),
            end_date: dateToISOString(dateRange.endDate),
          }),
        );
      }

      const queryString = params.toString();
      const apiBaseUrl = ENDPOINTS.APIEndpoint();
      const endpointPath = queryString
        ? `${apiBaseUrl}/labor-cost?${queryString}`
        : `${apiBaseUrl}/labor-cost`;

      const token = localStorage.getItem(config.tokenKey);
      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        ...(token && { Authorization: token }),
      };

      const response = await fetch(endpointPath, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return response.json();
    },
    [projectFilter, taskFilter, dateRange.startDate, dateRange.endDate],
  );

  /**
   * Build query parameters for API request
   */
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    if (projectFilter !== 'All Projects') {
      params.append('projects', JSON.stringify([projectFilter]));
    }

    if (Array.isArray(taskFilter) && taskFilter.length > 0) {
      params.append('tasks', JSON.stringify(taskFilter));
    }

    if (dateRange.startDate || dateRange.endDate) {
      params.append(
        'date_range',
        JSON.stringify({
          start_date: dateToISOString(dateRange.startDate),
          end_date: dateToISOString(dateRange.endDate),
        }),
      );
    }

    return params;
  }, [projectFilter, taskFilter, dateRange.startDate, dateRange.endDate]);

  /**
   * Validate a single data item from API response
   */
  const isValidDataItem = useCallback(item => {
    if (!item || typeof item !== 'object') return false;
    if (typeof item.project !== 'string' || typeof item.task !== 'string') return false;
    if (typeof item.cost !== 'number' || isNaN(item.cost)) return false;
    if (!item.date || !isValidISODate(item.date)) return false;
    return true;
  }, []);

  /**
   * Validate and process API response data
   */
  const processApiResponse = useCallback(
    apiData => {
      if (!apiData || typeof apiData !== 'object') {
        throw new Error('Invalid response structure: expected an object');
      }

      if (!Array.isArray(apiData.data)) {
        throw new Error('Invalid response structure: data property is not an array');
      }

      const validatedData = apiData.data.filter(isValidDataItem);

      if (validatedData.length !== apiData.data.length) {
        logger.logInfo(
          `Data validation: Filtered out ${apiData.data.length -
            validatedData.length} invalid items`,
        );
      }

      setData(validatedData);
      setTotalCost(typeof apiData.totalCost === 'number' ? apiData.totalCost : 0);

      if (isDevelopmentEnvironment()) {
        toast.info('Using mock data');
      }
    },
    [isValidDataItem],
  );

  /**
   * Handle fetch errors with retry logic for 304 responses
   */
  const fetchWithRetry = useCallback(async (endpointPath, fetchOptions) => {
    let response = await fetch(endpointPath, fetchOptions);

    logger.logInfo(`Response status: ${response.status} ${response.statusText}`);
    logger.logInfo(`Response Content-Type: ${response.headers.get('Content-Type')}`);

    if (response.status === 304) {
      const cacheBuster = `_t=${Date.now()}`;
      const retryUrl = endpointPath.includes('?')
        ? `${endpointPath}&${cacheBuster}`
        : `${endpointPath}?${cacheBuster}`;
      logger.logInfo(`Retrying with cache-busting URL: ${retryUrl}`);
      response = await fetch(retryUrl, fetchOptions);
    }

    return response;
  }, []);

  /**
   * Validate response content type and status
   */
  const validateResponse = useCallback(async response => {
    if (!response.ok) {
      const errorText = await response.text();
      logger.logError(
        new Error(
          `API request failed with status ${response.status}. Response: ${errorText.substring(
            0,
            200,
          )}`,
        ),
      );
      throw new Error(`API request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      logger.logError(
        new Error(
          `Expected JSON response but got ${contentType}. Response preview: ${responseText.substring(
            0,
            200,
          )}`,
        ),
      );
      throw new Error(
        `Invalid response type: expected JSON but got ${contentType ||
          'unknown'}. This usually means the request was caught by the frontend router.`,
      );
    }
  }, []);

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
        const params = buildQueryParams();
        const queryString = params.toString();
        const apiBaseUrl = ENDPOINTS.APIEndpoint();
        const endpointPath = queryString
          ? `${apiBaseUrl}/labor-cost?${queryString}`
          : `${apiBaseUrl}/labor-cost`;

        const token = localStorage.getItem(config.tokenKey);
        const headers = {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          ...(token && { Authorization: token }),
        };

        logger.logInfo(`Fetching labor cost data from: ${endpointPath}`);
        logger.logInfo(
          `Headers: ${JSON.stringify({ ...headers, Authorization: token ? '***' : 'none' })}`,
        );

        const fetchOptions = {
          method: 'GET',
          headers,
          cache: 'no-store',
        };

        const response = await fetchWithRetry(endpointPath, fetchOptions);
        await validateResponse(response);

        const apiData = await response.json();
        logger.logInfo(`Successfully fetched data: ${apiData.data?.length || 0} items`);

        processApiResponse(apiData);
      } catch (error) {
        logger.logError(error);
        toast.error('Error fetching data. Please try again later.');
        setData([]);
        setTotalCost(0);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [buildQueryParams, fetchWithRetry, validateResponse, processApiResponse]);

  // Fetch all available tasks (without task filter) to populate dropdown options
  // This runs independently from the main data fetch and doesn't include task filter
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const apiData = await fetchLaborCostData(true, false);

        if (Array.isArray(apiData.data)) {
          const validatedData = apiData.data.filter(item => {
            if (!item || typeof item !== 'object') return false;
            if (typeof item.project !== 'string' || typeof item.task !== 'string') return false;
            return true;
          });
          const uniqueTasks = [...new Set(validatedData.map(item => item.task))];
          setAllAvailableTasks(uniqueTasks);
        }
      } catch (error) {
        logger.logError(error);
        // Don't show error toast - this is a background operation
      }
    };

    fetchAllTasks();
  }, [fetchLaborCostData]);

  // Fetch all available projects (without project filter) to populate dropdown options
  // This runs independently and doesn't include project filter to avoid circular dependency
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const apiData = await fetchLaborCostData(false, true);

        if (Array.isArray(apiData.data)) {
          const validatedData = apiData.data.filter(item => {
            if (!item || typeof item !== 'object') return false;
            if (typeof item.project !== 'string' || typeof item.task !== 'string') return false;
            return true;
          });
          const uniqueProjects = [...new Set(validatedData.map(item => item.project))];
          setAllAvailableProjects(uniqueProjects);
        }
      } catch (error) {
        logger.logError(error);
        // Don't show error toast - this is a background operation
      }
    };

    fetchAllProjects();
  }, [fetchLaborCostData]);

  // Use API data only
  const currentData = data;

  // Derive unique filter values from current data
  const distinctProjects = useMemo(() => [...new Set(currentData.map(d => d.project))], [
    currentData,
  ]);

  // distinctTasks is still used in aggregateData function for filtering logic
  // Keep it for aggregation, but use allAvailableTasks for dropdown options
  const distinctTasks = useMemo(() => [...new Set(currentData.map(d => d.task))], [currentData]);

  // Aggregate data based on filters (backend handles date filtering)
  const { labels, aggregation, tasksToInclude } = aggregateData(
    currentData,
    taskFilter,
    projectFilter,
  );

  /**
   * Get background color for select option based on state
   */
  const getOptionBackgroundColor = useCallback(
    (isSelected, isFocused) => {
      if (isSelected) {
        return darkMode ? '#e8a71c' : '#0d55b3';
      }
      if (isFocused) {
        return darkMode ? '#3a506b' : '#f0f0f0';
      }
      return darkMode ? '#253342' : '#fff';
    },
    [darkMode],
  );

  /**
   * Get text color for select option based on state
   */
  const getOptionColor = useCallback(
    isSelected => {
      if (isSelected) {
        return darkMode ? '#000' : '#fff';
      }
      return darkMode ? '#ffffff' : '#000';
    },
    [darkMode],
  );

  // Build stable option lists for selects
  // react-select requires { label, value } format
  // Use allAvailableTasks instead of distinctTasks to avoid circular dependency
  // allAvailableTasks contains ALL tasks (unfiltered), so multi-select works correctly
  const taskOptions = useMemo(
    () =>
      allAvailableTasks.map(task => ({
        label: task,
        value: task,
      })),
    [allAvailableTasks],
  );

  // Use allAvailableProjects instead of distinctProjects to avoid circular dependency
  // allAvailableProjects contains ALL projects (unfiltered), so dropdown always shows all options
  const projectOptions = useMemo(
    () => [
      { label: 'ALL', value: 'All Projects' },
      ...allAvailableProjects.map(proj => ({
        label: proj,
        value: proj,
      })),
    ],
    [allAvailableProjects],
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
  // Use consistent bar sizing for all bars regardless of number of tasks
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
      // Consistent bar sizing - maxBarThickness ensures bars don't get too wide
      maxBarThickness: 50,
      // Category and bar percentages for consistent spacing
      categoryPercentage: 0.8,
      barPercentage: 0.9,
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
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
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
        // Ensure proper spacing between categories
        offset: true,
      },
      y: {
        grid: { color: '#ccc' },
        beginAtZero: true,
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

  // Inline styles for react-select with hardcoded colors to override default styles
  // Using hardcoded values that match CSS variables from WeeklyProjectSummary
  const selectStyles = useMemo(
    () => ({
      control: base => ({
        ...base,
        minHeight: '38px',
        minWidth: '150px',
        width: '100%',
        fontSize: '14px',
        backgroundColor: darkMode ? '#253342' : '#fff',
        borderColor: darkMode ? '#2d4059' : '#ccc',
        color: darkMode ? '#ffffff' : '#000',
        boxShadow: 'none',
        borderRadius: '6px',
        '&:hover': {
          borderColor: darkMode ? '#2d4059' : '#999',
        },
      }),
      valueContainer: base => ({
        ...base,
        padding: '2px 8px',
        color: darkMode ? '#ffffff' : '#000',
      }),
      input: base => ({
        ...base,
        margin: '0px',
        padding: '0px',
        color: darkMode ? '#ffffff' : '#000',
      }),
      indicatorsContainer: base => ({
        ...base,
        padding: '0 4px',
      }),
      multiValue: base => ({
        ...base,
        backgroundColor: darkMode ? '#2d4059' : '#e0e0e0',
        borderRadius: '4px',
        fontSize: '13px',
        margin: '2px',
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#333',
        padding: '3px 8px',
        fontSize: '13px',
      }),
      multiValueRemove: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#333',
        padding: '0 4px',
        cursor: 'pointer',
        ':hover': {
          backgroundColor: darkMode ? '#3a506b' : '#d0d0d0',
          color: darkMode ? '#ffffff' : '#333',
        },
      }),
      placeholder: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#999',
        opacity: darkMode ? 0.6 : 1,
        fontSize: '14px',
      }),
      singleValue: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#000',
        fontSize: '14px',
      }),
      menu: base => ({
        ...base,
        width: '100%',
        minWidth: '150px',
        backgroundColor: darkMode ? '#253342' : '#fff',
        borderColor: darkMode ? '#2d4059' : '#ccc',
        border: `1px solid ${darkMode ? '#2d4059' : '#ccc'}`,
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontSize: '14px',
        zIndex: 9999,
        marginTop: '4px',
      }),
      menuList: base => ({
        ...base,
        backgroundColor: darkMode ? '#253342' : '#fff',
        padding: '4px 0',
        borderRadius: '6px',
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: getOptionBackgroundColor(state.isSelected, state.isFocused),
        color: getOptionColor(state.isSelected),
        cursor: 'pointer',
        padding: '10px 12px',
        fontSize: '14px',
        ':active': {
          backgroundColor: darkMode ? '#3a506b' : '#e0e0e0',
        },
      }),
      indicatorSeparator: base => ({
        ...base,
        backgroundColor: darkMode ? '#2d4059' : '#ccc',
      }),
      dropdownIndicator: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#999',
        padding: '4px',
        ':hover': {
          color: darkMode ? '#ffffff' : '#666',
        },
      }),
      clearIndicator: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#999',
        padding: '4px',
        ':hover': {
          color: darkMode ? '#ffffff' : '#666',
        },
      }),
    }),
    [darkMode, getOptionBackgroundColor, getOptionColor],
  );

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
              <Select
                id="task-filter"
                isMulti
                options={taskOptions}
                value={taskOptions.filter(option => taskFilter.includes(option.value))}
                onChange={selected => {
                  setTaskFilter(selected ? selected.map(option => option.value) : []);
                }}
                isClearable
                placeholder="Select tasks (leave empty for all)"
                classNamePrefix="select"
                styles={selectStyles}
              />
            </div>

            {/* Project Filter */}
            <div className={styles.paidLaborCostFilterGroup}>
              <label className={styles.paidLaborCostFilterLabel} htmlFor="project-filter">
                Project
              </label>
              <Select
                id="project-filter"
                options={projectOptions}
                value={projectOptions.find(option => option.value === projectFilter)}
                onChange={selected => {
                  setProjectFilter(selected ? selected.value : 'All Projects');
                }}
                isClearable={false}
                placeholder="Select project"
                classNamePrefix="select"
                styles={selectStyles}
              />
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
                  calendarClassName={`paid-labor-cost-calendar${
                    darkMode ? ' paid-labor-cost-dark-calendar' : ''
                  }`}
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
                  calendarClassName={`paid-labor-cost-calendar${
                    darkMode ? ' paid-labor-cost-dark-calendar' : ''
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className={styles.paidLaborCostChartWrapper}>
            <div className={styles.paidLaborCostChartContainer}>
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
