import React, { useRef, useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { useSelector } from 'react-redux';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const CHART_COLORS = ['#6293CC', '#C55151', '#E8D06B', '#94B66F'];

function getDateRangeFromData(data) {
  const dates = data.map(item => new Date(item.date));
  return { minDate: new Date(Math.min(...dates)), maxDate: new Date(Math.max(...dates)) };
}

function compareMonthYear(a, b) {
  const [monthA, yearA] = a.split(' ');
  const [monthB, yearB] = b.split(' ');
  if (yearA !== yearB) return Number.parseInt(yearA, 10) - Number.parseInt(yearB, 10);
  return MONTH_NAMES.indexOf(monthA) - MONTH_NAMES.indexOf(monthB);
}

function buildGroupedData(expenditureDataArr) {
  const groupedByMonth = {};
  const categories = new Set();
  expenditureDataArr.forEach(item => {
    const date = new Date(item.date);
    const month = date.toLocaleString('default', { month: 'short' });
    const monthYear = `${month} ${date.getFullYear()}`;
    if (!groupedByMonth[monthYear]) groupedByMonth[monthYear] = {};
    if (!groupedByMonth[monthYear][item.category]) groupedByMonth[monthYear][item.category] = 0;
    groupedByMonth[monthYear][item.category] += item.cost;
    categories.add(item.category);
  });
  return { groupedByMonth, categories };
}

function buildLabels(groupedByMonth) {
  const labels = Object.keys(groupedByMonth).sort(compareMonthYear);
  if (labels.length === 1) {
    const [month, year] = labels[0].split(' ');
    const monthIndex = MONTH_NAMES.indexOf(month);
    const nextMonthIndex = (monthIndex + 1) % 12;
    const nextYear =
      nextMonthIndex === 0 ? Number.parseInt(year, 10) + 1 : Number.parseInt(year, 10);
    labels.push(`${MONTH_NAMES[nextMonthIndex]} ${nextYear}`);
  }
  return labels;
}

function buildDatasets(categories, labels, groupedByMonth, darkMode) {
  return Array.from(categories).map((category, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];
    return {
      label: category,
      data: labels.map(month => groupedByMonth[month]?.[category] || 0),
      borderColor: color,
      backgroundColor: darkMode ? `${color}33` : `${color}1A`,
      tension: 0.1,
      fill: false,
    };
  });
}

function isInvalidDateRange(dateRange) {
  return dateRange.start && dateRange.end && dateRange.start > dateRange.end;
}

function filterByDateRange(data, dateRange) {
  if (!dateRange.start || !dateRange.end) return data;
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= dateRange.start && itemDate <= dateRange.end;
  });
}

function filterExpenditureData(data, selectedProject, dateRange) {
  const byProject =
    selectedProject === 'all' ? data : data.filter(item => item.projectId === selectedProject);
  return filterByDateRange(byProject, dateRange);
}

function applyDarkModeBodyStyle(darkMode) {
  if (darkMode) {
    document.body.style.backgroundColor = '#1b2a41';
    document.body.style.color = '#ffffff';
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  } else {
    document.body.style.backgroundColor = '#f9f9f9';
    document.body.style.color = 'inherit';
  }
}

function resetBodyStyle() {
  document.body.style.backgroundColor = '';
  document.body.style.color = '';
  document.body.style.transition = '';
}

const filterItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: '1 1 160px',
  maxWidth: '280px',
};

function buildThemeStyles(darkMode) {
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '6px 10px',
    borderRadius: '4px',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ddd',
    backgroundColor: darkMode ? '#253342' : '#fff',
    color: darkMode ? '#ffffff' : 'inherit',
    colorScheme: darkMode ? 'dark' : 'light',
  };

  const labelStyle = { color: darkMode ? '#ffffff' : 'inherit' };

  const errorStyle = {
    color: darkMode ? '#ff6b6b' : '#d32f2f',
    backgroundColor: darkMode ? '#2a3a5a' : 'rgba(211, 47, 47, 0.05)',
    padding: '10px',
    borderRadius: '4px',
    border: darkMode ? '1px solid #ff6b6b' : '1px solid #d32f2f',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 20px auto',
  };

  return { inputStyle, labelStyle, errorStyle };
}

export default function ExpenditureLineGraph() {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenditureData, setExpenditureData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectNameMap, setProjectNameMap] = useState({});
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateError, setDateError] = useState(null);
  const [noDataError, setNoDataError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    applyDarkModeBodyStyle(darkMode);
    return resetBodyStyle;
  }, [darkMode]);

  useEffect(() => {
    const fetchExpenditureData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.BM_EXPENDITURE);
        if (response?.data?.success) {
          const { data } = response.data;
          setExpenditureData(data);
          setProjects([...new Set(data.map(item => item.projectId))]);
          if (data.length > 0) {
            const { minDate } = getDateRangeFromData(data);
            setDateRange({ start: minDate, end: new Date() });
          }
        } else {
          setError('Failed to fetch the data');
        }
      } catch (err) {
        setError(`Error fetching data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenditureData();

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }
    };
  }, []);

  useEffect(() => {
    const fetchProjectNames = async () => {
      try {
        const response = await axios.get(ENDPOINTS.BM_PROJECT_NAMES);
        if (Array.isArray(response?.data)) {
          const nameMap = {};
          response.data.forEach(({ projectId, projectName }) => {
            if (projectId) nameMap[projectId] = projectName || projectId;
          });
          setProjectNameMap(nameMap);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching project names:', err);
      }
    };

    fetchProjectNames();
  }, []);

  useEffect(() => {
    if (chartInstance) {
      chartInstance.destroy();
      setChartInstance(null);
    }
  }, [darkMode]);

  const processDataForChart = expenditureDataArr => {
    const { groupedByMonth, categories } = buildGroupedData(expenditureDataArr);
    const labels = buildLabels(groupedByMonth);
    const datasets = buildDatasets(categories, labels, groupedByMonth, darkMode);
    return { labels, datasets };
  };

  const createChart = chartData => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    const chartTitle =
      selectedProject === 'all'
        ? 'Cost Breakdown by Type of Expenditure (all projects)'
        : `Cost Breakdown by Type of Expenditure (Project: ${projectNameMap[selectedProject] ||
            selectedProject})`;

    const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = darkMode ? '#ffffff' : '#666666';
    const chartBackgroundColor = darkMode ? '#1b2a41' : '#ffffff';

    if (chartInstance) {
      chartInstance.destroy();
    }

    const config = {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chartTitle,
            color: textColor,
            font: { size: 14, weight: 'bold' },
            padding: { top: 10, bottom: 15 },
          },
          legend: {
            labels: { color: textColor, font: { size: 12 } },
          },
          tooltip: {
            backgroundColor: darkMode ? '#3a506b' : 'rgba(0, 0, 0, 0.7)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
          },
          // Other charts in the app register chartjs-plugin-datalabels globally, which
          // otherwise leaks into this chart and prints an overlapping value at every point.
          datalabels: { display: false },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Cost($)',
              color: textColor,
              font: { size: 12, weight: 'bold' },
            },
            ticks: {
              color: textColor,
              font: { size: 11 },
              callback(value) {
                return value >= 1000 ? `$${value / 1000}k` : `$${value}`;
              },
            },
            grid: { color: gridColor, borderColor: gridColor },
          },
          x: {
            title: {
              display: true,
              text: 'Month',
              color: textColor,
              font: { size: 12, weight: 'bold' },
            },
            ticks: { color: textColor, font: { size: 11 } },
            grid: { color: gridColor, borderColor: gridColor },
          },
        },
        animation: {
          onComplete() {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = chartBackgroundColor;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
          },
        },
      },
    };

    const newChartInstance = new Chart(ctx, config);
    setChartInstance(newChartInstance);
  };

  const clearChart = () => {
    if (!chartInstance) return;
    chartInstance.destroy();
    setChartInstance(null);
  };

  useEffect(() => {
    if (expenditureData.length === 0 || !chartRef.current) return;

    setDateError(null);
    setNoDataError(null);

    if (isInvalidDateRange(dateRange)) {
      setDateError('Start date cannot be greater than end date');
      clearChart();
      return;
    }

    const filteredData = filterExpenditureData(expenditureData, selectedProject, dateRange);

    if (filteredData.length === 0) {
      setNoDataError('No data available for the selected date range and project');
      clearChart();
      return;
    }

    createChart(processDataForChart(filteredData));
  }, [selectedProject, dateRange, expenditureData, darkMode, projectNameMap]);

  const handleProjectChange = e => setSelectedProject(e.target.value);

  const handleStartDateChange = e => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (newStartDate) {
      setDateRange(prev => ({ ...prev, start: new Date(newStartDate) }));
    } else {
      const { minDate } = getDateRangeFromData(expenditureData);
      setDateRange(prev => ({ ...prev, start: minDate }));
    }
  };

  const handleEndDateChange = e => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    if (newEndDate) {
      setDateRange(prev => ({ ...prev, end: new Date(newEndDate) }));
    } else {
      setDateRange(prev => ({ ...prev, end: new Date() }));
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const { inputStyle, labelStyle, errorStyle } = buildThemeStyles(darkMode);

  return (
    <div
      className={`expenditure-chart-container ${darkMode ? 'dark-mode' : ''}`}
      style={{
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: darkMode ? '#1b2a41' : '#f9f9f9',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          style={{
            color: darkMode ? '#ffffff' : 'inherit',
            textAlign: 'center',
            margin: '0 0 10px 0',
            fontSize: 'clamp(1.4rem, 4vw + 0.5rem, 2.25rem)',
          }}
        >
          Cost Breakdown by Type of Expenditures
        </h1>
        <div className="filter-controls" style={{ marginBottom: '30px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'flex-end',
              width: '100%',
              padding: '0 20px',
              gap: '20px',
              boxSizing: 'border-box',
            }}
          >
            <div className="project-filter" style={filterItemStyle}>
              <label htmlFor="project-select" style={labelStyle}>
                Filter by project:
              </label>
              <select
                id="project-select"
                value={selectedProject}
                onChange={handleProjectChange}
                disabled={loading || projects.length === 0}
                style={inputStyle}
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project} value={project}>
                    {projectNameMap[project] || project}
                  </option>
                ))}
              </select>
            </div>
            <div style={filterItemStyle}>
              <label htmlFor="start-date" style={labelStyle}>
                From:
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                disabled={loading}
                max={todayStr}
                style={inputStyle}
              />
            </div>
            <div style={filterItemStyle}>
              <label htmlFor="end-date" style={labelStyle}>
                To:
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                disabled={loading}
                min={startDate}
                max={todayStr}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {loading && (
          <p style={{ color: darkMode ? '#ffffff' : 'inherit', textAlign: 'center' }}>
            Loading data...
          </p>
        )}
        {error && <p style={errorStyle}>Error: {error}</p>}
        {dateError && <p style={errorStyle}>{dateError}</p>}
        {noDataError && <p style={errorStyle}>{noDataError}</p>}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: darkMode ? '#16213e' : '#ffffff',
              borderRadius: '12px',
              border: darkMode ? '1px solid #233554' : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: darkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
              padding: '20px',
              boxSizing: 'border-box',
              maxWidth: '1100px',
              width: '100%',
              height: 'clamp(320px, 60vh, 550px)',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <canvas
              ref={chartRef}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                backgroundColor: darkMode ? '#16213e' : 'transparent',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
