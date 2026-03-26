import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
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
import { Spinner } from 'reactstrap';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './ActualVsPlannedCost.module.css';

function ActualVsPlannedCost() {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme.darkMode);

  const [selectedProject, setSelectedProject] = useState(
    () => localStorage.getItem('bm_avsp_project') || '',
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem('bm_avsp_category') || 'Overall',
  );

  const [breakdown, setBreakdown] = useState([]);
  const [totals, setTotals] = useState({ actual: 0, planned: 0 });

  const [loading, setLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const selectedProjectName = useMemo(
    () => projects.find(p => p._id === selectedProject)?.name ?? '',
    [projects, selectedProject],
  );

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('bm_avsp_project', selectedProject);
    }
    localStorage.setItem('bm_avsp_category', selectedCategory);
  }, [selectedProject, selectedCategory]);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]._id);
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    setIsFiltering(true);
    const timeout = setTimeout(() => {
      setIsFiltering(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [selectedProject, selectedCategory]);

  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      axios
        .get(ENDPOINTS.BM_PROJECT_EXPENSE_BY_ID(selectedProject))
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
        .catch(() => {
          setTotals({ actual: 0, planned: 0 });
          setBreakdown([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedProject]);

  const categories = ['Overall', ...new Set(breakdown.map(d => d.category))];
  const chartData =
    selectedCategory === 'Overall'
      ? [{ category: 'Overall', actualCost: totals.actual, plannedCost: totals.planned }]
      : breakdown.filter(d => d.category === selectedCategory);

  const filterSummary = `${selectedProjectName || 'Loading...'} - ${selectedCategory}`;

  let chartContent;
  if (loading || isFiltering) {
    chartContent = (
      <div
        style={{
          display: 'flex',
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--text-color)',
        }}
      >
        <Spinner color="primary" size="sm" />
        <span style={{ marginLeft: '10px' }}>Updating chart...</span>
      </div>
    );
  } else if (
    !chartData.length ||
    (chartData.length === 1 && chartData[0].actualCost === 0 && chartData[0].plannedCost === 0)
  ) {
    chartContent = (
      <div
        style={{
          display: 'flex',
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--text-color)',
          fontStyle: 'italic',
        }}
      >
        No data available for the selected filters.
      </div>
    );
  } else {
    chartContent = (
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 5, left: 5, bottom: 0 }} barGap={20}>
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
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: 'large', margin: '0 0 5px 0' }} className={styles.title}>
          Actual vs Planned Costs
        </h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 'bold' }}>
          Viewing: {filterSummary}
        </div>
      </div>

      <div className={styles.selectorsContainer}>
        <div className={styles.selectorGroup}>
          <label htmlFor="ActualVsPlannedCost-project-select">Project:</label>
          <select
            id="ActualVsPlannedCost-project-select"
            value={selectedProject}
            onChange={e => {
              setSelectedProject(e.target.value);
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

        <div className={styles.selectorGroup}>
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

      {chartContent}
    </div>
  );
}

export default ActualVsPlannedCost;
