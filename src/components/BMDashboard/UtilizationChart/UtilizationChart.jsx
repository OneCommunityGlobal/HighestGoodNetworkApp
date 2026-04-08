/* eslint-disable */
/* prettier-ignore */
import { useState, useEffect, useMemo, useRef } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from './UtilizationChart.module.css';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../../utils/URL';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title, ChartDataLabels);

function UtilizationChart() {
  const [toolsData, setToolsData] = useState([]);
  const [previousToolsData, setPreviousToolsData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [toolFilter, setToolFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [error, setError] = useState(null);
  const [toolTypes, setToolTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
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

  // Mock data to test compare functionality
  const getMockPreviousData = data => {
    return data.map(tool => ({
      ...tool,
      utilizationRate: Math.max(0, tool.utilizationRate + Math.floor(Math.random() * 21) - 15),
      downtime: Math.round(tool.downtime * (0.85 + Math.random() * 0.3)),
    }));
  };

  // Compute previous period date range based on current selection
  const getPreviousPeriod = () => {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const duration = end - start;
    return {
      prevStart: new Date(start - duration),
      prevEnd: new Date(start),
    };
  };

  const fetchChartData = async (currentComparisonMode = comparisonMode) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_APIENDPOINT}/tools/utilization`, {
        params: {
          startDate,
          endDate,
          tool: toolFilter,
          project: projectFilter,
        },
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      setToolsData(response.data);

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
            headers: {
              Authorization: localStorage.getItem('token'),
            },
          },
        );
        // setPreviousToolsData(prevResponse.data);
        setPreviousToolsData(getMockPreviousData(response.data));
      } else {
        setPreviousToolsData([]);
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
  }, []);

  const handleApplyClick = () => {
    fetchChartData();
  };

  // Auto-fetch when comparison mode is toggled
  const handleComparisonToggle = () => {
    const newMode = !comparisonMode;
    setComparisonMode(newMode);
    fetchChartData(newMode);
  };

  // --- CSV Download ---
  const downloadCSV = () => {
    const headers = ['Tool Name', 'Utilization Rate (%)', 'Downtime (hrs)', 'Count'];
    const rows = toolsData.map(tool => [
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
      body: toolsData.map(tool => [
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

  // Summary banner computed values
  const summary = useMemo(() => {
    if (!toolsData.length) return null;

    const totalTools = toolsData.reduce((sum, t) => sum + (t.count || 0), 0);
    const avgUtilization =
      Math.round(
        (toolsData.reduce((sum, t) => sum + t.utilizationRate, 0) / toolsData.length) * 10,
      ) / 10;
    const mostUtilized = toolsData[0];
    const totalDowntime = toolsData.reduce((sum, t) => sum + t.downtime, 0);

    let avgUtilizationChange = null;
    if (comparisonMode && previousToolsData.length) {
      const prevAvg =
        previousToolsData.reduce((sum, t) => sum + t.utilizationRate, 0) / previousToolsData.length;
      avgUtilizationChange = Math.round((avgUtilization - prevAvg) * 10) / 10;
    }

    return { totalTools, avgUtilization, mostUtilized, totalDowntime, avgUtilizationChange };
  }, [toolsData, previousToolsData, comparisonMode]);

  const chartData = {
    labels: toolsData.map(tool => tool.name),
    datasets: [
      {
        label: 'Utilization (%)',
        data: toolsData.map(tool => tool.utilizationRate),
        backgroundColor: darkMode ? '#007bff' : '#a0e7e5',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        labels: { color: darkMode ? '#ffffff' : '#333' },
      },
      datalabels: {
        color: context => {
          if (!comparisonMode || !previousToolsData.length) {
            return darkMode ? '#ffffff' : '#333';
          }
          const tool = toolsData[context.dataIndex];
          const prev = previousToolsData.find(p => p.name === tool.name);
          if (!prev) return darkMode ? '#ffffff' : '#333';
          return tool.utilizationRate >= prev.utilizationRate ? '#4caf50' : '#f44336';
        },
        anchor: 'end',
        align: 'end',
        font: { size: 12 },
        formatter: (_, context) => {
          const tool = toolsData[context.dataIndex];
          const baseLabel = `${tool.downtime} hrs`;
          if (!comparisonMode || !previousToolsData.length) return baseLabel;
          const prev = previousToolsData.find(p => p.name === tool.name);
          if (!prev) return baseLabel;
          const delta = tool.utilizationRate - prev.utilizationRate;
          const arrow = delta >= 0 ? '↑' : '↓';
          return `${baseLabel}  ${arrow} ${Math.abs(delta)}%`;
        },
      },
      tooltip: {
        callbacks: {
          title: context => {
            const tool = toolsData[context[0].dataIndex];
            return tool.name;
          },
          label: context => {
            const tool = toolsData[context.dataIndex];
            const lines = [
              `Utilization: ${tool.utilizationRate}%`,
              `Downtime: ${tool.downtime} hrs`,
              `Count: ${tool.count ?? 'N/A'} tool(s)`,
            ];
            if (comparisonMode && previousToolsData.length) {
              const prev = previousToolsData.find(p => p.name === tool.name);
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
        footerColor: 'white',
      },
    },
    scales: {
      x: {
        max: 100,
        title: {
          display: true,
          text: 'Time (%)',
          color: darkMode ? '#ffffff' : '#333',
        },
        ticks: { color: darkMode ? '#ffffff' : '#333' },
        grid: { color: darkMode ? '#c7c7c7ff' : '#bebebeff' },
      },
      y: {
        ticks: {
          autoSkip: false,
          color: darkMode ? '#ffffff' : '#333',
        },
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

            {/* Download Dropdown */}
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

          <Bar data={chartData} options={options} />
        </>
      )}
    </div>
  );
}

export default UtilizationChart;
