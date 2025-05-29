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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MostExpensiveOpenIssuesChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [selectedProjects, setSelectedProjects] = useState(['all']);
  const [dateMode, setDateMode] = useState('ALL');
  const [dates, setDates] = useState({ start: '', end: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch();

  const { issues } = useSelector(state => state.bmIssues);
  const projects = useSelector(state => state.bmProjects);
  const projectMap = Object.fromEntries(projects.map(p => [p._id, p.name]));

  useEffect(() => {
    dispatch(fetchOpenIssues());
    dispatch(fetchBMProjects());
  }, [dispatch]);

  const getDaysSinceCreated = createdDateStr => {
    const created = new Date(createdDateStr);
    const now = new Date();
    const diffTime = now - created; // difference in milliseconds
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // convert to days
    return diffDays;
  };

  const processedIssues = useMemo(
    () => issues.map(issue => ({
      id: issue._id,
      name: issue.issueTitle?.[0] || 'Untitled',
      tag: issue.tag || '',
      date: new Date(issue.createdDate.split('T')[0]),
      project: projectMap[issue.projectId] || 'Unknown Project',
      openSince: getDaysSinceCreated(issue.createdDate.split('T')[0]),
      cost: issue.cost,
      person: issue.person,
    })),
    [issues, projectMap]
  );

  const projectNames = useMemo(
    () => [...new Set(processedIssues.map(issue => issue.project))],
    [processedIssues]
  );

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

  const allProjects = useMemo(
    () => ['all', ...projectNames],
    [projectNames]
  );

  const handleProjectCheckboxChange = useCallback(e => {
    const { value, checked } = e.target;

    if (value === 'all') {
      setSelectedProjects(['all']);
    } else {
      let updated = [...selectedProjects.filter(p => p !== 'all')];
      if (checked) {
        updated.push(value);
      } else {
        updated = updated.filter(p => p !== value);
      }
      setSelectedProjects(updated.length > 0 ? updated : ['all']);
    }
  }, [selectedProjects]);

  const handleDateModeChange = useCallback(e => {
    const mode = e.target.value;
    setDateMode(mode);
    if (mode === 'ALL') setDates({ start: '', end: '' });
  }, []);

  const handleStartDateChange = useCallback(e => {
    const value = e?.target?.value;
    if (value) setDates(d => ({ ...d, start: value }));
  }, []);

  const handleEndDateChange = useCallback(e => {
    const value = e?.target?.value;
    if (value) setDates(d => ({ ...d, end: value }));
  }, []);

  const filteredData = useMemo(() => processedIssues
    .filter(issue => {
      const inProject = selectedProjects.includes('all') || selectedProjects.includes(issue.project);
      let inDate = true;
      if (dateMode === 'CUSTOM' && dates.start && dates.end) {
        const iso = issue.date.toISOString().split('T')[0];
        inDate = iso >= dates.start && iso <= dates.end;
      }
      return inProject && inDate;
    })
    .sort((a, b) => b.cost - a.cost),
    [processedIssues, selectedProjects, dateMode, dates]);

  const chartData = useMemo(() => ({
    labels: filteredData.map(d => d.name),
    datasets: [
      {
        label: 'Cost ($)',
        data: filteredData.map(d => d.cost),
        backgroundColor: '#007bff',
        borderRadius: 4,
        barThickness: 24,
        maxBarThickness: 28,
        barPercentage: 0.1,
        categoryPercentage: 0.1,
      },
    ],
  }), [filteredData]);

  const chartOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `$${ctx.parsed.x.toLocaleString()}`,
        },
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
        <div className="filter-group" ref={dropdownRef}>
          <label>Projects</label>
          <div
            className="project-dropdown-toggle"
            onClick={() => setIsDropdownOpen(prev => !prev)}
          >
            {selectedProjects.length === allProjects.length || selectedProjects.includes('all')
              ? 'All'
              : selectedProjects.join(', ')}
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

        <div className="filter-group">
          <label>Date</label>
          <select className="filter-select" value={dateMode} onChange={handleDateModeChange}>
            <option value="ALL">All</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

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

      <div className="chart-wrapper">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
