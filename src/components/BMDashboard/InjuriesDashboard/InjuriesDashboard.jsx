import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import './InjuriesDashboard.css';

// Tooltip outside component for performance
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="injuries-custom-tooltip">
        <p className="label">{label}</p>
        <p className="value">Total Injuries: {payload[0].value}</p>
      </div>
    );
  }
  return null;
}

function InjuriesOverTimeChart() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [injuryTypes, setInjuryTypes] = useState([]);
  const [selectedInjuryTypes, setSelectedInjuryTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [severityLevels, setSeverityLevels] = useState([]);
  const [selectedSeverityLevels, setSelectedSeverityLevels] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      try {
        // Fetch projects
        const projectsRes = await axios.get(ENDPOINTS.BM_PROJECTS);
        setProjects(
          projectsRes.data.map(p => ({
            id: p._id,
            name: p.name || p.projectName || p._id,
          })),
        );
        // Fetch filter options
        const filterRes = await axios.get(ENDPOINTS.INJURIES_FILTER_OPTIONS);
        setInjuryTypes(filterRes.data.injuryTypes || []);
        setDepartments(filterRes.data.departments || []);
        setSeverityLevels(filterRes.data.severityLevels || []);
      } catch {
        setError('Failed to load filter options.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  // Fetch chart data when filters change
  useEffect(() => {
    if (!fromDate || !toDate) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          projectId: selectedProject || 'all',
          startDate: fromDate,
          endDate: toDate,
        });
        if (selectedInjuryTypes.length > 0) params.append('types', selectedInjuryTypes.join(','));
        if (selectedDepartments.length > 0)
          params.append('departments', selectedDepartments.join(','));
        if (selectedSeverityLevels.length > 0)
          params.append('severities', selectedSeverityLevels.join(','));
        const res = await axios.get(`${ENDPOINTS.INJURIES_OVER_TIME}?${params.toString()}`);
        if (res.data && Array.isArray(res.data)) {
          setChartData(
            res.data.map(item => ({
              ...item,
              displayDate: new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              totalInjuries: Number(item.totalInjuries || item.count || 0),
            })),
          );
        } else {
          setChartData([]);
        }
      } catch {
        setError('Failed to load injuries data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    selectedProject,
    fromDate,
    toDate,
    selectedInjuryTypes,
    selectedDepartments,
    selectedSeverityLevels,
  ]);

  // UI
  const renderChartContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    if (!fromDate || !toDate) {
      return <div>Please select a project and date range.</div>;
    }
    if (chartData.length === 0) {
      return <div>No injuries data available for the selected criteria.</div>;
    }
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={80} />
          <YAxis label={{ value: 'Total Injuries', angle: -90, position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalInjuries"
            stroke="#ff7300"
            strokeWidth={2}
            dot={{ fill: '#ff7300', r: 4 }}
            activeDot={{ r: 6 }}
            name="Total Injuries"
          >
            <LabelList
              dataKey="totalInjuries"
              position="top"
              style={{ fontSize: '12px', fill: 'var(--chart-label)' }}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="injuries-chart-container">
      <h2 className="chart-title">Total Injuries Over Time</h2>
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Project:</label>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>From:</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>To:</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              max={today}
            />
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-group multi-select">
            <label>Injury Types:</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={selectedInjuryTypes.length === 0}
                  onChange={() => setSelectedInjuryTypes([])}
                />
                All
              </label>
              {injuryTypes.map(type => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={selectedInjuryTypes.includes(type)}
                    onChange={() => {
                      if (selectedInjuryTypes.length === 0) {
                        setSelectedInjuryTypes([type]);
                      } else if (selectedInjuryTypes.includes(type)) {
                        setSelectedInjuryTypes(selectedInjuryTypes.filter(t => t !== type));
                      } else {
                        setSelectedInjuryTypes([...selectedInjuryTypes, type]);
                      }
                    }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-group multi-select">
            <label>Departments:</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={selectedDepartments.length === 0}
                  onChange={() => setSelectedDepartments([])}
                />
                All
              </label>
              {departments.map(dept => (
                <label key={dept}>
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept)}
                    onChange={() => {
                      if (selectedDepartments.length === 0) {
                        setSelectedDepartments([dept]);
                      } else if (selectedDepartments.includes(dept)) {
                        setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                      } else {
                        setSelectedDepartments([...selectedDepartments, dept]);
                      }
                    }}
                  />
                  {dept}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-group multi-select">
            <label>Severity Levels:</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={selectedSeverityLevels.length === 0}
                  onChange={() => setSelectedSeverityLevels([])}
                />
                All
              </label>
              {severityLevels.map(level => (
                <label key={level}>
                  <input
                    type="checkbox"
                    checked={selectedSeverityLevels.includes(level)}
                    onChange={() => {
                      if (selectedSeverityLevels.length === 0) {
                        setSelectedSeverityLevels([level]);
                      } else if (selectedSeverityLevels.includes(level)) {
                        setSelectedSeverityLevels(selectedSeverityLevels.filter(l => l !== level));
                      } else {
                        setSelectedSeverityLevels([...selectedSeverityLevels, level]);
                      }
                    }}
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="chart-container">{renderChartContent()}</div>
    </div>
  );
}
export default InjuriesOverTimeChart;
