// ToolsMostInNeedReplacementChartJS.jsx
import { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
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
import './ToolsMostInNeedReplacement.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const DATE_MODES = ['ALL', 'CUSTOM'];

// Mock data including project and date fields
const SAMPLE_DATA = [
  { project: 'Project A', date: '2025-05-01', toolName: 'Tool A', requirementSatisfiedPercentage: 30 },
  { project: 'Project A', date: '2025-05-02', toolName: 'Tool B', requirementSatisfiedPercentage: 45 },
  { project: 'Project B', date: '2025-05-01', toolName: 'Tool C', requirementSatisfiedPercentage: 60 },
  { project: 'Project C', date: '2025-05-03', toolName: 'Tool D', requirementSatisfiedPercentage: 80 },
];

export default function ToolsMostInNeedReplacementChartJS() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [project, setProject] = useState('all');
  const [dateMode, setDateMode] = useState('ALL');
  const [dates, setDates] = useState({ start: '', end: '' });

  // Build project dropdown options
  const projectOptions = useMemo(() => {
    const uniq = Array.from(new Set(SAMPLE_DATA.map(d => d.project)));
    return ['all', ...uniq];
  }, []);

  // Handlers
  const onProjectChange = useCallback(e => setProject(e.target.value), []);
  const onDateModeChange = useCallback(e => {
    const mode = e.target.value;
    setDateMode(mode);
    if (mode === 'ALL') {
      setDates({ start: '', end: '' });
    }
  }, []);
  const onStartDateChange = useCallback(e => {
    const { value } = e.target;
    setDates(d => ({ ...d, start: value }));
  }, []);
  const onEndDateChange = useCallback(e => {
    const { value } = e.target;
    setDates(d => ({ ...d, end: value }));
  }, []);

  // Filter & sort the data
  const filtered = useMemo(() => {
    return SAMPLE_DATA.filter(item => {
      const okProj = project === 'all' || item.project === project;
      let okDate = true;
      if (dateMode === 'CUSTOM' && dates.start && dates.end) {
        okDate = item.date >= dates.start && item.date <= dates.end;
      }
      return okProj && okDate;
    });
  }, [project, dateMode, dates]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => a.requirementSatisfiedPercentage - b.requirementSatisfiedPercentage);
  }, [filtered]);

  // Prepare Chart.js data
  const chartData = useMemo(() => ({
    labels: sorted.map(d => d.toolName),
    datasets: [
      {
        label: '% of requirement satisfied',
        data: sorted.map(d => d.requirementSatisfiedPercentage),
        backgroundColor: '#4caf50',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
      },
    ],
  }), [sorted]);

  // Chart.js options
  const options = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.parsed.x}%` } },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '% of requirement satisfied',
          font: { size: 12 },
          color: darkMode ? '#fff' : '#666',
        },
        ticks: {
          callback: val => `${val}%`,
          color: darkMode ? '#fff' : '#666',
          font: { size: 11 },
        },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: 'Tool Name',
          font: { size: 12 },
          color: darkMode ? '#fff' : '#666',
        },
        ticks: {
          color: darkMode ? '#fff' : '#666',
          font: { size: 11 },
        },
        grid: { display: false },
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
          <select className="filter-select" value={project} onChange={onProjectChange}>
            {projectOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt === 'all' ? 'All Projects' : opt}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date Mode:</label>
          <select className="filter-select" value={dateMode} onChange={onDateModeChange}>
            {DATE_MODES.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        {dateMode === 'CUSTOM' && (
          <>
            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="date"
                className="filter-input"
                value={dates.start}
                onChange={onStartDateChange}
              />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                className="filter-input"
                value={dates.end}
                onChange={onEndDateChange}
              />
            </div>
          </>
        )}
      </div>

      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
