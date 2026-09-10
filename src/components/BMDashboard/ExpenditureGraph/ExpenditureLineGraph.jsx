import React, { useRef, useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { useSelector } from 'react-redux';

const CATEGORIES = [
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'structural', label: 'Structural' },
  { key: 'mechanical', label: 'Mechanical' },
];
const CHART_COLORS = ['#6293CC', '#C55151', '#E8D06B', '#94B66F'];

function isInvalidDateRange(startDate, endDate) {
  return Boolean(startDate) && Boolean(endDate) && startDate > endDate;
}

function buildDatasets(actual, darkMode) {
  return CATEGORIES.map(({ key, label }, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];
    return {
      label,
      data: actual.map(entry => entry[key] || 0),
      borderColor: color,
      backgroundColor: darkMode ? `${color}33` : `${color}1A`,
      tension: 0.1,
      fill: false,
    };
  });
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
  const [actualData, setActualData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectNameMap, setProjectNameMap] = useState({});
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateError, setDateError] = useState(null);
  const [noDataError, setNoDataError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    applyDarkModeBodyStyle(darkMode);
    return resetBodyStyle;
  }, [darkMode]);

  // Populate the project filter dropdown once on load.
  useEffect(() => {
    const fetchProjectIds = async () => {
      try {
        const response = await axios.get(ENDPOINTS.EXPENDITURE_PROJECT_IDS);
        if (response?.data?.success) {
          setProjects(response.data.data);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching project ids:', err);
      }
    };

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

    fetchProjectIds();
    fetchProjectNames();
  }, []);

  // Fetch the (already aggregated) cost breakdown whenever the project or date filters change.
  // This also covers the initial "land on the page" load, since it runs on mount with the
  // default filters (selectedProject: 'all', no date range).
  useEffect(() => {
    setDateError(null);
    setNoDataError(null);

    if (isInvalidDateRange(startDate, endDate)) {
      setDateError('Start date cannot be greater than end date');
      return;
    }

    const fetchCostBreakdown = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          ENDPOINTS.PROJECT_COST_BREAKDOWN(selectedProject, startDate, endDate),
        );
        const actual = response?.data?.actual || [];
        setActualData(actual);
        if (actual.length === 0) {
          setNoDataError('No data available for the selected date range and project');
        }
      } catch (err) {
        setError(`Error fetching data: ${err.message}`);
        setActualData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCostBreakdown();
  }, [selectedProject, startDate, endDate]);

  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chartInstance) {
      chartInstance.destroy();
      setChartInstance(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode]);

  const createChart = chartData => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    const chartTitle = 'Cost Breakdown by Type of Expenditure';

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
    if (!chartRef.current) return;

    if (dateError || noDataError || actualData.length === 0) {
      clearChart();
      return;
    }

    createChart({
      labels: actualData.map(entry => entry.month),
      datasets: buildDatasets(actualData, darkMode),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualData, dateError, noDataError, darkMode]);

  const handleProjectChange = e => setSelectedProject(e.target.value);
  const handleStartDateChange = e => setStartDate(e.target.value);
  const handleEndDateChange = e => setEndDate(e.target.value);

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
          Cost Breakdown by Type of Expenditure
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
                disabled={loading && projects.length === 0}
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
        {noDataError && !dateError && <p style={errorStyle}>{noDataError}</p>}

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
