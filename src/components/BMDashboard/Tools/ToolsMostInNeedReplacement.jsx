// ToolsMostInNeedReplacementChartJS.jsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import './ToolsMostInNeedReplacement.css';
import { ENDPOINTS } from '../../../utils/URL';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const DATE_MODES = ['ALL', 'CUSTOM'];

export default function ToolsMostInNeedReplacementChartJS() {
  const darkMode = useSelector((state) => state.theme.darkMode);

  // State variables
  const [projects, setProjects]         = useState([]);          // [{projectId, projectName}]
  const [selectedProject, setSelected]  = useState(null);        // react-select option
  const [data, setData]                 = useState([]);          // chart rows
  const [dateMode, setDateMode]         = useState('ALL');
  const [dates, setDates]               = useState({ startDate: '', endDate: '' });
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // Fetch projects on mount
  useEffect(() => {
    (async () => {
      try {
        const { data: list } = await axios.get(ENDPOINTS.PROJECTS_REQUIRED_TOOLS_REPLACEMENT);
        setProjects(list);
        if (list.length) {
          // pre-select first project for widget mode
          setSelected({ value: list[0].projectId, label: list[0].projectName });
        }
      } catch (err) {
        setError('Unable to load projects');
      }
    })();
  }, []);

  // Fetch chart data when selectedProject or date range changes
  useEffect(() => {
    if (!selectedProject) return;           // wait until a project is chosen

    (async () => {
      setLoading(true);
      setError('');
      try {
        const url = ENDPOINTS.TOOLS_REPLACEMENT_BY_PROJECT(
          selectedProject.value,
          dates.startDate || null,
          dates.endDate   || null,
        );
        const { data: rows } = await axios.get(url);

        if (rows && rows.length) {
          const sorted = [...rows].sort(
            (a, b) => a.requirementSatisfiedPercentage - b.requirementSatisfiedPercentage,
          );
          setData(sorted);
        } else {
          setData([]);
        }
      } catch (err) {
        setError('Unable to load tool data');
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedProject, dateMode, dates]);

  // Handlers
  const onProjectChange = useCallback((opt) => setSelected(opt), []);
  const onDateModeChange = useCallback((e) => {
    const mode = e.target.value;
    setDateMode(mode);
    if (mode === 'ALL') setDates({ startDate: '', endDate: '' });
  }, []);
  const onStartDateChange = useCallback((e) => {
    const val = e?.target?.value ?? '';
    setDates((d) => ({ ...d, startDate: val }));
  }, []);
  const onEndDateChange   = useCallback((e) => {
    const val = e?.target?.value ?? '';
    setDates((d) => ({ ...d, endDate: val }));
  }, []);

  // Memoized values
  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.projectId, label: p.projectName })),
    [projects],
  );

  // Chart data and options
  const chartData = useMemo(() => ({
    labels: data.map((d) => d.toolName),
    datasets: [{
      label: '% of requirement satisfied',
      data:  data.map((d) => d.requirementSatisfiedPercentage),
      backgroundColor: '#4caf50',
      borderRadius: 4,
      barPercentage: 0.6,
      categoryPercentage: 0.6,
    }],
  }), [data]);

  const options = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend:  { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x}%` } },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: '% of requirement satisfied', font: { size: 12 }, color: darkMode ? '#fff' : '#666' },
        ticks: { callback: (v) => `${v}%`, color: darkMode ? '#fff' : '#666', font: { size: 11 } },
        grid:  { display: false },
      },
      y: {
        title: { display: true, text: 'Tool Name', font: { size: 12 }, color: darkMode ? '#fff' : '#666' },
        ticks:  { color: darkMode ? '#fff' : '#666', font: { size: 11 } },
        grid:  { display: false },
      },
    },
    layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
  }), [darkMode]);

  return (
    <div className="chart-container">
      <h2 className="chart-title">Tools Most in Need of Replacement</h2>

      <div className="filters-container">
        <div className="filter-group">
          <label>Project:</label>
          <Select
            id="project-select"
            className="project-select"
            classNamePrefix="select"
            value={selectedProject}
            onChange={onProjectChange}
            options={projectOptions}
            placeholder="Select a project ID to view data"
            isClearable={false}
            isDisabled={!projects.length}
            styles={
              darkMode
                ? {
                    control:  (base) => ({ ...base, backgroundColor: '#2c3344', borderColor: '#364156' }),
                    menu:     (base) => ({ ...base, backgroundColor: '#2c3344' }),
                    option:   (base, st) => ({ ...base, backgroundColor: st.isFocused ? '#364156' : '#2c3344', color: '#e0e0e0' }),
                    singleValue: (b) => ({ ...b, color: '#e0e0e0' }),
                    placeholder: (b) => ({ ...b, color: '#aaaaaa' }),
                  }
                : {}
            }
          />
        </div>

        <div className="filter-group">
          <label>Date Mode:</label>
          <select className="filter-select" value={dateMode} onChange={onDateModeChange}>
            {DATE_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {dateMode === 'CUSTOM' && (
          <>
            <div className="filter-group">
              <label>Start Date:</label>
              <input type="date" className="filter-input" value={dates.startDate} onChange={onStartDateChange} />
              <button type="button" className="reset-date-btn" onClick={() => setDates((d) => ({ ...d, startDate: '' }))}>
                X
              </button>
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input type="date" className="filter-input" value={dates.endDate} onChange={onEndDateChange} />
              <button type="button" className="reset-date-btn" onClick={() => setDates((d) => ({ ...d, endDate: '' }))}>
                X
              </button>
            </div>
          </>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="chart-wrapper">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
