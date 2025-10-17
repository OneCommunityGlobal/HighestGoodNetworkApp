import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import { MultiSelect } from 'react-multi-select-component';
import 'react-datepicker/dist/react-datepicker.css';
import './ReturnedLateChart.css';
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
  const darkMode = useSelector(state => state.theme.darkMode);

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
        normalized.sort((a, b) => b.percentLate - a.percentLate);
        setChartData({
          labels: normalized.map(i => i.toolName),
          datasets: [
            {
              label: '% Returned Late',
              data: normalized.map(i => i.percentLate),
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
  }, [selectedProject, dateRange, selectedTools]);

  const options = useMemo(() => {
    const textColor = darkMode ? '#fff' : '#333';
    const datalabelCOlor = darkMode ? '#fff' : '#111';
    return {
      responsive: true,
      maintainAspectRatio: false,
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
  }, [chartData, darkMode]);

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
    <div className={`returned-late-chart ${isOxfordBlue} `}>
      <h1 className={darkMode ? `text-white` : ``}>Percent of Tools Returned Late</h1>
      <div className="returned-late-filters">
        <div className="returned-late-filter-group">
          <label
            htmlFor="project-select"
            className={`returned-late-filter-label ${darkMode ? 'text-white' : ''}`}
          >
            Project:
          </label>
          <select
            id="project-select"
            value={selectedProject}
            onChange={handleProjectChange}
            className="returned-late-project-select"
          >
            <option value="All">All Projects</option>
            {availableProjects.map(p => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>
        <div className="returned-late-filter-group">
          <label
            htmlFor="tools-select"
            className={`returned-late-filter-label ${darkMode ? 'text-white' : ''}`}
          >
            Tools:
          </label>
          <div id="tools-select" className="returned-late-tools-select">
            <MultiSelect
              options={availableTools}
              value={selectedTools}
              onChange={setSelectedTools}
              labelledBy="tools-select"
            />
          </div>
        </div>
        <div className="returned-late-filter-group">
          <label
            htmlFor="start-date-picker"
            className={`returned-late-filter-label ${darkMode ? 'text-white' : ''}`}
          >
            From:
          </label>
          <DatePicker
            id="start-date-picker"
            selected={dateRange.startDate}
            onChange={handleStartDateChange}
            className="returned-late-date-picker"
          />
        </div>
        <div className="returned-late-filter-group">
          <label
            htmlFor="end-date-picker"
            className={`returned-late-filter-label ${darkMode ? 'text-white' : ''}`}
          >
            To:
          </label>
          <DatePicker
            id="end-date-picker"
            selected={dateRange.endDate}
            onChange={handleEndDateChange}
            className="returned-late-date-picker"
          />
        </div>
      </div>
      <div className="returned-late-chart-container text-white">
        {loading && (
          <div className={`returned-late-loading ${darkMode ? 'text-white' : ''}`}>Loading...</div>
        )}
        {error && (
          <div className={`returned-late-error ${darkMode ? 'text-white' : ''}`}>{error}</div>
        )}
        {!loading && !error && chartData.labels.length === 0 && (
          <div className={`returned-late-no-data ${darkMode ? 'text-white' : ''}`}>
            No data for selected filters
          </div>
        )}
        {!loading && !error && chartData.labels.length > 0 && (
          <Bar ref={chartRef} data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
