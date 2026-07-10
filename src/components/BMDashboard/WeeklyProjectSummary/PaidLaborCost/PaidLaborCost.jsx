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
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select, { components } from 'react-select';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import styles from './PaidLaborCost.module.css';
import logger from '../../../../services/logService';
import config from '../../../../config.json';
import { ENDPOINTS } from '../../../../utils/URL';
import { MOCK_DB } from './mockLaborCostData';
import PropTypes from 'prop-types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const isValidISODate = dateString => {
  if (!dateString) return false;
  return moment(dateString).isValid();
};

const isDevelopmentEnvironment = () => {
  if (globalThis.window === undefined) {
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

const fetchLaborDataFromAPI = async signal => {
  const token = localStorage.getItem(config.tokenKey);
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: token }),
  };

  const response = await fetch(`${ENDPOINTS.APIEndpoint()}/labor-cost`, {
    method: 'GET',
    headers,
    cache: 'no-store',
    signal,
  });

  if (!response.ok) throw new Error(`Status ${response.status}`);
  return response.json();
};

const formatApiData = apiData => {
  const dataToProcess = apiData.data || apiData || [];
  return dataToProcess
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

const calculateVarianceMetrics = (displayTotalCost, displayTotalBudget, componentStyles) => {
  const absoluteVariance = Math.abs(displayTotalCost - displayTotalBudget);
  const variancePercentage =
    displayTotalBudget > 0
      ? ((displayTotalCost - displayTotalBudget) / displayTotalBudget) * 100
      : 0;

  let varianceClass = componentStyles.varianceNeutral;
  if (absoluteVariance > 0.01) {
    varianceClass =
      displayTotalCost > displayTotalBudget
        ? componentStyles.varianceOver
        : componentStyles.varianceUnder;
  }

  return { absoluteVariance, variancePercentage, varianceClass };
};

const getOptionBackgroundColor = (darkMode, isSelected, isFocused) => {
  if (isSelected) return darkMode ? '#e8a71c' : '#0d55b3';
  if (isFocused) return darkMode ? '#3a506b' : '#f0f0f0';
  return darkMode ? '#253342' : '#fff';
};

const getOptionColor = (darkMode, isSelected) => {
  if (isSelected) return darkMode ? '#000' : '#fff';
  return darkMode ? '#ffffff' : '#000';
};

const generateSelectStyles = darkMode => ({
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
    backgroundColor: getOptionBackgroundColor(darkMode, state.isSelected, state.isFocused),
    color: getOptionColor(darkMode, state.isSelected),
    cursor: 'pointer',
    padding: '8px 12px',
    fontSize: '13px',
    ':active': { backgroundColor: darkMode ? '#3a506b' : '#e0e0e0' },
  }),
  indicatorSeparator: base => ({ ...base, backgroundColor: darkMode ? '#2d4059' : '#ccc' }),
  dropdownIndicator: base => ({
    ...base,
    color: darkMode ? '#94a3b8' : '#999',
    padding: '4px',
    ':hover': { color: darkMode ? '#ffffff' : '#666' },
  }),
  clearIndicator: base => ({
    ...base,
    color: darkMode ? '#94a3b8' : '#999',
    padding: '4px',
    ':hover': { color: darkMode ? '#ffffff' : '#666' },
  }),
});

const MultiValue = () => null;

const ValueContainer = ({ children, ...props }) => {
  const length = props.getValue().length;
  const color = props.selectProps?.styles?.singleValue?.color || 'inherit';
  return (
    <components.ValueContainer {...props}>
      {length > 0 && (
        <div style={{ color }}>
          {length} item{length === 1 ? '' : 's'} selected
        </div>
      )}
      {children}
    </components.ValueContainer>
  );
};

ValueContainer.propTypes = {
  children: PropTypes.node,
  getValue: PropTypes.func.isRequired,
  selectProps: PropTypes.shape({
    styles: PropTypes.shape({
      singleValue: PropTypes.shape({
        color: PropTypes.string,
      }),
    }),
  }),
};

const Option = props => {
  return (
    <components.Option {...props}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          style={{ marginRight: '8px', cursor: 'pointer' }}
        />
        <span>{props.label}</span>
      </div>
    </components.Option>
  );
};

Option.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
};

const buildChartDatasets = (tasksToInclude, labels, aggregation, darkMode) => {
  return tasksToInclude.flatMap((task, idx) => {
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
        data: labels.map(label => aggregation[label][task]?.cost || 0),
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
        data: labels.map(label => aggregation[label][task]?.budget || 0),
        maxBarThickness: 40,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
    ];
  });
};

const buildChartOptions = (textColor, darkMode) => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 35, left: 15, right: 15, bottom: 10 } },
  plugins: {
    legend: {
      position: 'top',
      labels: { font: { size: 12 }, color: textColor, padding: 20, usePointStyle: true },
    },
    datalabels: {
      anchor: 'end',
      align: 'top',
      offset: 2,
      color: darkMode ? '#ffffff' : '#333333',
      font: { weight: '600', size: 11 },
      textStrokeColor: darkMode ? '#1e293b' : '#ffffff',
      textStrokeWidth: 3,
      formatter: value => {
        if (!value) return '';
        return value >= 1000 ? `$${(value / 1000).toFixed(1).replace('.0', '')}k` : `$${value}`;
      },
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
          const costDollars = context.parsed.y || 0;
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
      grace: '15%',
      grid: { color: darkMode ? '#334155' : '#e2e8f0' },
      beginAtZero: true,
      title: { display: true, text: 'Cost ($)', font: { size: 12 }, color: textColor },
      ticks: {
        font: { size: 12 },
        color: textColor,
        callback: value => (value >= 1000 ? `$${value / 1000}k` : `$${value}`),
      },
    },
  },
});

export default function PaidLaborCost() {
  const [data, setData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const darkMode = useSelector(state => state.theme.darkMode);
  const textColor = darkMode ? '#ffffff' : '#333';
  // Filter States
  const [taskFilter, setTaskFilter] = useState([]); // Array of selected task names, empty = all tasks
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  useEffect(() => {
    const abortController = new AbortController();

    const loadData = async () => {
      try {
        const apiData = await fetchLaborDataFromAPI(abortController.signal);
        setData(formatApiData(apiData));
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (isDevelopmentEnvironment()) {
          setData(formatApiData({ data: MOCK_DB }));
        } else {
          logger.logError(error);
          toast.error('Error fetching data.');
          setData([]);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();

    return () => {
      abortController.abort();
    };
  }, []);

  const allAvailableProjects = useMemo(() => [...new Set(data.map(d => d.project))], [data]);
  const allAvailableTasks = useMemo(() => [...new Set(data.map(d => d.task))], [data]);

  const { labels, aggregation, tasksToInclude } = useMemo(
    () => aggregateData(data, taskFilter, projectFilter, dateRange),
    [data, taskFilter, projectFilter, dateRange],
  );

  const displayTotalCost = labels.length > 0 ? aggregation[labels[0]]?.totalCost || 0 : 0;
  const displayTotalBudget = labels.length > 0 ? aggregation[labels[0]]?.totalBudget || 0 : 0;

  const { absoluteVariance, variancePercentage, varianceClass } = useMemo(
    () => calculateVarianceMetrics(displayTotalCost, displayTotalBudget, styles),
    [displayTotalCost, displayTotalBudget],
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

  const selectStyles = useMemo(() => generateSelectStyles(darkMode), [darkMode]);

  const taskDatasets = useMemo(
    () => buildChartDatasets(tasksToInclude, labels, aggregation, darkMode),
    [tasksToInclude, labels, aggregation, darkMode],
  );

  const chartData = { labels, datasets: taskDatasets };
  const options = useMemo(() => buildChartOptions(textColor, darkMode), [textColor, darkMode]);

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
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            components={{ MultiValue, ValueContainer, Option }}
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
          <label className={styles.filterLabel} htmlFor="start-date">
            Date Range
          </label>
          <div className={styles.dateRangeFlex}>
            <div className={styles.datePickerWrapper}>
              <DatePicker
                id="start-date"
                selected={dateRange.startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                maxDate={
                  dateRange.endDate ? new Date(Math.min(dateRange.endDate, new Date())) : new Date()
                }
                placeholderText="Start Date"
                isClearable
                dateFormat="MM/dd/yyyy"
                aria-label="Start Date"
                className={`${styles.dateInput} ${darkMode ? styles.darkDateInput : ''}`}
                calendarClassName={
                  darkMode ? 'paid-labor-cost-dark-calendar' : 'paid-labor-cost-calendar'
                }
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
                className={`${styles.dateInput} ${darkMode ? styles.darkDateInput : ''}`}
                calendarClassName={
                  darkMode ? 'paid-labor-cost-dark-calendar' : 'paid-labor-cost-calendar'
                }
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
