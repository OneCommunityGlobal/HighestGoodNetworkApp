import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
import { ENDPOINTS } from '../../../../utils/URL';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from 'recharts';
import './ActualVsPlannedCost.css';

const ActualVsPlannedCost = () => {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme.darkMode);

  const [selectedProject, setSelectedProject] = useState('');
  const [breakdown, setBreakdown] = useState([]);
  const [totals, setTotals] = useState({ actual: 0, planned: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Overall');

  // lookup the name of the selected project
  const selectedProjectName = useMemo(() => {
    return projects.find(p => p._id === selectedProject)?.name ?? '';
  }, [projects, selectedProject]);

  const fetchExpenses = projectId => {
    setLoading(true);
    axios
      .get(ENDPOINTS.BM_PROJECT_EXPENSE_BY_ID(projectId))
      .then(({ data }) => {
        setTotals({
          actual: Math.round(data.totalActualCost),
          planned: Math.round(data.totalPlannedCost),
        });
        setBreakdown(
          data.breakdown.map(item => ({
            category: item.category,
            actualCost: Math.round(item.actualCost),
            plannedCost: Math.round(item.plannedCost),
          })),
        );
      })
      .catch(err => {
        console.error(err);
        setTotals({ actual: 0, planned: 0 });
        setBreakdown([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projects.length) {
      const firstId = projects[0]._id;
      setSelectedProject(firstId);
      fetchExpenses(firstId);
    }
  }, [projects]);

  const categories = ['Overall', ...Array.from(new Set(breakdown.map(d => d.category)))];

  const chartData =
    selectedCategory === 'Overall'
      ? [{ category: 'Overall', actualCost: totals.actual, plannedCost: totals.planned }]
      : breakdown.filter(d => d.category === selectedCategory);

  return (
    <div style={{ padding: 10 }}>
      <h2 style={{ fontSize: 'large', marginBottom: '3px' }} className="ActualVsPlannedCost-title">
        Actual vs Planned Costs
      </h2>

      <div className={`ActualVsPlannedCost-selectors-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="ActualVsPlannedCost-selector-group">
          <label htmlFor="ActualVsPlannedCost-project-select">Project:</label>
          <select
            id="ActualVsPlannedCost-project-select"
            value={selectedProject}
            onChange={e => {
              const id = e.target.value;
              setSelectedProject(id);
              fetchExpenses(id);
              setSelectedCategory('Overall');
            }}
          >
            {projects.map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ActualVsPlannedCost-selector-group">
          <label htmlFor="ActualVsPlannedCost-category-select">Category:</label>
          <select
            id="ActualVsPlannedCost-category-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading data…</p>
      ) : chartData.length ? (
        <>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
                barGap={20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-color)' }}
                />
                <YAxis tick={{ fill: 'var(--text-color)', fontSize: '12px' }} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--button-hover)',
                  }}
                  labelStyle={{ color: 'var(--text-color)', fontSize: '12px' }}
                />

                <Legend
                  verticalAlign="top"
                  height={36}
                  iconSize={8}
                  wrapperStyle={{ color: 'var(--text-color)' }}
                />
                <Bar
                  dataKey="actualCost"
                  name="Actual"
                  fill={darkMode ? '#c0392b' : '#e74a3b'}
                  barSize={40}
                >
                  <LabelList dataKey="actualCost" position="top" fill="var(--text-color)" />
                </Bar>

                <Bar
                  dataKey="plannedCost"
                  name="Planned"
                  fill={!darkMode ? '#17a272' : '#1cc88a'}
                  barSize={40}
                >
                  <LabelList dataKey="plannedCost" position="top" fill="var(--text-color)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="ActualVsPlannedCost-chart-caption">{selectedProjectName}</div>
        </>
      ) : (
        <p>No data available for this category.</p>
      )}
    </div>
  );
};

export default ActualVsPlannedCost;
