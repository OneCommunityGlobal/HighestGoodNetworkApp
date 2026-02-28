import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import { MultiSelect } from 'react-multi-select-component';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ReturnedLateChart.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useSelector } from 'react-redux';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function ReturnedLateChart() {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableTools, setAvailableTools] = useState([]);
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedTools, setSelectedTools] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(2020, 0, 1),
    endDate: new Date(2025, 11, 31),
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [rawToolsData, setRawToolsData] = useState([]);
  const [selectedToolDetail, setSelectedToolDetail] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [sortOption, setSortOption] = useState('DESC');

  const sortToolsData = data => {
    const sorted = [...data];

    switch (sortOption) {
      case 'ASC':
        sorted.sort((a, b) => a.percentLate - b.percentLate);
        break;
      case 'ALPHA':
        sorted.sort((a, b) => a.toolName.localeCompare(b.toolName));
        break;
      case 'DESC':
      default:
        sorted.sort((a, b) => b.percentLate - a.percentLate);
        break;
    }

    return sorted;
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        try {
          const projectsRes = await axios.get(ENDPOINTS.BM_TOOLS_RETURNED_LATE_PROJECTS, {
            headers: {
              Authorization: localStorage.getItem('token'),
            },
          });
          if (projectsRes.data && projectsRes.data.success) {
            const projects = projectsRes.data.data || [];
            setAvailableProjects(projects);
          }
          const toolsRes = await axios.get(ENDPOINTS.BM_TOOLS_RETURNED_LATE, {
            headers: {
              Authorization: localStorage.getItem('token'),
            },
          });
          if (toolsRes.data && toolsRes.data.success && toolsRes.data.data) {
            const data = toolsRes.data.data || [];
            setRawToolsData(data);
            const tools = Array.from(new Set(data.map(d => d.toolName))).filter(Boolean);
            setAvailableTools(tools.map(t => ({ label: t, value: t })));
          }
        } catch (e) {
          setError('Failed to fetch initial data');
        }
      } catch (e) {
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, []);

  const buildUrl = () => {
    const params = [];
    if (selectedProject && selectedProject !== 'All') params.push(`projectId=${selectedProject}`);
    if (dateRange.startDate) params.push(`startDate=${dateRange.startDate.toISOString()}`);
    if (dateRange.endDate) params.push(`endDate=${dateRange.endDate.toISOString()}`);
    if (selectedTools && selectedTools.length > 0)
      params.push(`tools=${selectedTools.map(t => t.value).join(',')}`);

    return `${ENDPOINTS.BM_TOOLS_RETURNED_LATE}${params.length ? `?${params.join('&')}` : ''}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = buildUrl();
        const res = await axios.get(url, {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        });
        const data = (res.data && (res.data.data || res.data)) || [];
        const normalized = data.map(item => ({
          toolName: item.toolName || item.toolNameName || item.name || '',
          percentLate: Number(item.percentLate || item.percent || item.value || 0),
        }));

        const sortedData = sortToolsData(normalized);

        setChartData({
          labels: sortedData.map(item => item.toolName),
          datasets: [
            {
              label: '% Returned Late',
              data: sortedData.map(item => item.percentLate),
              backgroundColor: 'rgba(53,162,235,0.7)',
            },
          ],
        });
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch returned-late data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedProject, dateRange, selectedTools, sortOption]);

  const handleBarClick = useCallback(
    (event, elements) => {
      if (!elements || !elements.length) return;

      const index = elements[0].index;
      const toolName = chartData.labels[index];

      const toolDetail = rawToolsData.find(t => t.toolName === toolName);

      setSelectedToolDetail(toolDetail || null);
      setDetailOpen(true);
    },
    [chartData.labels, rawToolsData],
  );

  const options = useMemo(() => {
    const textColor = darkMode ? '#fff' : '#333';
    const datalabelCOlor = darkMode ? '#fff' : '#111';
    return {
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleBarClick,
      interaction: {
        mode: 'nearest',
        intersect: true,
      },
      plugins: {
        legend: { display: false },
        title: {
          display: false,
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          offset: 4,
          formatter: value => `${Number(value).toFixed(0)}%`,
          color: datalabelCOlor,
          font: { weight: 'bold' },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const v = context.parsed.y;
              return `${v}%`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Tool Name',
            font: { size: 16, weight: 'bold' },
            color: textColor,
          },
          ticks: {
            color: textColor,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Percent of tools returned late',
            font: { size: 16, weight: 'bold' },
            color: textColor,
          },
          ticks: {
            color: textColor,
            callback: v => `${v}%`,
          },
          max: Math.max(...(chartData.datasets[0]?.data || [0])) * 1.15,
        },
      },
    };
  }, [chartData, darkMode, handleBarClick]);

  const handleProjectChange = e => setSelectedProject(e.target.value);
  const handleStartDateChange = date =>
    setDateRange(prev => ({ startDate: date, endDate: prev.endDate < date ? date : prev.endDate }));
  const handleEndDateChange = date =>
    setDateRange(prev => ({
      startDate: prev.startDate > date ? date : prev.startDate,
      endDate: date,
    }));
  const isOxfordBlue = darkMode ? 'bg-oxford-blue' : '';

  return (
    <div className={`${styles['returned-late-chart']} ${isOxfordBlue}`}>
      <h1 className={darkMode ? 'text-white' : ''}>Percent of Tools Returned Late</h1>
      <div className={styles['returned-late-filters']}>
        <div className={styles['returned-late-filter-group']}>
          <label
            htmlFor="project-select"
            className={`${styles['returned-late-filter-label']} ${darkMode ? 'text-white' : ''}`}
          >
            Project:
          </label>
          <select
            id="project-select"
            value={selectedProject}
            onChange={handleProjectChange}
            className={styles['returned-late-project-select']}
          >
            <option value="All">All Projects</option>
            {availableProjects.map(p => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>

        <div className={styles['returned-late-filter-group']}>
          <label
            htmlFor="tools-select"
            className={`${styles['returned-late-filter-label']} ${darkMode ? 'text-white' : ''}`}
          >
            Tools:
          </label>

          <MultiSelect
            options={availableTools}
            value={selectedTools}
            onChange={setSelectedTools}
            labelledBy="tools-select"
            className={styles['returned-late-tools-select']}
          />
        </div>

        <div className={styles['returned-late-filter-group']}>
          <label
            htmlFor="returned-late-sort"
            className={`${styles['returned-late-filter-label']} ${darkMode ? 'text-white' : ''}`}
          >
            Sort By:
          </label>

          <select
            id="returned-late-sort"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className={styles['returned-late-project-select']}
          >
            <option value="DESC">Highest % Late</option>
            <option value="ASC">Lowest % Late</option>
            <option value="ALPHA">Alphabetical (A–Z)</option>
          </select>
        </div>

        <div className={styles['returned-late-filter-group']}>
          <label
            htmlFor="start-date-picker"
            className={`${styles['returned-late-filter-label']} ${darkMode ? 'text-white' : ''}`}
          >
            From:
          </label>
          <DatePicker
            id="start-date-picker"
            selected={dateRange.startDate}
            onChange={handleStartDateChange}
            className={styles['returned-late-date-picker']}
          />
        </div>
        <div className={styles['returned-late-filter-group']}>
          <label
            htmlFor="end-date-picker"
            className={`${styles['returned-late-filter-label']} ${darkMode ? 'text-white' : ''}`}
          >
            To:
          </label>
          <DatePicker
            id="end-date-picker"
            selected={dateRange.endDate}
            onChange={handleEndDateChange}
            className={styles['returned-late-date-picker']}
          />
        </div>
      </div>
      <div className={`${styles['returned-late-chart-container']} text-white`}>
        {loading && (
          <div className={`${styles['returned-late-loading']} ${darkMode ? 'text-white' : ''}`}>
            Loading...
          </div>
        )}
        {error && (
          <div className={`${styles['returned-late-error']} ${darkMode ? 'text-white' : ''}`}>
            {error}
          </div>
        )}
        {!loading && !error && chartData.labels.length === 0 && (
          <div className={`${styles['returned-late-no-data']} ${darkMode ? 'text-white' : ''}`}>
            No data for selected filters
          </div>
        )}
        {!loading && !error && chartData.labels.length > 0 && (
          <Bar ref={chartRef} data={chartData} options={options} />
        )}
      </div>
      {detailOpen && (
        <>
          {/* Backdrop */}
          <div
            className={styles['returned-late-detail-backdrop']}
            role="button"
            tabIndex={0}
            aria-label="Close tool detail panel"
            onClick={() => setDetailOpen(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setDetailOpen(false);
              }
            }}
          />

          {/* Slide-out Panel */}
          <div
            className={`${styles['returned-late-detail-panel']} ${
              darkMode ? styles['dark-panel'] : ''
            }`}
          >
            <button
              className={styles['returned-late-detail-close']}
              onClick={() => setDetailOpen(false)}
            >
              ✕
            </button>

            {detailLoading && <p>Loading details...</p>}

            {!detailLoading && selectedToolDetail && !selectedToolDetail.error && (
              <>
                <h3>{selectedToolDetail.toolName}</h3>
                <p>Total Checkouts: {selectedToolDetail.totalCheckouts ?? '—'}</p>
                <p>Late Returns: {selectedToolDetail.percentLate}%</p>
                <p>
                  Average Delay:{' '}
                  {selectedToolDetail.avgDelayDays != null
                    ? `${selectedToolDetail.avgDelayDays} days`
                    : '—'}
                </p>
              </>
            )}

            {!detailLoading && selectedToolDetail?.error && <p>{selectedToolDetail.error}</p>}
          </div>
        </>
      )}
    </div>
  );
}
