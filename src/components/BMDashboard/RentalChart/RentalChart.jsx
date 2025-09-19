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
      backgroundColor: bgColor,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: textColor, font: { size: 16 } },
        },
        title: {
          display: true,
          text: generateChartTitle(),
          font: { size: 25 },
          color: titleColor,
        },
        tooltip: {
          callbacks: {
            label({ dataset, parsed }) {
              let label = dataset.label ? `${dataset.label}: ` : '';
              if (parsed.y !== null) {
                label += chartType === 'percentage' ? `${parsed.y}%` : `$${parsed.y.toFixed(2)}`;
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
      },
      scales: {
        x: {
          title: { display: true, text: 'Month/Year', color: textColor, font: { size: 18 } },
          ticks: { color: textColor },
          grid: { color: gridXColor },
        },
        y: {
          beginAtZero: true,
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
            callback: value => (chartType === 'percentage' ? `${value}%` : `$${value}`),
            color: textColor,
          },
          grid: { color: gridYColor },
        },
      },
    };
  }, [darkMode, chartType, generateChartTitle]);

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
      return <div>Loading Chart Data....</div>;
    }

    if (error) {
      return <div>{error}</div>;
    }

    if (chartData.datasets.length === 0) {
      return <div>No data available for the selected filters</div>;
    }

    return <Line ref={chartRef} data={chartData} options={options} />;
  };

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.rentalContainer}`}>
        <h1>Rental Cost Over Time</h1>
        <div className={`${styles.chartFilters}`}>
          <div className={`${styles.filterRow} ${styles.topFilters}`}>
            <div className={`${styles.filterGroup}`}>
              <label htmlFor="chart-type">Display: </label>
              <select id="chart-type" value={chartType} onChange={handleTypeChange}>
                <option value="cost">Total Rental Cost</option>
                <option value="percentage">% of Materials Cost</option>
              </select>
            </div>

            <div className={`${styles.filterGroup}`}>
              <label htmlFor="project-filter">Project: </label>
              <select id="project-filter" value={selectedProject} onChange={handleProjectChange}>
                <option value="All">All Projects</option>
                {availableProjects.map(projectId => (
                  <option key={projectId} value={projectId}>
                    Project {projectId.substring(0, 8)}...
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.filterGroup}`}>
              <label htmlFor="tool-filter">Tool: </label>
              <select
                id="tool-filter"
                value={selectedTool}
                onChange={handleToolChange}
                disabled={groupBy === 'project' && selectedProject !== 'All'}
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

          <div className={`${styles.filterRow} ${styles.dateFilter}`}>
            <div className={`${styles.filterGroup}`}>
              <label htmlFor="chart-type">From: </label>
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
                className={`${styles.DatePickerInput}`}
                popperClassName={`#{styles.DatePickerPopper}`}
                calendarClassName={`${styles.DatePickerCalendar}`}
              />
            </div>

            <div className={`${styles.filterGroup}`}>
              <label htmlFor="chart-type">To: </label>
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
                className={`${styles.DatePicker}`}
                popperClassName={`#{styles.DatePickerPopper}`}
                calendarClassName={`${styles.DatePickerCalendar}`}
              />
            </div>
          </div>
        </div>

        <div className={`${styles.chartWrapper}`}>{renderChartContent()}</div>
      </div>
    </div>
  );
}
