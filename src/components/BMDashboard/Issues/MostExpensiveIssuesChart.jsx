import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './MostExpensiveIssuesChart.css';
import { fetchOpenIssues } from 'actions/bmdashboard/issueChartActions';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';

// Register chart components once
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MostExpensiveOpenIssuesChart() {
  // Read dark mode flag from Redux
  const darkMode = useSelector(state => state.theme.darkMode);

  // UI state: selected projects, date mode, custom dates, dropdown open
  const [selectedProjects, setSelectedProjects] = useState(['all']);
  const [dateMode, setDateMode] = useState('ALL');
  const [dates, setDates] = useState({ start: '', end: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch();

  // Pull raw data from Redux slices
  const { issues } = useSelector(state => state.bmIssues);
  const projects = useSelector(state => state.bmProjects);

  // Map project IDs to names for lookup
  const projectMap = Object.fromEntries(projects.map(p => [p._id, p.name]));

  // Fetch data once on mount
  useEffect(() => {
    dispatch(fetchOpenIssues());
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // Helper: days since issue created
  const getDaysSinceCreated = createdDateStr => {
    const created = new Date(createdDateStr);
    const now = new Date();
    const diffTime = now - created;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Preprocess raw issues for chart use
  const processedIssues = useMemo(
    () => issues.map(issue => ({
      id: issue._id,
      name: issue.issueTitle?.[0] || 'Untitled',
      date: new Date(issue.createdDate.split('T')[0]),
      project: projectMap[issue.projectId] || 'Unknown Project',
      openSince: getDaysSinceCreated(issue.createdDate.split('T')[0]),
      cost: issue.cost,
      person: issue.person,
    })),
    [issues, projectMap]
  );

  // List of unique project names
  const projectNames = useMemo(
    () => [...new Set(processedIssues.map(issue => issue.project))],
    [processedIssues]
  );

  // Close dropdown on outside click
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // "All" plus individual project options
  const allProjects = useMemo(
    () => ['all', ...projectNames],
    [projectNames]
  );

  // Handle project checkbox toggles
  const handleProjectCheckboxChange = useCallback(e => {
    const { value, checked } = e.target;
    if (value === 'all') {
      setSelectedProjects(['all']);
    } else {
      let updated = selectedProjects.filter(p => p !== 'all');
      if (checked) updated.push(value);
      else updated = updated.filter(p => p !== value);
      setSelectedProjects(updated.length ? updated : ['all']);
    }
  }, [selectedProjects]);

  // Switch between "All" and "Custom" date modes
  const handleDateModeChange = useCallback(e => {
    const mode = e.target.value;
    setDateMode(mode);
    if (mode === 'ALL') setDates({ start: '', end: '' });
  }, []);

  // Update start/end dates
  const handleStartDateChange = useCallback(e => {
    if (e.target.value) setDates(d => ({ ...d, start: e.target.value }));
  }, []);
  const handleEndDateChange = useCallback(e => {
    if (e.target.value) setDates(d => ({ ...d, end: e.target.value }));
  }, []);

  // Filter & sort issues based on project/date selections
  const filteredData = useMemo(
    () => processedIssues
      .filter(issue => {
        const inProj = selectedProjects.includes('all') || selectedProjects.includes(issue.project);
        let inDate = true;
        if (dateMode === 'CUSTOM' && dates.start && dates.end) {
          const iso = issue.date.toISOString().split('T')[0];
          inDate = iso >= dates.start && iso <= dates.end;
        }
        return inProj && inDate;
      })
      .sort((a, b) => b.cost - a.cost),
    [processedIssues, selectedProjects, dateMode, dates]
  );

  // Prepare data object for Chart.js
  const chartData = useMemo(() => ({
    labels: filteredData.map(d => d.name),
    datasets: [{
      label: 'Cost ($)',
      data: filteredData.map(d => d.cost),
      backgroundColor: '#007bff',
      borderRadius: 4,
      barThickness: 24,
      maxBarThickness: 28,
      barPercentage: 0.1,
      categoryPercentage: 0.1,
    }],
  }), [filteredData]);

  // Chart appearance options
  const chartOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => `$${ctx.parsed.x.toLocaleString()}` },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cost ($)',
          font: { size: 12 },
          color: darkMode ? '#fff' : '#666',
        },
        ticks: {
          callback: val => `$${val}`,
          color: darkMode ? '#fff' : '#666',
          font: { size: 11 },
        },
        grid: { display: false },
      },
      y: {
        offset: true,
        title: {
          display: true,
          text: 'Issue Name',
          font: { size: 12 },
          color: darkMode ? '#fff' : '#666',
        },
        ticks: {
          color: darkMode ? '#fff' : '#666',
          font: { size: 11 },
          maxRotation: 0,
          autoSkip: false,
        },
        grid: { display: false },
      },
    },
    layout: { padding: 0 },
  }), [darkMode]);

  return (
    <div className="chart-container">
      <h2 className="chart-title">Most Expensive Open Issues</h2>

      <div className="filters-container">
        {/* Project selector */}
        <div className="filter-group" ref={dropdownRef}>
          <label>Projects</label>
          <div
            className="project-dropdown-toggle"
            onClick={() => setIsDropdownOpen(prev => !prev)}
          >
            {selectedProjects.includes('all') ? 'All' : selectedProjects.join(', ')}
          </div>
          {isDropdownOpen && (
            <div className="project-dropdown-popup">
              {allProjects.map(opt => (
                <label key={opt}>
                  <input
                    type="checkbox"
                    value={opt}
                    checked={selectedProjects.includes(opt)}
                    onChange={handleProjectCheckboxChange}
                  />
                  {opt === 'all' ? 'All' : opt}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Date mode selector */}
        <div className="filter-group">
          <label>Date</label>
          <select className="filter-select" value={dateMode} onChange={handleDateModeChange}>
            <option value="ALL">All</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        {/* Custom date inputs */}
        {dateMode === 'CUSTOM' && (
          <>
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                className="filter-input"
                value={dates.start}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                className="filter-input"
                value={dates.end}
                onChange={handleEndDateChange}
              />
            </div>
          </>
        )}
      </div>

      {/* Render the bar chart */}
      <div className="chart-wrapper">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
