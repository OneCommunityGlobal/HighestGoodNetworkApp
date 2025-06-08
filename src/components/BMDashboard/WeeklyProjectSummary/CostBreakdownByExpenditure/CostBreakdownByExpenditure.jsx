import './CostBreakdownByExpenditure.css';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { PieChart, Pie, Cell, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import {
  fetchPlannedCostBreakdown,
  fetchProjects,
} from '../../../../actions/bmdashboard/weeklyProjectSummaryActions';

const COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
const CATEGORY_ORDER = ['Plumbing', 'Electrical', 'Structural', 'Mechanical'];

const customStyles = darkMode => ({
  control: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#2b2b2b' : '#ffffff',
    color: darkMode ? '#eee' : '#333',
    borderColor: darkMode ? '#555' : '#ccc',
    boxShadow: 'none',
    '&:hover': {
      borderColor: darkMode ? '#777' : '#999',
    },
  }),
  singleValue: provided => ({
    ...provided,
    color: darkMode ? '#eee' : '#333',
  }),
  menu: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    color: darkMode ? '#eee' : '#333',
    zIndex: 10,
  }),
  input: provided => ({
    ...provided,
    color: darkMode ? '#eee' : '#333',
  }),
  placeholder: provided => ({
    ...provided,
    color: darkMode ? '#aaa' : '#888',
  }),
  option: (provided, state) => {
    let backgroundColor;
    if (state.isFocused) {
      backgroundColor = darkMode ? '#3a3a3a' : '#f0f0f0';
    } else {
      backgroundColor = darkMode ? '#1e1e1e' : '#ffffff';
    }

    return {
      ...provided,
      backgroundColor,
      color: darkMode ? '#eee' : '#333',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: darkMode ? '#3a3a3a' : '#e6e6e6',
      },
    };
  },
});

export default function CostBreakdownByExpenditure() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const projects = useSelector(state => state.bmProjects);
  const rawData = useSelector(state => state.plannedCost?.costBreakdown || []);

  const [selectedProject, setSelectedProject] = useState({ label: 'All', value: 'all' });

  useEffect(() => {
    dispatch(fetchProjects());
  }, []);

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchPlannedCostBreakdown(selectedProject.value));
    }
  }, [selectedProject]);

  const projectOptions = projects.map(project => ({
    label: project.name || 'Unnamed',
    value: project._id,
  }));

  const data = useMemo(() => {
    const filtered = rawData.filter(entry => entry.value > 0);
    const total = filtered.reduce((sum, item) => sum + item.value, 0);
    return filtered.map(item => ({
      ...item,
      percent: item.value / total,
    }));
  }, [rawData]);

  const renderLabel = ({ name, percent, cx, cy, midAngle, outerRadius }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 35;
    const x = cx + radius * (Math.cos(-midAngle * RADIAN) > 0 ? 1 : -1);
    const y = cy + outerRadius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';

    return (
      <text x={x} y={y} textAnchor={textAnchor} fontSize={10} fill={darkMode ? '#ccc' : '#555'}>
        <tspan x={x} dy="-0.5em">
          {name}
        </tspan>
        <tspan x={x} dy="1.5em">
          {(percent * 100).toFixed(1)}%
        </tspan>
      </text>
    );
  };

  const renderLine = ({ cx, cy, midAngle, outerRadius }) => {
    const RADIAN = Math.PI / 180;
    const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN);
    const ex = cx + (outerRadius + 35) * (Math.cos(-midAngle * RADIAN) > 0 ? 1 : -1);
    const ey = sy;
    return <path d={`M${sx},${sy} L${ex},${ey}`} stroke="#999" fill="none" />;
  };

  return (
    <div className={`cost-breakdown-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <div className="cost-breakdown-header">
        <h2 className="cost-breakdown-title">Planned Cost Breakdown</h2>
        <div className="cost-breakdown-dropdowns">
          <div className="dropdown-wrapper">
            <div className="dropdown-label">Projects</div>
            <Select
              options={projectOptions}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Project"
              styles={customStyles(darkMode)}
              classNamePrefix="react-select"
              className="planned-cost-dropdown"
            />
          </div>
        </div>
      </div>
      <div className="cost-breakdown-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              label={renderLabel}
              labelLine={renderLine}
            >
              {data.map(entry => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[CATEGORY_ORDER.indexOf(entry.name) % COLORS.length]}
                />
              ))}
              <LabelList
                dataKey="value"
                position="inside"
                fill={darkMode ? '#eee' : '#333'}
                fontSize={12}
              />
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1f1f1f' : '#fff',
                color: darkMode ? '#eee' : '#000',
              }}
              itemStyle={{ color: darkMode ? '#ccc' : '#333' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
