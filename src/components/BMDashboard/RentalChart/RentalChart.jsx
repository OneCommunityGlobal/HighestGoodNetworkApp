import { useRef, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from './RentalChart.module.css';
import datePickerStyles from './RentalDatePicker.module.css';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PROJECT_COLORS = [
  { borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)' },
  { borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)' },
  { borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)' },
  { borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.5)' },
  { borderColor: 'rgb(153, 102, 255)', backgroundColor: 'rgba(153, 102, 255, 0.5)' },
  { borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.5)' },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CHART_COLORS = {
  darkBg: 'transparent',
  lightBg: '#ffffff',
  darkText: '#e0e0e0',
  lightText: '#333333',
};

const FILTER_ALL = 'All';
const MIN_LABELED_CHART_WIDTH = 600;

const filterRentalData = (data, selectedProject, selectedTool, dateRange) =>
  data.filter(item => {
    if (selectedProject !== 'All' && item.projectId !== selectedProject) {
      return false;
    }
    if (selectedTool !== 'All' && item.toolName !== selectedTool) {
      return false;
    }
    const itemDate = new Date(item.date);
    return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
  });

const buildMonthsRange = dateRange => {
  const startYear = dateRange.startDate.getFullYear();
  const endYear = dateRange.endDate.getFullYear();
  const startMonth = dateRange.startDate.getMonth();
  const endMonth = dateRange.endDate.getMonth();

  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

  const labels = [];
  const monthsInRange = [];

  for (let i = 0; i < totalMonths; i += 1) {
    const year = startYear + Math.floor((startMonth + i) / 12);
    const month = (startMonth + i) % 12;
    labels.push(`${MONTHS[month]} ${year}`);
    monthsInRange.push({ year, month });
  }

  return { labels, monthsInRange, totalMonths };
};

// One decimal max, e.g. 16.342 -> "16.3%", 20 -> "20%"
const formatPercent = value => `${Number(Number(value).toFixed(1))}%`;

const getProjectName = (projMap, projectId) =>
  projMap instanceof Map && projMap.has(projectId)
    ? projMap.get(projectId)
    : `Project ${projectId.substring(0, 8)}...`;

const aggregateDataByProject = (filteredData, monthsInRange, totalMonths, chartType, projMap) => {
  const groupMap = new Map();

  for (const item of filteredData) {
    const groupKey = item.projectId;
    const date = new Date(item.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthIndex = monthsInRange.findIndex(m => m.year === year && m.month === month);
    if (monthIndex === -1) {
      continue;
    }

    const value =
      chartType === 'percentage'
        ? (item.rentalCost / item.totalMaterialCost) * 100
        : item.rentalCost;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        key: groupKey,
        name: getProjectName(projMap, groupKey),
        dataPoints: new Array(totalMonths).fill(undefined),
        monthsWithData: new Set(),
      });
    }

    const group = groupMap.get(groupKey);
    const currentValue = group.dataPoints[monthIndex];
    const newValue = currentValue === undefined ? value : currentValue + value;

    group.dataPoints[monthIndex] = newValue;
    group.monthsWithData.add(monthIndex);
  }

  return groupMap;
};

const buildDatasetsFromGroupMap = groupMap =>
  Array.from(groupMap.values()).map((group, index) => {
    const colorIndex = index % PROJECT_COLORS.length;

    return {
      label: group.name,
      data: group.dataPoints,
      borderColor: PROJECT_COLORS[colorIndex].borderColor,
      backgroundColor: PROJECT_COLORS[colorIndex].backgroundColor,
      marginRight: 20,
      tension: 0.4,
      fill: false,
      pointRadius: ctx => (group.monthsWithData.has(ctx.dataIndex) ? 5 : 0),
      pointHoverRadius: 8,
      spanGaps: true,
    };
  });

// Label above the point when it's the month's highest visible value, below otherwise,
// so labels for nearby points split apart instead of covering each other
const isHighestInMonth = ({ chart, dataIndex, datasetIndex, dataset }) => {
  const value = dataset.data[dataIndex];
  return !chart.data.datasets.some(
    (other, i) => i !== datasetIndex && chart.isDatasetVisible(i) && other.data[dataIndex] > value,
  );
};

const getDatalabelFormatter = (value, chartType) => {
  if (value == null || Number.isNaN(value)) return '';
  if (chartType === 'percentage') {
    return formatPercent(value);
  }
  return `$${value.toFixed(2)}`;
};

const formatDate = date => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

const buildChartTitle = (selectedProject, selectedTool, dateRange, availableProjects) => {
  const toolPart = selectedTool === FILTER_ALL ? '' : ` for ${selectedTool}`;
  const projectPart =
    selectedProject === FILTER_ALL
      ? ' by Project'
      : ` in ${getProjectName(availableProjects, selectedProject)}`;

  return `Rental Costs${toolPart}${projectPart} (${formatDate(dateRange.startDate)} - ${formatDate(
    dateRange.endDate,
  )})`;
};

export default function RentalChart() {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('cost');
  const [selectedProject, setSelectedProject] = useState(FILTER_ALL);
  const [selectedTool, setSelectedTool] = useState(FILTER_ALL);
  const darkMode = useSelector(state => state.theme.darkMode);
  const bmProjects = useSelector(state => state.bmProjects);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),
  });

  const [fallbackProjectNames, setFallbackProjectNames] = useState(new Map());
  const [rawData, setRawData] = useState([]);

  // Only list projects that have rental data; prefer names from the BM projects list
  const availableProjects = useMemo(() => {
    const bmProjectNames = new Map(
      (Array.isArray(bmProjects) ? bmProjects : []).map(p => [p._id, p.name]),
    );
    const projectMap = new Map();
    rawData.forEach(item => {
      if (item.projectId && !projectMap.has(item.projectId)) {
        projectMap.set(
          item.projectId,
          bmProjectNames.get(item.projectId) ||
            fallbackProjectNames.get(item.projectId) ||
            getProjectName(null, item.projectId),
        );
      }
    });
    return projectMap;
  }, [rawData, bmProjects, fallbackProjectNames]);

  // Tool options follow the selected project so every choice has data behind it
  const availableTools = useMemo(() => {
    const projectData =
      selectedProject === FILTER_ALL
        ? rawData
        : rawData.filter(item => item.projectId === selectedProject);
    return [...new Set(projectData.map(item => item.toolName))].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
  }, [rawData, selectedProject]);

  useEffect(() => {
    if (selectedTool !== FILTER_ALL && !availableTools.includes(selectedTool)) {
      setSelectedTool(FILTER_ALL);
    }
  }, [availableTools, selectedTool]);

  const chartData = useMemo(() => {
    const filteredData = filterRentalData(rawData, selectedProject, selectedTool, dateRange);
    const { labels, monthsInRange, totalMonths } = buildMonthsRange(dateRange);
    const groupMap = aggregateDataByProject(
      filteredData,
      monthsInRange,
      totalMonths,
      chartType,
      availableProjects,
    );
    return { labels, datasets: buildDatasetsFromGroupMap(groupMap) };
  }, [rawData, selectedProject, selectedTool, dateRange, chartType, availableProjects]);

  useEffect(() => {
    const fetchRentalData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: localStorage.getItem('token') };
        const [rentalResponse, projectsResponse] = await Promise.allSettled([
          axios.get(ENDPOINTS.BM_RENTAL_CHART),
          axios.get(ENDPOINTS.BM_TOOLS_RETURNED_LATE_PROJECTS, { headers }),
        ]);

        if (rentalResponse.status === 'fulfilled' && rentalResponse.value.data.success) {
          const { data } = rentalResponse.value.data;

          // Fallback names for projects missing from the BM projects list
          const projectMap = new Map();
          if (projectsResponse.status === 'fulfilled') {
            let pData = projectsResponse.value.data;
            if (pData && !Array.isArray(pData)) pData = pData.data || pData.results || [];

            if (Array.isArray(pData)) {
              pData.forEach(p => {
                const pId = p.projectId || p._id;
                const pName = p.projectName || p.name;
                if (pId && pName) {
                  projectMap.set(pId, pName);
                }
              });
            }
          }

          data.forEach(item => {
            if (item.projectId && item.projectName && !projectMap.has(item.projectId)) {
              projectMap.set(item.projectId, item.projectName);
            }
          });

          setFallbackProjectNames(projectMap);
          setRawData(data);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        if (err.response) {
          toast.error('Error fetching data');
        }
        setError('Error loading chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchRentalData();
  }, []);

  const options = useMemo(() => {
    const textColor = darkMode ? '#ffffff' : '#000000';
    const bgColor = darkMode ? '#1b2a41' : '#ffffff';
    const tooltipBorder = darkMode ? '#ffffff' : '#000000';
    const tooltipBg = darkMode ? '#343a40' : '#f8f9fa';
    const titleColor = darkMode ? '#ffffff' : '#000000';
    const gridXColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const gridYColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      backgroundColor: darkMode ? CHART_COLORS.darkBg : CHART_COLORS.lightBg,
      // Hovering anywhere in a month lists every project, so hidden labels stay readable
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: textColor, font: { size: 16 } },
        },
        title: {
          display: true,
          text: buildChartTitle(selectedProject, selectedTool, dateRange, availableProjects),
          font: {
            size: 14,
          },
          color: darkMode ? CHART_COLORS.darkText : CHART_COLORS.lightText,
          padding: {
            bottom: 20,
          },
        },
        tooltip: {
          filter: item => Number.isFinite(item.parsed.y),
          callbacks: {
            label({ dataset, parsed }) {
              let label = dataset.label ? `${dataset.label}: ` : '';
              if (parsed.y !== null) {
                label +=
                  chartType === 'percentage' ? formatPercent(parsed.y) : `$${parsed.y.toFixed(2)}`;
              }
              return label;
            },
          },
          backgroundColor: tooltipBg,
          titleColor,
          bodyColor: textColor,
          borderColor: tooltipBorder,
          borderWidth: 2,
          titleFont: { size: 18 },
          bodyFont: { size: 16 },
        },
        datalabels: {
          color: darkMode ? '#e0e0e0' : '#333333',
          backgroundColor: darkMode ? 'rgba(27, 42, 65, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderRadius: 4,
          padding: { top: 2, bottom: 2, left: 4, right: 4 },
          anchor: ctx => (isHighestInMonth(ctx) ? 'end' : 'start'),
          align: ctx => (isHighestInMonth(ctx) ? 'top' : 'bottom'),
          offset: 4,
          // Too narrow for per-point labels (the tooltip still shows values); otherwise hide
          // only labels that would collide, and keep the rest inside the plot
          display: ctx => (ctx.chart.width < MIN_LABELED_CHART_WIDTH ? false : 'auto'),
          clamp: true,
          font: {
            size: 12,
          },

          formatter: value => getDatalabelFormatter(value, chartType),
        },
      },
      scales: {
        x: {
          // Pad both ends so edge points and their labels clear the y-axis ticks
          offset: true,
          title: { display: true, text: 'Month/Year', color: textColor, font: { size: 18 } },
          ticks: { color: textColor },
          grid: { color: gridXColor },
        },
        y: {
          beginAtZero: true,
          // Headroom above the highest point so its label doesn't hit the legend
          grace: '10%',
          title: {
            display: true,
            text:
              chartType === 'percentage'
                ? 'Percentage of Total Materials Cost (%)'
                : 'Total Rental Cost ($)',
            color: textColor,
            font: { size: 18 },
          },
          ticks: {
            callback: value => (chartType === 'percentage' ? formatPercent(value) : `$${value}`),
            color: textColor,
          },
          grid: { color: gridYColor },
        },
      },
    };
  }, [darkMode, chartType, dateRange, selectedProject, selectedTool, availableProjects]);

  const handleTypeChange = e => {
    setChartType(e.target.value);
  };

  const handleProjectChange = e => {
    setSelectedProject(e.target.value);
  };

  const handleToolChange = e => {
    setSelectedTool(e.target.value);
  };

  const handleStartDateChange = date => {
    setDateRange(prev => {
      const newStart = date;
      const newEndTime = Math.max(newStart.getTime(), prev.endDate.getTime());
      return {
        startDate: newStart,
        endDate: new Date(newEndTime),
      };
    });
  };

  const handleEndDateChange = date => {
    setDateRange(prev => {
      const newEnd = date;
      const newStartTime = Math.min(prev.startDate.getTime(), newEnd.getTime());
      return {
        startDate: new Date(newStartTime),
        endDate: newEnd,
      };
    });
  };

  const renderChartContent = () => {
    if (loading) {
      return (
        <div className={`${styles.loading} ${darkMode ? styles['text-light'] : ''}`}>
          Loading Chart Data....
        </div>
      );
    }

    if (error) {
      return (
        <div className={`${styles.error} ${darkMode ? styles['text-light'] : ''}`}>{error}</div>
      );
    }

    if (chartData.datasets.length === 0) {
      return (
        <div className={`${styles['no-data']} ${darkMode ? styles['text-light'] : ''}`}>
          No data available for the selected filters
        </div>
      );
    }

    return <Line ref={chartRef} data={chartData} options={options} plugins={[ChartDataLabels]} />;
  };

  return (
    <div className={`${styles['rental-container']} ${darkMode ? styles['dark-mode'] : ''}`}>
      <h1 className={darkMode ? styles['text-light'] : ''}>Rental Cost Over Time</h1>

      <div className={styles['chart-filters']}>
        <div className={styles['filter-row']}>
          <div className={styles['filter-group']}>
            <label htmlFor="chart-type" className={darkMode ? styles['text-light'] : ''}>
              Display:{' '}
            </label>
            <select
              id="chart-type"
              value={chartType}
              onChange={handleTypeChange}
              className={`${styles['rental-chart-select']} ${
                darkMode ? styles['dark-select'] : ''
              }`}
            >
              <option value="cost">Total Rental Cost</option>
              <option value="percentage">% of Materials Cost</option>
            </select>
          </div>

          <div className={styles['filter-group']}>
            <label htmlFor="project-filter" className={darkMode ? styles['text-light'] : ''}>
              Project:{' '}
            </label>
            <select
              id="project-filter"
              value={selectedProject}
              onChange={handleProjectChange}
              className={`${styles['rental-chart-select']} ${
                darkMode ? styles['dark-select'] : ''
              }`}
            >
              <option value="All">All Projects</option>
              {Array.from(availableProjects.entries()).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles['filter-group']}>
            <label htmlFor="tool-filter" className={darkMode ? styles['text-light'] : ''}>
              Tool:{' '}
            </label>
            <select
              id="tool-filter"
              value={selectedTool}
              onChange={handleToolChange}
              className={`${styles['rental-chart-select']} ${
                darkMode ? styles['dark-select'] : ''
              }`}
            >
              <option value="All">All Tools</option>
              {availableTools.map(tool => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles['filter-row']}>
          <div className={styles['filter-group']}>
            <label className={`${darkMode ? styles['text-light'] : ''} ${styles['date-label']}`}>
              From:{' '}
            </label>
            <DatePicker
              selected={dateRange.startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              dateFormat="MM/dd/yyyy"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              calendarClassName={`${datePickerStyles.calendar} ${
                darkMode ? datePickerStyles.dark : ''
              }`}
              className={`${styles['date-picker']} ${darkMode ? styles['dark-date-picker'] : ''}`}
            />
          </div>

          <div className={styles['filter-group']}>
            <label className={`${darkMode ? styles['text-light'] : ''} ${styles['date-label']}`}>
              To:{' '}
            </label>
            <DatePicker
              selected={dateRange.endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              dateFormat="MM/dd/yyyy"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              calendarClassName={`${datePickerStyles.calendar} ${
                darkMode ? datePickerStyles.dark : ''
              }`}
              className={`${styles['date-picker']} ${darkMode ? styles['dark-date-picker'] : ''}`}
            />
          </div>
        </div>
      </div>

      <div className={`${styles['chart-wrapper']} ${darkMode ? styles['dark-chart'] : ''}`}>
        {renderChartContent()}
      </div>
    </div>
  );
}
