import { useRef, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import styles from './RentalChart.module.css';
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

// these colors can be randomly generated once more projects are shared here. Colors generated from ChatGPT
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

/* ---------- helper functions to keep processChartData simple ---------- */

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

const aggregateDataByGroup = (filteredData, monthsInRange, totalMonths, groupBy, chartType) => {
  const groupMap = new Map();

  for (const item of filteredData) {
    const groupKey = groupBy === 'project' ? item.projectId : item.toolName;
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

const buildDatasetsFromGroupMap = (groupMap, groupBy) =>
  Array.from(groupMap.values()).map((group, index) => {
    const colorIndex = index % PROJECT_COLORS.length;
    const label = groupBy === 'project' ? `Project ${group.key.substring(0, 8)}...` : group.key;

    return {
      label,
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

/* ---------------------------------------------------------------------- */

export default function RentalChart() {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('cost');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedTool, setSelectedTool] = useState('All');
  const [groupBy] = useState('project');
  const darkMode = useSelector(state => state.theme.darkMode);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),
  });

  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableTools, setAvailableTools] = useState([]);
  const [rawData, setRawData] = useState([]);

  const processChartData = data => {
    const filteredData = filterRentalData(data, selectedProject, selectedTool, dateRange);
    const { labels, monthsInRange, totalMonths } = buildMonthsRange(dateRange);
    const groupMap = aggregateDataByGroup(
      filteredData,
      monthsInRange,
      totalMonths,
      groupBy,
      chartType,
    );
    const datasets = buildDatasetsFromGroupMap(groupMap, groupBy);

    setChartData({ labels, datasets });
  };

  useEffect(() => {
    const fetchRentalData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.BM_RENTAL_CHART);
        if (response.data.success) {
          const { data } = response.data;
          setRawData(data);

          const projectIds = [...new Set(data.map(item => item.projectId))];
          setAvailableProjects(projectIds);

          const toolNames = [...new Set(data.map(item => item.toolName))];
          setAvailableTools(toolNames);

          processChartData(data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generateChartTitle() {
    let title = 'Rental Costs';

    if (groupBy === 'project') {
      title += ' by Project';
      if (selectedProject !== 'All') {
        title = `Rental Costs for Project ${selectedProject.substring(0, 8)}...`;
      }
    } else {
      title += ' by Tool Type';
      if (selectedTool !== 'All') {
        title = `Rental Costs for ${selectedTool}`;
      }
    }

    const formatDate = date => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    title += ` (${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)})`;

    return title;
  }

  useEffect(() => {
    if (rawData.length > 0) {
      processChartData(rawData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType, selectedProject, selectedTool, dateRange, groupBy, rawData]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      backgroundColor: darkMode ? '#1b2a41' : '#ffffff',
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: darkMode ? '#e0e0e0' : '#333333',
          },
        },
        title: {
          display: true,
          text: generateChartTitle(),
          font: {
            size: 14,
          },
          color: darkMode ? '#ffffff' : '#1b2a41',
          padding: {
            bottom: 20,
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label +=
                  chartType === 'percentage'
                    ? `${context.parsed.y.toFixed(1)}%`
                    : `$${context.parsed.y.toFixed(2)}`;
              }
              return label;
            },
          },
          backgroundColor: darkMode ? '#1b2a41' : 'rgba(255,255,255,0.8)',
          titleColor: darkMode ? '#ffffff' : '#1b2a41',
          bodyColor: darkMode ? '#ffffff' : '#333333',
          borderColor: darkMode ? 'rgba(255,255,255, 0.2)' : '#1b2a41',
          borderWidth: 1,
        },
        datalabels: {
          color: darkMode ? '#e0e0e0' : '#333333',
          // move each dataset to a slightly different side of the point
          anchor: ctx => {
            // horizontal side of the point
            if (ctx.datasetIndex === 0) return 'end'; // right
            if (ctx.datasetIndex === 1) return 'start'; // left
            return 'center'; // 3rd stays centered if any
          },

          align: ctx => {
            // vertical side of the anchor
            if (ctx.datasetIndex === 0) return 'bottom'; // slightly below
            if (ctx.datasetIndex === 1) return 'top'; // slightly above
            return 'top';
          },
          offset: 8, // distance in px away from the point (same for all is fine)
          font: {
            size: 12,
          },

          formatter: value => {
            if (value == null || Number.isNaN(value)) return '';

            // percentage mode → whole-number percent
            if (chartType === 'percentage') {
              return `${value.toFixed(0)}%`; // e.g., 348%
            }

            // cost mode → dollars (you can use 0 or 2 decimals as you like)
            return `$${value.toFixed(2)}`; // e.g., $175.00
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month/Year',
            color: darkMode ? '#e0e0e0' : '#333333',
          },
          ticks: {
            color: darkMode ? '#e0e0e0' : '#333333',
          },
          grid: {
            color: darkMode ? '#e0e0e0' : '#333333',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text:
              chartType === 'percentage'
                ? 'Percentage of Total Materials Cost (%)'
                : 'Total Rental Cost ($)',
            color: darkMode ? '#e0e0e0' : '#333333',
          },
          ticks: {
            callback(value) {
              return chartType === 'percentage' ? `${value}%` : `$${value}`;
            },
            color: darkMode ? '#e0e0e0' : '#333333',
          },
          grid: {
            color: darkMode ? 'rgba(255,255,255,0.1)' : '#1b2a41',
          },
        },
      },
    }),
    [darkMode, chartType, dateRange, selectedProject, selectedTool],
  );

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
        <div className={`${styles.loading} ${darkMode ? styles.textLight : ''}`}>
          Loading Chart Data....
        </div>
      );
    }

    if (error) {
      return <div className={`${styles.error} ${darkMode ? styles.textLight : ''}`}>{error}</div>;
    }

    if (chartData.datasets.length === 0) {
      return (
        <div className={`${styles.noData} ${darkMode ? styles.textLight : ''}`}>
          No data available for the selected filters
        </div>
      );
    }

    return <Line ref={chartRef} data={chartData} options={options} />;
  };

  return (
    <div className={`${styles.rentalContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h1 className={darkMode ? styles.textLight : ''}>Rental Cost Over Time</h1>

      <div className={styles.chartFilters}>
        <div className={`${styles.filterRow} ${styles.topFilters}`}>
          <div className={styles.filterGroup}>
            <label htmlFor="chart-type" className={darkMode ? styles.textLight : ''}>
              Display:{' '}
            </label>
            <select
              id="chart-type"
              value={chartType}
              onChange={handleTypeChange}
              className={`${styles.rentalChartSelect} ${darkMode ? styles.darkSelect : ''}`}
            >
              <option value="cost">Total Rental Cost</option>
              <option value="percentage">% of Materials Cost</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="project-filter" className={darkMode ? styles.textLight : ''}>
              Project:{' '}
            </label>
            <select
              id="project-filter"
              value={selectedProject}
              onChange={handleProjectChange}
              className={`${styles.rentalChartSelect} ${darkMode ? styles.darkSelect : ''}`}
            >
              <option value="All">All Projects</option>
              {availableProjects.map(projectId => (
                <option key={projectId} value={projectId}>
                  Project {projectId.substring(0, 8)}...
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="tool-filter" className={darkMode ? styles.textLight : ''}>
              Tool:{' '}
            </label>
            <select
              id="tool-filter"
              value={selectedTool}
              onChange={handleToolChange}
              disabled={groupBy === 'project' && selectedProject !== 'All'}
              className={`${styles.rentalChartSelect} ${darkMode ? styles.darkSelect : ''}`}
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

        <div className={`${styles.filterRow} ${styles.dateFilters}`}>
          <div className={styles.filterGroup}>
            <label style={{ marginRight: '8px' }} className={darkMode ? styles.textLight : ''}>
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
              className={`${styles.datePicker} ${darkMode ? styles.darkDatePicker : ''}`}
            />
          </div>

          <div className={styles.filterGroup}>
            <label style={{ marginRight: '10px' }} className={darkMode ? styles.textLight : ''}>
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
              className={`${styles.datePicker} ${darkMode ? styles.darkDatePicker : ''}`}
            />
          </div>
        </div>
      </div>

      <div className={`${styles.chartWrapper} ${darkMode ? styles.darkChart : styles.lightChart}`}>
        {renderChartContent()}
      </div>
    </div>
  );
}
