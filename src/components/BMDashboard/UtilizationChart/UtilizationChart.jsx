/* eslint-disable */
/* prettier-ignore */
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  LineElement,
  PointElement,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from './UtilizationChart.module.css';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../../utils/URL';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  LineElement,
  PointElement,
  Legend,
  ChartDataLabels,
);

// Linear regression to compute trend line points
const computeTrendLine = values => {
  const n = values.length;
  if (n < 2) return values;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  const slope =
    values.reduce((sum, y, x) => sum + (x - xMean) * (y - yMean), 0) /
    values.reduce((sum, _, x) => sum + (x - xMean) ** 2, 0);
  const intercept = yMean - slope * xMean;
  return values.map((_, x) => Math.round((slope * x + intercept) * 10) / 10);
};

function UtilizationChart() {
  const [toolsData, setToolsData] = useState([]);
  const [previousToolsData, setPreviousToolsData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [toolFilter, setToolFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [error, setError] = useState(null);
  const [toolTypes, setToolTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showIncreasedOnly, setShowIncreasedOnly] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target)) {
        setDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock previous data for comparison testing — uncomment to use
  // const getMockPreviousData = data => {
  //   return data.map(tool => ({
  //     ...tool,
  //     utilizationRate: Math.max(0, tool.utilizationRate + Math.floor(Math.random() * 21) - 15),
  //     downtime: Math.round(tool.downtime * (0.85 + Math.random() * 0.3)),
  //   }));
  // };

  // Compute previous period date range
  const getPreviousPeriod = () => {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const duration = end - start;
    return {
      prevStart: new Date(start - duration),
      prevEnd: new Date(start),
    };
  };

  // Fetch trend data using single API call with groupBy=week
  const fetchTrendData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_APIENDPOINT}/tools/utilization`, {
        params: {
          startDate,
          endDate,
          tool: toolFilter,
          project: projectFilter,
          groupBy: 'week',
        },
        headers: { Authorization: localStorage.getItem('token') },
      });
      setTrendData(response.data);

      // Mock trend data for testing — uncomment to use
      // const now = new Date();
      // const mockTrend = Array.from({ length: 4 }, (_, i) => {
      //   const weekStart = new Date(now);
      //   weekStart.setDate(now.getDate() - (3 - i) * 7);
      //   const label = `Week of ${weekStart.toLocaleDateString('en-US', {
      //     month: 'short',
      //     day: 'numeric',
      //   })}`;
      //   const avgUtilization = Math.max(0, Math.min(100, 20 + Math.floor(Math.random() * 40)));
      //   return { week: label, avgUtilization };
      // });
      // setTrendData(mockTrend);
    } catch (err) {
      // Silently fail for trend — main chart still works
      console.error('Failed to load trend data:', err);
    }
  };

  const fetchChartData = async (currentComparisonMode = comparisonMode) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_APIENDPOINT}/tools/utilization`, {
        params: { startDate, endDate, tool: toolFilter, project: projectFilter },
        headers: { Authorization: localStorage.getItem('token') },
      });
      const data = response.data;
      setToolsData(data);

      if (currentComparisonMode) {
        const { prevStart, prevEnd } = getPreviousPeriod();
        const prevResponse = await axios.get(
          `${process.env.REACT_APP_APIENDPOINT}/tools/utilization`,
          {
            params: {
              startDate: prevStart,
              endDate: prevEnd,
              tool: toolFilter,
              project: projectFilter,
            },
            headers: { Authorization: localStorage.getItem('token') },
          },
        );
        setPreviousToolsData(prevResponse.data);
        // Mock comparison data for testing — uncomment to use
        // setPreviousToolsData(getMockPreviousData(data));
      } else {
        setPreviousToolsData([]);
        setShowIncreasedOnly(false);
      }
    } catch (err) {
      setError('Failed to load utilization data.');
    }
  };

  const fetchFilterData = async () => {
    try {
      const [toolTypesResponse, projectsResponse] = await Promise.all([
        axios.get(ENDPOINTS.BM_TOOL_TYPES, {
          headers: { Authorization: localStorage.getItem('token') },
        }),
        axios.get(ENDPOINTS.BM_PROJECTS + 'Names', {
          headers: { Authorization: localStorage.getItem('token') },
        }),
      ]);
      setToolTypes(toolTypesResponse.data);
      setProjects(projectsResponse.data);
    } catch (err) {
      setError('Failed to load filter options. Please try refreshing the page.');
    }
  };

  useEffect(() => {
    fetchFilterData();
    fetchChartData();
    fetchTrendData();
  }, []);

  const handleApplyClick = () => {
    fetchChartData();
    fetchTrendData();
  };

  const handleComparisonToggle = () => {
    const newMode = !comparisonMode;
    setComparisonMode(newMode);
    if (!newMode) setShowIncreasedOnly(false);
  };

  // Filtered data for "increased only" toggle
  const filteredToolsData = useMemo(() => {
    if (!showIncreasedOnly || !comparisonMode || !previousToolsData.length) return toolsData;
    return toolsData.filter(tool => {
      const prev = previousToolsData.find(p => p.name === tool.name);
      return prev ? tool.utilizationRate > prev.utilizationRate : false;
    });
  }, [toolsData, previousToolsData, showIncreasedOnly, comparisonMode]);

  const filteredPreviousToolsData = useMemo(() => {
    if (!showIncreasedOnly || !comparisonMode || !previousToolsData.length)
      return previousToolsData;
    return previousToolsData.filter(prev =>
      filteredToolsData.some(tool => tool.name === prev.name),
    );
  }, [previousToolsData, filteredToolsData, showIncreasedOnly, comparisonMode]);

  // --- CSV Download ---
  const downloadCSV = () => {
    const headers = ['Tool Name', 'Utilization Rate (%)', 'Downtime (hrs)', 'Count'];
    const rows = filteredToolsData.map(tool => [
      tool.name,
      tool.utilizationRate,
      tool.downtime,
      tool.count ?? 'N/A',
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `utilization_report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadMenuOpen(false);
  };

  // --- PDF Download ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Tool Utilization Report', 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(120);
    const dateRange =
      startDate && endDate
        ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
        : 'Last 30 days (default)';
    doc.text(`Date Range: ${dateRange}`, 14, 24);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    autoTable(doc, {
      startY: 36,
      head: [['Tool Name', 'Utilization Rate (%)', 'Downtime (hrs)', 'Count']],
      body: filteredToolsData.map(tool => [
        tool.name,
        `${tool.utilizationRate}%`,
        tool.downtime.toLocaleString(),
        tool.count ?? 'N/A',
      ]),
      headStyles: { fillColor: [0, 123, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 10 },
    });
    doc.save(`utilization_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setDownloadMenuOpen(false);
  };

  // Summary banner
  const summary = useMemo(() => {
    if (!filteredToolsData.length) return null;
    const totalTools = filteredToolsData.reduce((sum, t) => sum + (t.count || 0), 0);
    const avgUtilization =
      Math.round(
        (filteredToolsData.reduce((sum, t) => sum + t.utilizationRate, 0) /
          filteredToolsData.length) *
          10,
      ) / 10;
    const mostUtilized = filteredToolsData[0];
    const totalDowntime = filteredToolsData.reduce((sum, t) => sum + t.downtime, 0);
    let avgUtilizationChange = null;
    if (comparisonMode && filteredPreviousToolsData.length) {
      const prevAvg =
        filteredPreviousToolsData.reduce((sum, t) => sum + t.utilizationRate, 0) /
        filteredPreviousToolsData.length;
      avgUtilizationChange = Math.round((avgUtilization - prevAvg) * 10) / 10;
    }
    return { totalTools, avgUtilization, mostUtilized, totalDowntime, avgUtilizationChange };
  }, [filteredToolsData, filteredPreviousToolsData, comparisonMode]);

  // Bar chart data
  const chartData = {
    labels: filteredToolsData.map(tool => tool.name),
    datasets: [
      {
        label: 'Utilization (%)',
        data: filteredToolsData.map(tool => tool.utilizationRate),
        backgroundColor: darkMode ? '#007bff' : '#a0e7e5',
        borderRadius: 6,
      },
    ],
  };

  // Trend line chart data
  const trendValues = trendData.map(d => d.avgUtilization);
  const trendLineValues = computeTrendLine(trendValues);

  const trendChartData = {
    labels: trendData.map(d => d.week),
    datasets: [
      {
        label: 'Avg Utilization (%)',
        data: trendValues,
        borderColor: darkMode ? '#a0e7e5' : '#007bff',
        backgroundColor: darkMode ? 'rgba(160,231,229,0.15)' : 'rgba(0,123,255,0.1)',
        pointBackgroundColor: darkMode ? '#a0e7e5' : '#007bff',
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Trend',
        data: trendLineValues,
        borderColor: darkMode ? '#e8a71c' : '#f44336',
        borderDash: [6, 4],
        pointRadius: 0,
        tension: 0,
        fill: false,
        borderWidth: 2,
      },
    ],
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { labels: { color: darkMode ? '#ffffff' : '#333' } },
      datalabels: {
        color: context => {
          if (!comparisonMode || !filteredPreviousToolsData.length) {
            return darkMode ? '#ffffff' : '#333';
          }
          const tool = filteredToolsData[context.dataIndex];
          const prev = filteredPreviousToolsData.find(p => p.name === tool.name);
          if (!prev) return darkMode ? '#ffffff' : '#333';
          return tool.utilizationRate >= prev.utilizationRate ? '#4caf50' : '#f44336';
        },
        anchor: 'end',
        align: 'end',
        font: { size: 12 },
        formatter: (_, context) => {
          const tool = filteredToolsData[context.dataIndex];
          const baseLabel = `${tool.downtime} hrs`;
          if (!comparisonMode || !filteredPreviousToolsData.length) return baseLabel;
          const prev = filteredPreviousToolsData.find(p => p.name === tool.name);
          if (!prev) return baseLabel;
          const delta = tool.utilizationRate - prev.utilizationRate;
          const arrow = delta >= 0 ? '↑' : '↓';
          return `${baseLabel}  ${arrow} ${Math.abs(delta)}%`;
        },
      },
      tooltip: {
        callbacks: {
          title: context => filteredToolsData[context[0].dataIndex]?.name,
          label: context => {
            const tool = filteredToolsData[context.dataIndex];
            const lines = [
              `Utilization: ${tool.utilizationRate}%`,
              `Downtime: ${tool.downtime} hrs`,
              `Count: ${tool.count ?? 'N/A'} tool(s)`,
            ];
            if (comparisonMode && filteredPreviousToolsData.length) {
              const prev = filteredPreviousToolsData.find(p => p.name === tool.name);
              if (prev) {
                const delta = tool.utilizationRate - prev.utilizationRate;
                const arrow = delta >= 0 ? '↑' : '↓';
                lines.push(
                  `vs Previous: ${arrow} ${Math.abs(delta)}% (was ${prev.utilizationRate}%)`,
                );
              }
            }
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        max: 100,
        title: { display: true, text: 'Time (%)', color: darkMode ? '#ffffff' : '#333' },
        ticks: { color: darkMode ? '#ffffff' : '#333' },
        grid: { color: darkMode ? '#c7c7c7ff' : '#bebebeff' },
      },
      y: {
        ticks: { autoSkip: false, color: darkMode ? '#ffffff' : '#333' },
        grid: { color: darkMode ? '#c7c7c7ff' : '#bebebeff' },
      },
    },
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: darkMode ? '#ffffff' : '#333' } },
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: darkMode ? '#ffffff' : '#333' },
        grid: { color: darkMode ? '#c7c7c7ff' : '#bebebeff' },
      },
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Avg Utilization (%)',
          color: darkMode ? '#ffffff' : '#333',
        },
        ticks: { color: darkMode ? '#ffffff' : '#333' },
        grid: { color: darkMode ? '#c7c7c7ff' : '#bebebeff' },
      },
    },
  };

  return (
    <div className={`${styles.utilizationChartContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h2 className={styles.chartTitle}>Utilization Chart</h2>

      {error ? (
        <div className={styles.utilizationChartError}>{error}</div>
      ) : (
        <>
          {/* Summary Banner */}
          {summary && (
            <div className={styles.summaryBanner}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Total Tools</span>
                <span className={styles.summaryValue}>{summary.totalTools}</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Avg Utilization</span>
                <span className={styles.summaryValue}>{summary.avgUtilization}%</span>
                {summary.avgUtilizationChange !== null && (
                  <span
                    className={
                      summary.avgUtilizationChange >= 0
                        ? styles.summaryChangeUp
                        : styles.summaryChangeDown
                    }
                  >
                    {summary.avgUtilizationChange >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(summary.avgUtilizationChange)}% vs prev
                  </span>
                )}
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Top Tool</span>
                <span className={`${styles.summaryValue} ${styles.summaryTopTool}`}>
                  {summary.mostUtilized?.name ?? 'N/A'}
                </span>
                <span className={styles.summarySubtext}>
                  {summary.mostUtilized?.utilizationRate ?? 0}% utilized
                </span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Total Downtime</span>
                <span className={styles.summaryValue}>
                  {summary.totalDowntime.toLocaleString()} hrs
                </span>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className={styles.filters}>
            <select
              value={toolFilter}
              onChange={e => setToolFilter(e.target.value)}
              className={styles.select}
            >
              <option value="ALL">All Tools</option>
              {toolTypes.map(toolType => (
                <option key={toolType._id} value={toolType._id}>
                  {toolType.name}
                </option>
              ))}
            </select>

            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className={styles.select}
            >
              <option value="ALL">All Projects</option>
              {projects.map(project => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))}
            </select>

            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="Start Date"
              maxDate={endDate || '' || new Date()}
              className={styles.datepickerWrapper}
            />

            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              placeholderText="End Date"
              minDate={startDate || ''}
              maxDate={new Date()}
              className={styles.datepickerWrapper}
            />

            <button onClick={handleApplyClick} className={styles.button}>
              Apply
            </button>

            <button
              onClick={handleComparisonToggle}
              className={`${styles.button} ${
                comparisonMode ? styles.activeButton : styles.inactiveButton
              }`}
            >
              Compare: {comparisonMode ? 'ON' : 'OFF'}
            </button>

            {comparisonMode && (
              <button
                onClick={() => setShowIncreasedOnly(prev => !prev)}
                className={`${styles.button} ${
                  showIncreasedOnly ? styles.activeButton : styles.inactiveButton
                }`}
              >
                Increased Only: {showIncreasedOnly ? 'ON' : 'OFF'}
              </button>
            )}

            <div className={styles.downloadWrapper} ref={downloadMenuRef}>
              <button className={styles.button} onClick={() => setDownloadMenuOpen(prev => !prev)}>
                Download ▾
              </button>
              {downloadMenuOpen && (
                <div className={styles.downloadMenu}>
                  <button className={styles.downloadMenuItem} onClick={downloadCSV}>
                    Download CSV
                  </button>
                  <button className={styles.downloadMenuItem} onClick={downloadPDF}>
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {comparisonMode && (
            <p className={styles.comparisonNote}>
              Showing comparison with previous {startDate && endDate ? 'selected' : '30-day'}{' '}
              period.
              <span className={styles.legendUp}> ↑ Improved</span>
              <span className={styles.legendDown}> ↓ Declined</span>
            </p>
          )}

          {/* Main Bar Chart */}
          <Bar data={chartData} options={barOptions} />

          {/* 4-Week Trend Line Chart */}
          {trendData.length > 0 && (
            <div className={styles.trendSection}>
              <h3 className={styles.trendTitle}>4-Week Utilization Trend</h3>
              <Line data={trendChartData} options={trendOptions} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UtilizationChart;
