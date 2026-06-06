import { useState, useEffect, useMemo, useCallback } from 'react';
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

const MOCK_DB = [
  {
    project: 'Project Alpha',
    task: 'Deployment',
    cost: 25000,
    budget: 22000,
    date: moment()
      .subtract(1, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Research',
    cost: 15000,
    budget: 18000,
    date: moment()
      .subtract(3, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Design',
    cost: 12000,
    budget: 12000,
    date: moment()
      .subtract(5, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Deployment',
    cost: 10000,
    budget: 12000,
    date: moment()
      .subtract(12, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Testing',
    cost: 8500,
    budget: 8000,
    date: moment()
      .subtract(18, 'days')
      .toISOString(),
  },
  {
    project: 'Project Alpha',
    task: 'Research',
    cost: 14000,
    budget: 15000,
    date: moment()
      .subtract(25, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Deployment',
    cost: 31000,
    budget: 30000,
    date: moment().toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Research',
    cost: 36000,
    budget: 32000,
    date: moment()
      .subtract(7, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Testing',
    cost: 8000,
    budget: 10000,
    date: moment()
      .subtract(10, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Design',
    cost: 22000,
    budget: 20000,
    date: moment()
      .subtract(15, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Deployment',
    cost: 18000,
    budget: 20000,
    date: moment()
      .subtract(20, 'days')
      .toISOString(),
  },
  {
    project: 'Project Beta',
    task: 'Testing',
    cost: 9000,
    budget: 7500,
    date: moment()
      .subtract(28, 'days')
      .toISOString(),
  },
  {
    project: 'Project Gamma',
    task: 'Design',
    cost: 45000,
    budget: 40000,
    date: moment()
      .subtract(2, 'days')
      .toISOString(),
  },
  {
    project: 'Project Gamma',
    task: 'Research',
    cost: 12000,
    budget: 15000,
    date: moment()
      .subtract(14, 'days')
      .toISOString(),
  },
  {
    project: 'Project Gamma',
    task: 'Deployment',
    cost: 28000,
    budget: 30000,
    date: moment()
      .subtract(22, 'days')
      .toISOString(),
  },
];

const dateToISOString = date => {
  if (!date) return null;
  return moment(date).toISOString();
};

const isValidISODate = dateString => {
  if (!dateString) return false;
  return moment(dateString).isValid();
};

const isDevelopmentEnvironment = () => {
  if (typeof globalThis.window === 'undefined') {
    return process.env.NODE_ENV === 'development';
  }
  const hostname = globalThis.window.location.hostname;
  return (
    hostname.includes('dev') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    process.env.NODE_ENV === 'development'
  );
};

const getFilteredMockData = (projectFilter, taskFilter, dateRange, mockDb) => {
  let filteredMock = mockDb;

  if (projectFilter !== 'All Projects') {
    filteredMock = filteredMock.filter(d => d.project === projectFilter);
  }
  if (taskFilter.length > 0) {
    filteredMock = filteredMock.filter(d => taskFilter.includes(d.task));
  }
  if (dateRange.startDate) {
    const start = moment(dateRange.startDate).startOf('day');
    filteredMock = filteredMock.filter(d => moment(d.date).isSameOrAfter(start));
  }
  if (dateRange.endDate) {
    const end = moment(dateRange.endDate).endOf('day');
    filteredMock = filteredMock.filter(d => moment(d.date).isSameOrBefore(end));
  }

  return filteredMock;
};

function aggregateData(data, taskFilter, projectFilter) {
  if (!Array.isArray(data)) {
    return { labels: [], aggregation: {}, tasksToInclude: [] };
  }

  const validData = data.filter(item => {
    if (!item || typeof item !== 'object') return false;
    if (typeof item.project !== 'string' || typeof item.task !== 'string') return false;
    if (typeof item.cost !== 'number' || Number.isNaN(item.cost)) return false;
    if (!item.date) return false;
    return true;
  });

  if (projectFilter === 'All Projects') {
    const label = 'All Projects';
    const aggregation = { [label]: { totalCost: 0, totalBudget: 0 } };
    const tasks = [...new Set(validData.map(d => d.task))];

    tasks.forEach(task => {
      aggregation[label][task] = { cost: 0, budget: 0 };
    });

    validData.forEach(item => {
      aggregation[label].totalCost += item.cost;
      aggregation[label].totalBudget += item.budget || 0;

      if (aggregation[label][item.task] !== undefined) {
        aggregation[label][item.task].cost += item.cost;
        aggregation[label][item.task].budget += item.budget || 0;
      }
    });

    let tasksToInclude;
    if (taskFilter === 'ALL' || (Array.isArray(taskFilter) && taskFilter.length === 0)) {
      tasksToInclude = tasks
        .sort((a, b) => aggregation[label][b].cost - aggregation[label][a].cost)
        .slice(0, 2);
    } else if (Array.isArray(taskFilter)) {
      tasksToInclude = taskFilter.filter(task => tasks.includes(task));
    } else {
      tasksToInclude = [taskFilter];
    }
    return { labels: [label], aggregation, tasksToInclude };
  }

  const projectsToInclude = [projectFilter];
  const distinctTasks = [
    ...new Set(validData.filter(d => d.project === projectFilter).map(d => d.task)),
  ];

  let tasksToInclude;
  if (taskFilter === 'ALL' || (Array.isArray(taskFilter) && taskFilter.length === 0)) {
    tasksToInclude = distinctTasks;
  } else if (Array.isArray(taskFilter)) {
    tasksToInclude = taskFilter.filter(task => distinctTasks.includes(task));
  } else {
    tasksToInclude = [taskFilter];
  }

  const aggregation = {};
  projectsToInclude.forEach(proj => {
    aggregation[proj] = { totalCost: 0, totalBudget: 0 };
    tasksToInclude.forEach(t => {
      aggregation[proj][t] = { cost: 0, budget: 0 };
    });
  });

  validData.forEach(item => {
    if (item.project === projectFilter) {
      aggregation[projectFilter].totalCost += item.cost;
      aggregation[projectFilter].totalBudget += item.budget || 0;
      if (tasksToInclude.includes(item.task)) {
        aggregation[projectFilter][item.task].cost += item.cost;
        aggregation[projectFilter][item.task].budget += item.budget || 0;
      }
    }
  });

  return { labels: projectsToInclude, aggregation, tasksToInclude };
}

export default function PaidLaborCost() {
  const [data, setData] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  const darkMode = useSelector(state => state.theme.darkMode);
  const textColor = darkMode ? '#ffffff' : '#666';

  const [taskFilter, setTaskFilter] = useState([]);
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [allAvailableTasks, setAllAvailableTasks] = useState([]);
  const [allAvailableProjects, setAllAvailableProjects] = useState([]);

  const buildLaborCostEndpoint = useCallback(() => {
    const params = new URLSearchParams();
    if (projectFilter !== 'All Projects') {
      params.append('projects', JSON.stringify([projectFilter]));
    }
    if (taskFilter.length > 0) {
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
    return queryString ? `${apiBaseUrl}/labor-cost?${queryString}` : `${apiBaseUrl}/labor-cost`;
  }, [projectFilter, taskFilter, dateRange.startDate, dateRange.endDate]);

  const fetchLaborCostData = useCallback(
    async (includeProjectFilter = true, includeTaskFilter = true) => {
      if (isDevelopmentEnvironment()) {
        return { data: MOCK_DB, totalCost: MOCK_DB.reduce((sum, item) => sum + item.cost, 0) };
      }

      const endpointPath = buildLaborCostEndpoint();
      const token = localStorage.getItem(config.tokenKey);
      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        ...(token && { Authorization: token }),
      };

      const response = await fetch(endpointPath, { method: 'GET', headers, cache: 'no-store' });
      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
      return response.json();
    },
    [buildLaborCostEndpoint],
  );

  const isValidDataItem = useCallback(item => {
    if (!item || typeof item !== 'object') return false;
    if (typeof item.project !== 'string' || typeof item.task !== 'string') return false;
    if (typeof item.cost !== 'number' || Number.isNaN(item.cost)) return false;
    if (!item.date || !isValidISODate(item.date)) return false;
    return true;
  }, []);

  const processApiResponse = useCallback(
    apiData => {
      let dataToProcess = apiData.data || [];
      let calculatedTotalBudget = 0;

      const validatedData = dataToProcess.filter(isValidDataItem).map(item => {
        const itemBudget = item.budget || item.cost * 0.9;
        calculatedTotalBudget += itemBudget;
        return { ...item, budget: itemBudget };
      });

      setData(validatedData);
      setTotalCost(
        typeof apiData.totalCost === 'number'
          ? apiData.totalCost
          : dataToProcess.reduce((s, i) => s + i.cost, 0),
      );
      setTotalBudget(calculatedTotalBudget);
    },
    [isValidDataItem],
  );

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const endpointPath = buildLaborCostEndpoint();
        const token = localStorage.getItem(config.tokenKey);
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: token }),
        };

        const response = await fetch(endpointPath, {
          method: 'GET',
          headers,
          cache: 'no-store',
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);

        const apiData = await response.json();
        processApiResponse(apiData);
      } catch (error) {
        if (error.name === 'AbortError') return;

        if (isDevelopmentEnvironment()) {
          const filteredMock = getFilteredMockData(projectFilter, taskFilter, dateRange, MOCK_DB);
          const mockTotal = filteredMock.reduce((sum, item) => sum + item.cost, 0);
          processApiResponse({ data: filteredMock, totalCost: mockTotal });
        } else {
          logger.logError(error);
          toast.error('Error fetching data.');
          setData([]);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [
    projectFilter,
    taskFilter,
    dateRange.startDate,
    dateRange.endDate,
    processApiResponse,
    buildLaborCostEndpoint,
  ]);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const apiData = await fetchLaborCostData(true, false);
        if (Array.isArray(apiData.data)) {
          const uniqueTasks = [...new Set(apiData.data.map(item => item.task))];
          setAllAvailableTasks(uniqueTasks);
        }
      } catch (error) {
        logger.logError(error);
      }
    };
    fetchAllTasks();
  }, [fetchLaborCostData]);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const apiData = await fetchLaborCostData(false, true);
        if (Array.isArray(apiData.data)) {
          const uniqueProjects = [...new Set(apiData.data.map(item => item.project))];
          setAllAvailableProjects(uniqueProjects);
        }
      } catch (error) {
        logger.logError(error);
      }
    };
    fetchAllProjects();
  }, [fetchLaborCostData]);

  const { labels, aggregation, tasksToInclude } = aggregateData(data, taskFilter, projectFilter);

  const getOptionBackgroundColor = useCallback(
    (isSelected, isFocused) => {
      if (isSelected) return darkMode ? '#e8a71c' : '#0d55b3';
      if (isFocused) return darkMode ? '#3a506b' : '#f0f0f0';
      return darkMode ? '#253342' : '#fff';
    },
    [darkMode],
  );

  const getOptionColor = useCallback(
    isSelected => {
      if (isSelected) return darkMode ? '#000' : '#fff';
      return darkMode ? '#ffffff' : '#000';
    },
    [darkMode],
  );

  const taskOptions = useMemo(() => allAvailableTasks.map(task => ({ label: task, value: task })), [
    allAvailableTasks,
  ]);

  const projectOptions = useMemo(
    () => [
      { label: 'ALL', value: 'All Projects' },
      ...allAvailableProjects.map(proj => ({ label: proj, value: proj })),
    ],
    [allAvailableProjects],
  );

  const handleStartDateChange = date => setDateRange(prev => ({ ...prev, startDate: date }));
  const handleEndDateChange = date => setDateRange(prev => ({ ...prev, endDate: date }));

  const taskDatasets = tasksToInclude.flatMap((task, idx) => {
    const hue = Math.round((idx * 360) / tasksToInclude.length);
    const saturation = 65;
    const lightness = darkMode ? 70 : 50;

    const actualColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const budgetColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`;

    return [
      {
        label: `${task} (Actual)`,
        backgroundColor: actualColor,
        borderRadius: 4,
        data: labels.map(label => Math.round((aggregation[label][task]?.cost || 0) / 1000)),
        maxBarThickness: 50,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
      {
        label: `${task} (Budget)`,
        backgroundColor: budgetColor,
        borderColor: actualColor,
        borderWidth: { top: 2, right: 2, bottom: 0, left: 2 },
        borderDash: [5, 5],
        borderRadius: 4,
        data: labels.map(label => Math.round((aggregation[label][task]?.budget || 0) / 1000)),
        maxBarThickness: 50,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
    ];
  });

  const chartData = { labels, datasets: taskDatasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 }, color: textColor } },
      tooltip: {
        callbacks: {
          label(context) {
            const project = context.chart.data.labels[context.dataIndex];
            const costThousands = context.parsed.y || 0;
            const costDollars = costThousands * 1000;
            return `${project}, ${context.dataset.label}: $${costDollars.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: textColor },
        offset: true,
      },
      y: {
        grid: { color: '#ccc' },
        beginAtZero: true,
        title: { display: true, text: 'Cost (000s)', font: { size: 12 }, color: textColor },
        ticks: { font: { size: 12 }, color: textColor },
      },
    },
  };

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
        '&:hover': { borderColor: darkMode ? '#2d4059' : '#999' },
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
      indicatorsContainer: base => ({ ...base, padding: '0 4px' }),
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

  const varianceColor = totalCost > totalBudget ? '#e74c3c' : '#2ecc71';
  const absoluteVariance = Math.abs(totalCost - totalBudget);
  const variancePercentage = totalBudget > 0 ? ((totalCost - totalBudget) / totalBudget) * 100 : 0;

  if (initialLoading) {
    return (
      <div className={styles.paidLaborCostContainer}>
        <h4 className={styles.paidLaborCostTitle}>Paid Labor Cost</h4>
        <div className={styles.paidLaborCostLoading}>Loading data...</div>
      </div>
    );
  }

  return (
    <div className={styles.paidLaborCostContainer}>
      <h4 className={styles.paidLaborCostTitle}>Paid Labor Cost</h4>

      <div className={styles.paidLaborCostFilters}>
        <div className={styles.paidLaborCostFilterGroup}>
          <label className={styles.paidLaborCostFilterLabel} htmlFor="task-filter">
            Tasks
          </label>
          <Select
            id="task-filter"
            isMulti
            options={taskOptions}
            value={taskOptions.filter(option => taskFilter.includes(option.value))}
            onChange={selected =>
              setTaskFilter(selected ? selected.map(option => option.value) : [])
            }
            isClearable
            placeholder="Select tasks (leave empty for all)"
            classNamePrefix="select"
            styles={selectStyles}
          />
        </div>
        <div className={styles.paidLaborCostFilterGroup}>
          <label className={styles.paidLaborCostFilterLabel} htmlFor="project-filter">
            Project
          </label>
          <Select
            id="project-filter"
            options={projectOptions}
            value={projectOptions.find(option => option.value === projectFilter)}
            onChange={selected => setProjectFilter(selected ? selected.value : 'All Projects')}
            isClearable={false}
            placeholder="Select project"
            classNamePrefix="select"
            styles={selectStyles}
          />
        </div>
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

      <div className={styles.paidLaborCostChartWrapper}>
        <div className={styles.paidLaborCostChartContainer}>
          <Bar data={chartData} options={options} />
        </div>
      </div>

      <div
        className={styles.paidLaborCostSummary}
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          marginTop: '20px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span className={styles.paidLaborCostSummaryLabel}>Total Budget</span>
          <br />
          <span className={styles.paidLaborCostSummaryValue}>
            $
            {totalBudget.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span className={styles.paidLaborCostSummaryLabel}>Total Actual</span>
          <br />
          <span className={styles.paidLaborCostSummaryValue}>
            $
            {totalCost.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span className={styles.paidLaborCostSummaryLabel}>Variance</span>
          <br />
          <span style={{ fontSize: '20px', fontWeight: '700', color: varianceColor }}>
            $
            {absoluteVariance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            ({variancePercentage > 0 ? '+' : ''}
            {variancePercentage.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
