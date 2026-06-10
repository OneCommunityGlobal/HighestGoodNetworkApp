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
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import styles from './PaidLaborCost.module.css';
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

function aggregateData(data, taskFilter, projectFilter, dateRange) {
  if (!Array.isArray(data)) {
    return { labels: [], aggregation: {}, tasksToInclude: [] };
  }

  const validData = data.filter(item => {
    if (
      dateRange.startDate &&
      moment(item.date).isBefore(moment(dateRange.startDate).startOf('day'))
    )
      return false;
    if (dateRange.endDate && moment(item.date).isAfter(moment(dateRange.endDate).endOf('day')))
      return false;
    if (projectFilter !== 'All Projects' && item.project !== projectFilter) return false;
    if (taskFilter.length > 0 && !taskFilter.includes(item.task)) return false;
    return true;
  });

  if (validData.length === 0) {
    return { labels: [], aggregation: {}, tasksToInclude: [] };
  }

  const label = projectFilter === 'All Projects' ? 'All Projects' : projectFilter;
  const aggregation = { [label]: { totalCost: 0, totalBudget: 0 } };

  const distinctTasks = [...new Set(validData.map(d => d.task))];

  // Show all tasks if no task filter is applied, regardless of project
  const tasksToInclude = taskFilter.length > 0 ? taskFilter : distinctTasks;

  tasksToInclude.forEach(t => {
    aggregation[label][t] = { cost: 0, budget: 0 };
  });

  validData.forEach(item => {
    aggregation[label].totalCost += item.cost;
    aggregation[label].totalBudget += item.budget;

    if (tasksToInclude.includes(item.task)) {
      aggregation[label][item.task].cost += item.cost;
      aggregation[label][item.task].budget += item.budget;
    }
  });

  return { labels: [label], aggregation, tasksToInclude };
}

export default function PaidLaborCost() {
  const [data, setData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const darkMode = useSelector(state => state.theme.darkMode);
  const textColor = darkMode ? '#ffffff' : '#666';

  const [taskFilter, setTaskFilter] = useState([]);
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  const processApiResponse = useCallback(apiData => {
    const dataToProcess = apiData.data || apiData || [];

    const validatedData = dataToProcess
      .map(item => {
        const projName = typeof item.project === 'object' ? item.project?.name : item.project;
        const taskName =
          typeof item.task === 'object' ? item.task?.name || item.task?.taskName : item.task;
        const itemCost = Number(item.cost) || 0;
        const itemBudget = item.budget || itemCost * 0.9;

        return {
          ...item,
          project: projName || 'Unknown Project',
          task: taskName || 'Unknown Task',
          cost: itemCost,
          budget: itemBudget,
          date: item.date,
        };
      })
      .filter(item => item.date && isValidISODate(item.date));

    setData(validatedData);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const token = localStorage.getItem(config.tokenKey);
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: token }),
        };

        const response = await fetch(`${ENDPOINTS.APIEndpoint()}/labor-cost`, {
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
          processApiResponse({ data: MOCK_DB });
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
  }, [processApiResponse]);

  const allAvailableProjects = useMemo(() => [...new Set(data.map(d => d.project))], [data]);
  const allAvailableTasks = useMemo(() => [...new Set(data.map(d => d.task))], [data]);

  const { labels, aggregation, tasksToInclude } = useMemo(
    () => aggregateData(data, taskFilter, projectFilter, dateRange),
    [data, taskFilter, projectFilter, dateRange],
  );

  const displayTotalCost = labels.length > 0 ? aggregation[labels[0]]?.totalCost || 0 : 0;
  const displayTotalBudget = labels.length > 0 ? aggregation[labels[0]]?.totalBudget || 0 : 0;

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
    const hue = Math.round((idx * 360) / Math.max(1, tasksToInclude.length));
    const saturation = 65;
    const lightness = darkMode ? 65 : 50;

    const actualColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const budgetColor = darkMode
      ? `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.8)`
      : `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`;

    return [
      {
        label: `${task} (Actual)`,
        backgroundColor: actualColor,
        borderRadius: 4,
        data: labels.map(label => Math.round((aggregation[label][task]?.cost || 0) / 1000)),
        maxBarThickness: 40,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
      {
        label: `${task} (Budget)`,
        backgroundColor: budgetColor,
        borderColor: actualColor,
        borderWidth: { top: 2, right: 2, bottom: 0, left: 2 },
        borderDash: [4, 4],
        borderRadius: 4,
        data: labels.map(label => Math.round((aggregation[label][task]?.budget || 0) / 1000)),
        maxBarThickness: 40,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
    ];
  });

  const chartData = { labels, datasets: taskDatasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 30, left: 10, right: 10, bottom: 10 } },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          color: textColor,
          padding: 20,
          usePointStyle: true,
        },
      },
      datalabels: {
        color: darkMode ? '#ffffff' : '#333333',
        font: { weight: '600', size: 11 },
      },
      tooltip: {
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        titleColor: darkMode ? '#f8fafc' : '#0f172a',
        bodyColor: darkMode ? '#f8fafc' : '#0f172a',
        borderColor: darkMode ? '#334155' : '#e2e8f0',
        borderWidth: 1,
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
        grid: { color: darkMode ? '#334155' : '#e2e8f0' },
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
        width: '100%',
        fontSize: '13px',
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
        fontSize: '12px',
        margin: '2px',
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#333',
        padding: '3px 8px',
      }),
      multiValueRemove: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#333',
        cursor: 'pointer',
        ':hover': {
          backgroundColor: darkMode ? '#3a506b' : '#d0d0d0',
          color: darkMode ? '#ffffff' : '#333',
        },
      }),
      placeholder: base => ({
        ...base,
        color: darkMode ? '#94a3b8' : '#999',
        fontSize: '13px',
      }),
      singleValue: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#000',
        fontSize: '13px',
      }),
      menu: base => ({
        ...base,
        backgroundColor: darkMode ? '#253342' : '#fff',
        border: `1px solid ${darkMode ? '#2d4059' : '#ccc'}`,
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontSize: '13px',
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
        padding: '8px 12px',
        fontSize: '13px',
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
        color: darkMode ? '#94a3b8' : '#999',
        padding: '4px',
        ':hover': {
          color: darkMode ? '#ffffff' : '#666',
        },
      }),
      clearIndicator: base => ({
        ...base,
        color: darkMode ? '#94a3b8' : '#999',
        padding: '4px',
        ':hover': {
          color: darkMode ? '#ffffff' : '#666',
        },
      }),
    }),
    [darkMode, getOptionBackgroundColor, getOptionColor],
  );

  const absoluteVariance = Math.abs(displayTotalCost - displayTotalBudget);
  const variancePercentage =
    displayTotalBudget > 0
      ? ((displayTotalCost - displayTotalBudget) / displayTotalBudget) * 100
      : 0;

  let varianceClass = styles.varianceNeutral;
  if (absoluteVariance > 0.01) {
    if (displayTotalCost > displayTotalBudget) {
      varianceClass = styles.varianceOver;
    } else {
      varianceClass = styles.varianceUnder;
    }
  }

  if (initialLoading) {
    return (
      <div className={styles.paidLaborCostContainer}>
        <h4 className={styles.paidLaborCostTitle}>Paid Labor Cost</h4>
        <div className={styles.paidLaborCostLoading}>Loading data...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.paidLaborCostContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h4 className={styles.paidLaborCostTitle}>Paid Labor Cost</h4>

      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="task-filter">
            Tasks
          </label>
          <Select
            inputId="task-filter"
            isMulti
            options={taskOptions}
            value={taskOptions.filter(option => taskFilter.includes(option.value))}
            onChange={selected =>
              setTaskFilter(selected ? selected.map(option => option.value) : [])
            }
            isClearable
            placeholder="All tasks"
            classNamePrefix="select"
            styles={selectStyles}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="project-filter">
            Project
          </label>
          <Select
            inputId="project-filter"
            options={projectOptions}
            value={projectOptions.find(option => option.value === projectFilter)}
            onChange={selected => setProjectFilter(selected ? selected.value : 'All Projects')}
            isClearable={false}
            placeholder="Select project"
            classNamePrefix="select"
            styles={selectStyles}
          />
        </div>
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel} id="date-range-label">
            Date Range
          </div>
          <div className={styles.dateRangeFlex} role="group" aria-labelledby="date-range-label">
            <div className={styles.datePickerWrapper}>
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
                aria-label="Start Date"
                className={`${styles.dateInput} ${darkMode ? styles.darkDateInput : ''}`}
                calendarClassName={darkMode ? 'paid-labor-cost-dark-calendar' : ''}
              />
            </div>
            <span className={styles.dateSeparator}>to</span>
            <div className={styles.datePickerWrapper}>
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
                aria-label="End Date"
                className={`${styles.dateInput} ${darkMode ? styles.darkDateInput : ''}`}
                calendarClassName={darkMode ? 'paid-labor-cost-dark-calendar' : ''}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.paidLaborCostChartWrapper}>
        <div className={styles.paidLaborCostChartContainer}>
          {labels.length === 0 ? (
            <div className={styles.emptyState}>No data available for the selected filters.</div>
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </div>

      <div className={`${styles.summaryContainer} ${darkMode ? styles.darkSummaryContainer : ''}`}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Budget</span>
          <span className={styles.summaryValue} style={{ color: textColor }}>
            $
            {displayTotalBudget.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Actual</span>
          <span className={styles.summaryValue} style={{ color: textColor }}>
            $
            {displayTotalCost.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Variance</span>
          <span className={`${styles.summaryValue} ${varianceClass}`}>
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
