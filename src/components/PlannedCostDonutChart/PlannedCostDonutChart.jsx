import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, Spinner } from 'reactstrap';
import { fetchProjects, fetchPlannedCostBreakdown } from './plannedCostService';
import styles from './PlannedCostDonutChart.module.css';

const COLORS = {
  Plumbing: '#FF6384',
  Electrical: '#36A2EB',
  Structural: '#FFCE56',
  Mechanical: '#4BC0C0',
};

const RADIAN = Math.PI / 180;

const CustomTooltip = ({ active, payload, totalCost }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / totalCost) * 100).toFixed(1);

    return (
      <div className={styles['planned-cost-tooltip']}>
        <p className={styles['tooltip-category']}>{data.name}</p>
        <p className={styles['tooltip-cost']}>Planned Cost: ${data.value.toLocaleString()}</p>
        <p className={styles['tooltip-percentage']}>Percentage: {percentage}%</p>
      </div>
    );
  }
  return null;
};

const PlannedCostDonutChart = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [chartData, setChartData] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const darkMode = useSelector(state => state.theme?.darkMode);
  const dropdownRef = useRef(null);

  const filteredProjects = projects.filter(project => {
    const name = project.name || project.projectName || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch projects list
  useEffect(() => {
    const getProjects = async () => {
      try {
        const projectsData = await fetchProjects();
        setProjects(projectsData);
      } catch (err) {
        setError(err.message);
      }
    };

    getProjects();
  }, []);

  // Fetch planned cost breakdown when project changes
  useEffect(() => {
    if (!selectedProject) {
      setChartData([]);
      setTotalCost(0);
      return;
    }

    const getPlannedCostBreakdown = async () => {
      setLoading(true);
      setError(null);

      try {
        const breakdown = await fetchPlannedCostBreakdown(selectedProject);

        // Transform data for the chart - handle both array and object formats
        let transformedData = [];
        let total = 0;

        if (Array.isArray(breakdown)) {
          const categoryMap = {};
          breakdown.forEach(item => {
            if (item.category && typeof item.plannedCost === 'number') {
              categoryMap[item.category] = item.plannedCost;
            }
          });

          transformedData = [
            { name: 'Plumbing', value: categoryMap.Plumbing || 0 },
            { name: 'Electrical', value: categoryMap.Electrical || 0 },
            { name: 'Structural', value: categoryMap.Structural || 0 },
            { name: 'Mechanical', value: categoryMap.Mechanical || 0 },
          ];

          total = Object.values(categoryMap).reduce((sum, cost) => sum + cost, 0);
        } else {
          if (breakdown.total && breakdown.breakdown) {
            const breakdownData = breakdown.breakdown;

            const hasValidData = Object.values(breakdownData).some(
              value => typeof value === 'number' && value > 0,
            );

            if (hasValidData) {
              transformedData = [
                { name: 'Plumbing', value: breakdownData.Plumbing || breakdownData.plumbing || 0 },
                {
                  name: 'Electrical',
                  value: breakdownData.Electrical || breakdownData.electrical || 0,
                },
                {
                  name: 'Structural',
                  value: breakdownData.Structural || breakdownData.structural || 0,
                },
                {
                  name: 'Mechanical',
                  value: breakdownData.Mechanical || breakdownData.mechanical || 0,
                },
              ];

              total = breakdown.total;
            } else {
              transformedData = [];
              total = 0;
            }
          } else {
            transformedData = [
              { name: 'Plumbing', value: breakdown.plumbing || 0 },
              { name: 'Electrical', value: breakdown.electrical || 0 },
              { name: 'Structural', value: breakdown.structural || 0 },
              { name: 'Mechanical', value: breakdown.mechanical || 0 },
            ];

            total = Object.values(breakdown).reduce((sum, cost) => sum + (cost || 0), 0);
          }
        }

        setChartData(transformedData);
        setTotalCost(total);
      } catch (err) {
        setError(err.message);
        setChartData([]);
        setTotalCost(0);
      } finally {
        setLoading(false);
      }
    };

    getPlannedCostBreakdown();
  }, [selectedProject]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }) => {
    if (value === 0) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {percent > 0.05 ? `${parseFloat((percent * 100).toFixed(1))}%` : ''}
      </text>
    );
  };

  if (error && !selectedProject) {
    return (
      <div className={styles['planned-cost-container']}>
        <Alert color="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className={`${styles['planned-cost-container']} ${darkMode ? styles['dark-mode'] : ''}`}>
      <h2 className={styles['chart-title']}>Planned Cost Breakdown by Type of Expenditure</h2>

      {/* Project Filter */}
      <div className={styles['filter-section']}>
        <div className={styles['filter-col']}>
          <label htmlFor="project-search" className={styles['filter-label']}>
            Select Project
          </label>
          <div className={styles['searchable-dropdown']} ref={dropdownRef}>
            <input
              id="project-search"
              type="text"
              className={styles['dropdown-search-input']}
              placeholder="Choose a project..."
              value={dropdownOpen ? searchTerm : selectedProjectName}
              onChange={e => {
                setSearchTerm(e.target.value);
                if (!dropdownOpen) setDropdownOpen(true);
              }}
              onFocus={() => {
                setDropdownOpen(true);
                setSearchTerm('');
              }}
            />
            <span className={`${styles['dropdown-arrow']} ${dropdownOpen ? styles.open : ''}`}>
              &#9662;
            </span>
            {dropdownOpen && (
              <div className={styles['dropdown-options']}>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <div
                      key={project._id}
                      role="option"
                      tabIndex={0}
                      aria-selected={selectedProject === project._id}
                      className={`${styles['dropdown-option']} ${
                        selectedProject === project._id ? styles.selected : ''
                      }`}
                      onClick={() => {
                        setSelectedProject(project._id);
                        setSelectedProjectName(project.name || project.projectName);
                        setDropdownOpen(false);
                        setSearchTerm('');
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedProject(project._id);
                          setSelectedProjectName(project.name || project.projectName);
                          setDropdownOpen(false);
                          setSearchTerm('');
                        }
                      }}
                    >
                      {project.name || project.projectName}
                    </div>
                  ))
                ) : (
                  <div className={styles['dropdown-no-results']}>No projects found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className={styles['chart-area']}>
        {loading ? (
          <div className={styles['loading-container']}>
            <Spinner color="primary" />
            <p>Loading planned cost data...</p>
          </div>
        ) : selectedProject && chartData.length > 0 && totalCost > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={150}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>

                <Tooltip content={<CustomTooltip totalCost={totalCost} />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center display showing total */}
            <div className={styles['chart-center-info']}>
              <div className={styles['total-cost-display']}>
                <span className={styles['total-label']}>Total Planned Cost</span>
                <span className={styles['total-amount']}>${totalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Legend */}
            <div className={styles['legend-container']}>
              <div className={styles['legend-items']}>
                {chartData.map((entry, index) => (
                  <div key={entry.name} className={styles['legend-item']}>
                    <div
                      className={styles['legend-color']}
                      style={{ backgroundColor: COLORS[entry.name] }}
                    />
                    <span className={styles['legend-label']}>{entry.name}</span>
                    <span className={styles['legend-value']}>
                      ${entry.value.toLocaleString()} (
                      {((entry.value / totalCost) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : selectedProject ? (
          <div className={styles['no-data-container']}>
            <p>No planned cost data available for this project.</p>
          </div>
        ) : (
          <div className={styles['select-project-container']}>
            <p>Please select a project to view the planned cost breakdown.</p>
          </div>
        )}
      </div>

      {error && (
        <Alert color="danger" className={styles['mt-3']}>
          {error}
        </Alert>
      )}
    </div>
  );
};

export default PlannedCostDonutChart;
