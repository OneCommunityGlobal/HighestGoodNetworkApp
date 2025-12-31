import { useRef, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import styles from './RentalChart.module.css';
import { toast } from 'react-toastify';
import ChartDataLabels from 'chartjs-plugin-datalabels';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

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

export default function RentalChart() {
  const containerRef = useRef(null);
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
  const [hiddenSeries, setHiddenSeries] = useState({});

  // Function to process data for the chart
  const processChartData = data => {
    // apply all data
    let filteredData = data;

    // filter by project
    if (selectedProject !== 'All') {
      filteredData = filteredData.filter(item => item.projectId === selectedProject);
    }

    // filter by tool
    if (selectedTool !== 'All') {
      filteredData = filteredData.filter(item => item.toolName === selectedTool);
    }

    // Filter by date range
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
    });

    // Determine date range for x-axis
    const startYear = dateRange.startDate.getFullYear();
    const endYear = dateRange.endDate.getFullYear();
    const startMonth = dateRange.startDate.getMonth();
    const endMonth = dateRange.endDate.getMonth();

    // total number of months in the range
    const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

    // label generating for each month
    const labels = [];
    const monthsInRange = [];

    for (let i = 0; i < totalMonths; i += 1) {
      const year = startYear + Math.floor((startMonth + i) / 12);
      const month = (startMonth + i) % 12;
      labels.push(`${MONTHS[month]} ${year}`);
      monthsInRange.push({ year, month });
    }

    // group by project ID OR group name
    const groupMap = new Map();

    filteredData.forEach(item => {
      // determine the group key
      const groupKey = groupBy === 'project' ? item.projectId : item.toolName;
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = date.getMonth();

      // find index if in range
      const monthIndex = monthsInRange.findIndex(m => m.year === year && m.month === month);
      if (monthIndex === -1) return;

      const value =
        chartType === 'percentage'
          ? ((item.rentalCost / item.totalMaterialCost) * 100).toFixed(1)
          : item.rentalCost;

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          key: groupKey,
          dataPoints: Array(totalMonths).fill(undefined),
          monthsWithData: new Set(),
        });
      }

      // If multiple entries exist for the same group and month, sum them up
      const currentValue = groupMap.get(groupKey).dataPoints[monthIndex];
      const newValue =
        currentValue === undefined ? parseFloat(value) : currentValue + parseFloat(value);

      // store value we have this month to track data
      groupMap.get(groupKey).dataPoints[monthIndex] = newValue;
      groupMap.get(groupKey).monthsWithData.add(monthIndex);
    });

    // convert map to datasets
    const datasets = Array.from(groupMap.values()).map((group, index) => {
      const colorIndex = index % PROJECT_COLORS.length;

      // Format the label based on what we're grouping by
      const label = groupBy === 'project' ? `Project ${group.key.substring(0, 8)}...` : group.key;

      return {
        label,
        data: group.dataPoints,
        borderColor: PROJECT_COLORS[colorIndex].borderColor,
        backgroundColor: PROJECT_COLORS[colorIndex].backgroundColor,
        tension: 0.4,
        fill: false,
        pointRadius: ctx => {
          const monthIndex = ctx.dataIndex;
          return group.monthsWithData.has(monthIndex) ? 5 : 0;
        },
        pointHoverRadius: 8,
        spanGaps: true,
      };
    });

    // create transformed data
    const transformedData = {
      labels,
      datasets,
    };

    setChartData(transformedData);
  };

  // only fetch and store data once
  useEffect(() => {
    const fetchRentalData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.BM_RENTAL_CHART);
        if (response.data.success) {
          const { data } = response.data;
          // Store the raw data
          setRawData(data);

          // unique project IDs for dropdown
          const projectIds = [...new Set(data.map(item => item.projectId))];
          setAvailableProjects(projectIds);

          // unique tool names for dropdown
          const toolNames = [...new Set(data.map(item => item.toolName))];
          setAvailableTools(toolNames);

          // process data for chart
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
  }, []);

  // get dynamic chart generated
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

    // Format dates for the title
    const formatDate = date => {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    title += ` (${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)})`;

    return title;
  }

  // process data if filter is changed
  useEffect(() => {
    if (rawData.length > 0) {
      processChartData(rawData);
    }
  }, [chartType, selectedProject, selectedTool, dateRange, groupBy, rawData]);

  useEffect(() => {
    setHiddenSeries({});
  }, [chartData.datasets]);

  const readThemeVars = node => {
    const styles =
      typeof window !== 'undefined'
        ? getComputedStyle(node ?? document.documentElement)
        : {
            getPropertyValue: () => '',
          };
    const getVar = (name, fallback) => {
      const value = styles.getPropertyValue(name);
      return value ? value.trim() : fallback;
    };

    return {
      background: getVar('--chart-bg', darkMode ? '#1b2a41' : '#ffffff'),
      legendColor: getVar('--chart-legend-color', darkMode ? '#e0e0e0' : '#1b2a41'),
      axisColor: getVar('--chart-axis-color', darkMode ? '#e0e0e0' : '#333333'),
      gridColor: getVar('--chart-grid-color', darkMode ? 'rgba(255,255,255,0.16)' : '#d9d9d9'),
      tooltipBg: getVar('--chart-tooltip-bg', darkMode ? '#1b2a41' : 'rgba(255,255,255,0.92)'),
      tooltipTitle: getVar('--chart-tooltip-title', darkMode ? '#ffffff' : '#1b2a41'),
      tooltipText: getVar('--chart-tooltip-text', darkMode ? '#e0e0e0' : '#333333'),
      legendBg: getVar(
        '--chart-legend-bg',
        darkMode ? 'rgba(27,42,65,0.7)' : 'rgba(255,255,255,0.75)',
      ),
      pointLabel: getVar('--chart-point-label', darkMode ? '#e0e0e0' : '#1b2a41'),
      pointLabelBg: getVar(
        '--chart-point-label-bg',
        darkMode ? 'rgba(15,23,42,0.75)' : 'rgba(255,255,255,0.8)',
      ),
    };
  };

  const [themeVars, setThemeVars] = useState(() => readThemeVars(document.documentElement));

  useEffect(() => {
    const node = containerRef.current || document.documentElement;
    // wait until class toggles have applied
    const id = requestAnimationFrame(() => setThemeVars(readThemeVars(node)));
    return () => cancelAnimationFrame(id);
  }, [darkMode]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      backgroundColor: themeVars.background,
      layout: {
        padding: {
          left: 16,
          right: 28,
          top: 32,
          bottom: 16,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: generateChartTitle(),
          font: {
            size: 18,
          },
          color: themeVars.legendColor,
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
                    ? `${context.parsed.y}%`
                    : `$${context.parsed.y.toFixed(2)}`;
              }
              return label;
            },
          },
          backgroundColor: themeVars.tooltipBg,
          titleColor: themeVars.tooltipTitle,
          bodyColor: themeVars.tooltipText,
          borderColor: themeVars.gridColor,
          borderWidth: 1,
        },
        datalabels: {
          color: themeVars.pointLabel,
          backgroundColor: themeVars.pointLabelBg,
          borderRadius: 4,
          padding: { top: 4, bottom: 4, left: 6, right: 6 },
          align: 'top',
          anchor: 'end',
          offset: 6,
          clip: false,
          clamp: true,
          display: ctx => ctx.dataset.data[ctx.dataIndex] !== undefined,
          formatter: value => {
            if (value === undefined || value === null || Number.isNaN(value)) return '';
            return chartType === 'percentage' ? `${value}%` : `$${Math.round(value)}`;
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month/Year',
            color: themeVars.axisColor,
          },
          ticks: {
            color: themeVars.axisColor,
          },
          grid: {
            color: themeVars.gridColor,
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
            color: themeVars.axisColor,
          },
          ticks: {
            callback(value) {
              return chartType === 'percentage' ? `${value}%` : `$${value}`;
            },
            color: themeVars.axisColor,
          },
          grid: {
            color: themeVars.gridColor,
          },
        },
      },
    };
  }, [chartType, generateChartTitle, themeVars]);

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
    setDateRange(prev => ({
      startDate: date,
      endDate: prev.endDate < date ? date : prev.endDate,
    }));
  };

  const handleEndDateChange = date => {
    setDateRange(prev => ({
      startDate: prev.startDate > date ? date : prev.startDate,
      endDate: date,
    }));
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

  const handleLegendToggle = index => {
    const chart = chartRef.current;
    if (!chart) return;
    const isVisible = chart.isDatasetVisible(index);
    chart.setDatasetVisibility(index, !isVisible);
    chart.update();
    setHiddenSeries(prev => ({
      ...prev,
      [index]: isVisible,
    }));
  };

  const legendItems = chartData.datasets.map((dataset, index) => {
    const isHiddenFromChart = chartRef.current?.isDatasetVisible
      ? !chartRef.current.isDatasetVisible(index)
      : hiddenSeries[index];
    return {
      label: dataset.label || `Series ${index + 1}`,
      color: dataset.borderColor,
      hidden: !!isHiddenFromChart,
      index,
    };
  });

  return (
    <div
      ref={containerRef}
      className={`${styles.rentalContainer} ${darkMode ? styles.darkMode : ''}`}
      style={{
        backgroundColor: themeVars.background,
        padding: '20px',
        borderRadius: '8px',
        minHeight: '100vh',
        marginTop: '-20px',
        overflow: 'auto',
      }}
    >
      <h1 className={darkMode ? styles.textLight : ''}>Rental Cost Over Time</h1>
      <div className={styles.chartControls} style={{ marginBottom: '20px' }}>
        <div
          className={`${styles.filterRow} ${styles.topFilters}`}
          style={{ display: 'flex', marginBottom: '10px', gap: '20px' }}
        >
          <div className={styles.filterGroup}>
            <label htmlFor="chart-type" className={darkMode ? styles.textLight : ''}>
              Display:{' '}
            </label>
            <select
              id="chart-type"
              value={chartType}
              onChange={handleTypeChange}
              className={
                darkMode
                  ? `${styles.rentalChartSelect} ${styles.darkSelect}`
                  : styles.rentalChartSelect
              }
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
              className={
                darkMode
                  ? `${styles.rentalChartSelect} ${styles.darkSelect}`
                  : styles.rentalChartSelect
              }
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
              className={
                darkMode
                  ? `${styles.rentalChartSelect} ${styles.darkSelect}`
                  : styles.rentalChartSelect
              }
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

        <div
          className={`${styles.filterRow} ${styles.dateFilters}`}
          style={{ display: 'flex', gap: '20px' }}
        >
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
              className={
                darkMode ? `${styles.datePicker} ${styles.darkDatePicker}` : styles.datePicker
              }
            />
          </div>

          <div className={styles.filterGroup} style={{ marginRight: '150px' }}>
            <label
              label
              style={{ marginRight: '10px' }}
              className={darkMode ? styles.textLight : ''}
            >
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
              className={
                darkMode ? `${styles.datePicker} ${styles.darkDatePicker}` : styles.datePicker
              }
            />
          </div>
        </div>
      </div>

      <div
        className={`${styles.chartWrapper} ${darkMode ? styles.darkChart : ''}`}
        style={{
          backgroundColor: themeVars.background,
          padding: '20px',
          borderRadius: '8px',
          border: darkMode ? '1px solid #333' : '1px solid #ddd',
          minHeight: '600px',
        }}
      >
        {legendItems.length > 0 && (
          <div
            className={styles.chartLegend}
            role="list"
            aria-label="Toggle data series visibility"
          >
            {legendItems.map(item => (
              <div
                key={`${item.label}-${item.index}`}
                role="listitem"
                className={styles.chartLegendItemWrapper}
              >
                <button
                  type="button"
                  className={styles.chartLegendItem}
                  onClick={() => handleLegendToggle(item.index)}
                  aria-label={`Toggle ${item.label}`}
                  aria-pressed={!item.hidden}
                >
                  <span
                    className={styles.chartLegendSwatch}
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className={styles.chartLegendText}>{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        )}
        {renderChartContent()}
      </div>
    </div>
  );
}
