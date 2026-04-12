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

// Register chart components but do NOT register ChartDataLabels globally here.
// ChartDataLabels will be passed per-chart via the `plugins` prop so other charts
// are not affected by the datalabels plugin by default.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PROJECT_COLORS = [
  { background: 'rgba(37, 99, 235, 0.82)', border: '#1d4ed8' },
  { background: 'rgba(5, 150, 105, 0.82)', border: '#047857' },
  { background: 'rgba(217, 119, 6, 0.82)', border: '#b45309' },
  { background: 'rgba(220, 38, 38, 0.82)', border: '#b91c1c' },
  { background: 'rgba(124, 58, 237, 0.82)', border: '#7c3aed' },
  { background: 'rgba(8, 145, 178, 0.82)', border: '#0e7490' },
  { background: 'rgba(190, 24, 93, 0.82)', border: '#be185d' },
  { background: 'rgba(101, 163, 13, 0.82)', border: '#4d7c0f' },
];

const DARK_PROJECT_COLORS = [
  { background: 'rgba(96, 165, 250, 0.88)', border: '#bfdbfe' },
  { background: 'rgba(52, 211, 153, 0.88)', border: '#a7f3d0' },
  { background: 'rgba(251, 191, 36, 0.88)', border: '#fde68a' },
  { background: 'rgba(248, 113, 113, 0.88)', border: '#fecaca' },
  { background: 'rgba(167, 139, 250, 0.88)', border: '#ddd6fe' },
  { background: 'rgba(34, 211, 238, 0.88)', border: '#a5f3fc' },
  { background: 'rgba(244, 114, 182, 0.88)', border: '#fbcfe8' },
  { background: 'rgba(163, 230, 53, 0.88)', border: '#d9f99d' },
];

function getProjectColor(index, darkMode) {
  const palette = darkMode ? DARK_PROJECT_COLORS : PROJECT_COLORS;
  return palette[index % palette.length];
}

function getArrayPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

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
  const [hiddenProjects, setHiddenProjects] = useState([]);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [sortOption, setSortOption] = useState('DESC');
  const isMultiProjectView = selectedProject === 'All';
  const visibleDatasets = useMemo(
    () =>
      chartData.datasets.map(dataset => ({
        ...dataset,
        hidden: Boolean(dataset.projectId) && hiddenProjects.includes(dataset.projectId),
      })),
    [chartData.datasets, hiddenProjects],
  );
  const maxChartValue = Math.max(
    0,
    ...visibleDatasets
      .filter(dataset => !dataset.hidden)
      .flatMap(dataset => dataset.data.filter(value => value != null)),
  );
  const legendItems = useMemo(
    () =>
      chartData.datasets.map(dataset => ({
        projectId: dataset.projectId || dataset.label,
        label: dataset.label,
        backgroundColor: dataset.backgroundColor,
        borderColor: dataset.borderColor,
        hidden: Boolean(dataset.projectId) && hiddenProjects.includes(dataset.projectId),
      })),
    [chartData.datasets, hiddenProjects],
  );

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
        const headers = {
          Authorization: localStorage.getItem('token'),
        };
        const [projectsResult, toolsResult] = await Promise.allSettled([
          axios.get(ENDPOINTS.BM_TOOLS_RETURNED_LATE_PROJECTS, { headers }),
          axios.get(ENDPOINTS.BM_TOOLS_RETURNED_LATE, { headers }),
        ]);

        let didLoadAnyData = false;

        if (projectsResult.status === 'fulfilled') {
          const projects = getArrayPayload(projectsResult.value.data);
          setAvailableProjects(projects);
          didLoadAnyData = didLoadAnyData || projects.length > 0;
        }

        if (toolsResult.status === 'fulfilled') {
          const data = getArrayPayload(toolsResult.value.data);
          const tools = Array.from(new Set(data.map(d => d.toolName))).filter(Boolean);
          setAvailableTools(tools.map(t => ({ label: t, value: t })));
          didLoadAnyData = didLoadAnyData || data.length > 0;
        }

        if (!didLoadAnyData) {
          const projectError =
            projectsResult.status === 'rejected'
              ? getRequestErrorMessage(projectsResult.reason, 'Failed to load projects')
              : null;
          const toolsError =
            toolsResult.status === 'rejected'
              ? getRequestErrorMessage(toolsResult.reason, 'Failed to load chart data')
              : null;

          setError(projectError || toolsError || 'Failed to fetch initial data');
        }
      } catch (e) {
        setError(getRequestErrorMessage(e, 'Error loading dashboard data'));
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
        const data = getArrayPayload(res.data);
        const normalized = data.map(item => ({
          toolName: item.toolName || item.toolNameName || item.name || '',
          percentLate: Number(item.percentLate || item.percent || item.value || 0),
          projectId: item.projectId || '',
          projectName: item.projectName || '',
          totalReturns: Number(item.totalReturns || 0),
          lateReturns: Number(item.lateReturns || 0),
        }));
        setRawToolsData(normalized);

        const sortedData = sortToolsData(normalized);
        const uniqueToolNames = [...new Set(sortedData.map(item => item.toolName))];
        const projectNameById = availableProjects.reduce((acc, project) => {
          acc[project.projectId] = project.projectName;
          return acc;
        }, {});

        if (selectedProject === 'All') {
          const projectNames = [
            ...new Map(
              sortedData
                .filter(item => item.projectId)
                .map(item => [
                  item.projectId,
                  item.projectName || projectNameById[item.projectId] || 'Unknown Project',
                ]),
            ).entries(),
          ];

          const datasets = projectNames.length
            ? projectNames.map(([projectId, projectName], index) => {
                const projectColor = getProjectColor(index, darkMode);
                const projectDataMap = sortedData
                  .filter(item => item.projectId === projectId)
                  .reduce((acc, item) => {
                    acc[item.toolName] = item.percentLate;
                    return acc;
                  }, {});

                return {
                  label: projectName,
                  projectId,
                  data: uniqueToolNames.map(toolName => projectDataMap[toolName] ?? null),
                  backgroundColor: projectColor.background,
                  borderColor: projectColor.border,
                  borderWidth: 1,
                };
              })
            : [
                {
                  label: '% Returned Late',
                  projectId: '',
                  data: uniqueToolNames.map(
                    toolName =>
                      sortedData.find(item => item.toolName === toolName)?.percentLate ?? 0,
                  ),
                  backgroundColor: getProjectColor(0, darkMode).background,
                  borderColor: getProjectColor(0, darkMode).border,
                  borderWidth: 1,
                },
              ];

          setChartData({
            labels: uniqueToolNames,
            datasets,
          });
        } else {
          setChartData({
            labels: uniqueToolNames,
            datasets: [
              {
                label:
                  availableProjects.find(project => project.projectId === selectedProject)
                    ?.projectName || '% Returned Late',
                projectId: selectedProject,
                data: uniqueToolNames.map(
                  toolName => sortedData.find(item => item.toolName === toolName)?.percentLate ?? 0,
                ),
                backgroundColor: getProjectColor(0, darkMode).background,
                borderColor: getProjectColor(0, darkMode).border,
                borderWidth: 1,
              },
            ],
          });
        }
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
  }, [availableProjects, darkMode, selectedProject, dateRange, selectedTools, sortOption]);

  useEffect(() => {
    if (!isMultiProjectView) {
      setHiddenProjects([]);
      return;
    }

    const validProjectIds = new Set(
      chartData.datasets.map(dataset => dataset.projectId).filter(Boolean),
    );
    setHiddenProjects(prev => prev.filter(projectId => validProjectIds.has(projectId)));
  }, [chartData.datasets, isMultiProjectView]);

  const handleBarClick = useCallback(
    (event, elements) => {
      if (!elements || !elements.length) return;

      const { index, datasetIndex } = elements[0];
      const toolName = chartData.labels[index];
      const dataset = chartData.datasets[datasetIndex];
      const projectId = dataset?.projectId || '';
      const toolDetail = rawToolsData.find(
        t => t.toolName === toolName && (!projectId || t.projectId === projectId),
      );

      setSelectedToolDetail(toolDetail || null);
      setDetailOpen(true);
    },
    [chartData.datasets, chartData.labels, rawToolsData],
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
        legend: {
          display: false,
        },
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
            title(tooltipItems) {
              return tooltipItems[0]?.label || '';
            },
            label(context) {
              const v = context.parsed.y;
              const label = context.dataset.label;
              return `${label}: ${v}%`;
            },
            afterLabel(context) {
              const toolDetail = rawToolsData.find(
                item =>
                  item.toolName === context.label &&
                  (!context.dataset.projectId || item.projectId === context.dataset.projectId),
              );

              if (!toolDetail) return '';

              return `Late ${toolDetail.lateReturns} / ${toolDetail.totalReturns} returns`;
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
          max: maxChartValue > 0 ? maxChartValue * 1.15 : 100,
        },
      },
    };
  }, [darkMode, handleBarClick, maxChartValue, rawToolsData]);

  const toggleProjectVisibility = projectId => {
    if (!projectId || !isMultiProjectView) return;

    setHiddenProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId],
    );
  };

  const multiProjectLegendVisible = isMultiProjectView && legendItems.length > 1;

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
      <div className={styles['returned-late-header-row']}>
        <h1 className={darkMode ? 'text-white' : ''}>Percent of Tools Returned Late</h1>
        {multiProjectLegendVisible && (
          <div className={styles['returned-late-legend-block']}>
            <p className={`${styles['returned-late-legend-hint']} ${darkMode ? 'text-white' : ''}`}>
              Click legend items to show or hide project bars.
            </p>
            <div
              className={styles['returned-late-legend']}
              role="group"
              aria-label="Project color legend"
            >
              {legendItems.map(item => (
                <button
                  key={item.projectId}
                  type="button"
                  className={`${styles['returned-late-legend-item']} ${
                    item.hidden ? styles['returned-late-legend-item-hidden'] : ''
                  }`}
                  onClick={() => toggleProjectVisibility(item.projectId)}
                  aria-pressed={!item.hidden}
                  title={`${item.hidden ? 'Show' : 'Hide'} ${item.label}`}
                >
                  <span
                    className={styles['returned-late-legend-swatch']}
                    style={{
                      backgroundColor: item.backgroundColor,
                      borderColor: item.borderColor,
                    }}
                    aria-hidden="true"
                  />
                  <span className={styles['returned-late-legend-label']}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
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
          <Bar
            ref={chartRef}
            data={{ ...chartData, datasets: visibleDatasets }}
            options={options}
            plugins={[ChartDataLabels]}
          />
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
                {selectedToolDetail.projectName && <p>Project: {selectedToolDetail.projectName}</p>}
                <p>Total Returns: {selectedToolDetail.totalReturns ?? '—'}</p>
                <p>Late Returns: {selectedToolDetail.percentLate}%</p>
                <p>
                  Return Summary: {selectedToolDetail.lateReturns ?? 0} /{' '}
                  {selectedToolDetail.totalReturns ?? 0}
                </p>
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
