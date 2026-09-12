import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LabelList } from 'recharts';
import httpService from '../../services/httpService';
import { ApiEndpoint } from '../../utils/URL';
import styles from './ActualCostBreakdown.module.css';

const ActualCostBreakdown = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const chartAreaRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
    centerX: 0,
    centerY: 0,
  });
  const segmentPositionsRef = useRef([]);
  const [, forceUpdate] = useState(0);

  // Color scheme for the four categories (matching the design)
  const COLORS = {
    Plumbing: '#4A90E2', // Blue
    Electrical: '#50C878', // Green
    Structural: '#F5A623', // Orange
    Mechanical: '#E24A4A', // Red
  };

  const CATEGORIES = ['Plumbing', 'Electrical', 'Structural', 'Mechanical'];

  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await httpService.get(`${ApiEndpoint}/projects`);
        setProjects(response.data || []);
      } catch (err) {
        // Error fetching projects - silently fail
      }
    };
    fetchProjects();
  }, []);

  // Track container dimensions for accurate label positioning
  useEffect(() => {
    let timeout1, timeout2;

    const updateDimensions = () => {
      if (chartAreaRef.current) {
        const chartAreaRect = chartAreaRef.current.getBoundingClientRect();
        // Try to find the actual ResponsiveContainer SVG element
        const svgElement = chartAreaRef.current.querySelector('svg');
        if (svgElement) {
          const svgRect = svgElement.getBoundingClientRect();
          const offsetX = svgRect.left - chartAreaRect.left;
          const offsetY = svgRect.top - chartAreaRect.top;
          // Calculate center relative to SVG
          const centerX = svgRect.width / 2;
          const centerY = svgRect.height / 2;
          if (svgRect.width > 0 && svgRect.height > 0) {
            setContainerDimensions({
              width: svgRect.width,
              height: svgRect.height,
              offsetX,
              offsetY,
              centerX,
              centerY,
            });
            return;
          }
        }

        // Fallback to chart-area dimensions
        if (chartAreaRect.width > 0 && chartAreaRect.height > 0) {
          setContainerDimensions({
            width: chartAreaRect.width,
            height: chartAreaRect.height,
            offsetX: 0,
            offsetY: 0,
            centerX: chartAreaRect.width / 2,
            centerY: chartAreaRect.height / 2,
          });
        }
      }
    };

    if (chartData) {
      // Use multiple timeouts to ensure ResponsiveContainer has fully rendered
      timeout1 = setTimeout(updateDimensions, 50);
      timeout2 = setTimeout(updateDimensions, 200);

      const resizeHandler = () => {
        updateDimensions();
      };
      window.addEventListener('resize', resizeHandler);

      return () => {
        if (timeout1) clearTimeout(timeout1);
        if (timeout2) clearTimeout(timeout2);
        window.removeEventListener('resize', resizeHandler);
      };
    }
  }, [chartData]);

  // Fetch cost breakdown data
  const fetchCostBreakdown = async () => {
    if (!selectedProject) return;

    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await httpService.get(
        `${ApiEndpoint}/projects/${selectedProject}/actual-cost-breakdown`,
        { params },
      );

      const data = response.data;

      // Check if there's any data - if total is 0 or all values are 0, show no data message
      const currentTotal = data.currentTotal || 0;
      const hasData = currentTotal > 0;

      if (!hasData) {
        setChartData(null);
        segmentPositionsRef.current = [];
        return;
      }

      // Transform data for chart with individual category changes
      // Filter out categories with 0 value - don't show them in the chart
      const chartData = CATEGORIES.map(category => {
        const categoryKey = category.toLowerCase();
        const currentValue = data.current[categoryKey] || 0;
        const previousValue = data.previousMonth?.[categoryKey] || 0;
        const categoryChange =
          previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

        return {
          name: category,
          value: currentValue,
          color: COLORS[category],
          percentage: currentTotal > 0 ? ((currentValue / currentTotal) * 100).toFixed(1) : '0.0',
          categoryChange: categoryChange.toFixed(1),
        };
      }).filter(item => item.value > 0); // Only include categories with data

      setChartData({
        chartData,
        totalCost: currentTotal,
        percentageChange: data.percentageChange,
        previousMonthTotal: data.previousMonthTotal,
      });
      // Clear segment positions when data changes
      segmentPositionsRef.current = [];
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching cost breakdown data');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when project or dates change
  useEffect(() => {
    if (selectedProject) {
      fetchCostBreakdown();
    }
  }, [selectedProject, fromDate, toDate]);

  // Handle project selection
  const handleProjectChange = projectId => {
    setSelectedProject(projectId);
    setIsProjectDropdownOpen(false);
  };

  // Handle dropdown toggle
  const toggleProjectDropdown = () => {
    setIsProjectDropdownOpen(!isProjectDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      const dropdown = document.getElementById('project-dropdown-wrapper');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
    };

    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

  // Get selected project name
  const getSelectedProjectName = () => {
    if (!selectedProject) return 'Select a project';
    const project = projects.find(p => p._id === selectedProject);
    return project ? project.projectName : 'Select a project';
  };

  // Handle date changes
  const handleFromDateChange = e => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = e => {
    setToDate(e.target.value);
  };

  // Custom label renderer for Recharts - shows value on segment
  // Also stores segment position data for external labels
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    payload,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Store segment position data for external labels
    // Use payload data directly as it contains the actual segment data
    if (payload) {
      segmentPositionsRef.current[index] = {
        name: payload.name,
        value: payload.value,
        color: payload.color,
        percentage: payload.percentage,
        categoryChange: payload.categoryChange,
        midAngle,
        cx,
        cy,
        index,
      };
      // Force re-render to update labels after a short delay
      setTimeout(() => forceUpdate(prev => prev + 1), 10);
    }

    // Format large numbers
    const formattedValue = value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        fontWeight="bold"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
      >
        {value.toLocaleString()}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      // Recharts passes the full data object in payload
      // The payload contains: name, value, payload (which has our custom fields)
      const segmentData = data.payload || {};
      const categoryName = segmentData.name || data.name || '';
      const categoryValue = data.value || 0;
      const categoryPercentage = segmentData.percentage || '0.0';

      return (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          <p style={{ fontWeight: 600, margin: '0 0 6px 0', fontSize: '14px', color: '#fff' }}>
            {categoryName}
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fff' }}>
            ${categoryValue.toLocaleString()}
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9, color: '#fff' }}>
            {categoryPercentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles['actual-cost-breakdown']}>
      <div className={styles['chart-header']}>
        <h2>Total Cost Breakdown by Category</h2>
      </div>

      <div className={styles['filters-bar']}>
        <div className={styles['filter-group-inline']}>
          <label htmlFor="project-select">Select Project</label>
          <div id="project-dropdown-wrapper" className={styles['custom-dropdown-wrapper']}>
            <div
              className={styles['custom-dropdown-trigger']}
              onClick={toggleProjectDropdown}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleProjectDropdown();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <span className={selectedProject ? styles['selected-value'] : styles['placeholder']}>
                {getSelectedProjectName()}
              </span>
              <span
                className={`${styles['dropdown-arrow']} ${
                  isProjectDropdownOpen ? styles['open'] : ''
                }`}
              >
                ▼
              </span>
            </div>
            {isProjectDropdownOpen && (
              <div className={styles['custom-dropdown-menu']}>
                <div
                  className={`${styles['custom-dropdown-option']} ${
                    !selectedProject ? styles['selected'] : ''
                  }`}
                  onClick={() => handleProjectChange('')}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProjectChange('');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  Select a project
                </div>
                {projects.map(project => (
                  <div
                    key={project._id}
                    className={`${styles['custom-dropdown-option']} ${
                      selectedProject === project._id ? styles['selected'] : ''
                    }`}
                    onClick={() => handleProjectChange(project._id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleProjectChange(project._id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {project.projectName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles['filter-group-inline']}>
          <label htmlFor="dates-select">DATES</label>
          <div className={styles['date-range-inputs']}>
            <div className={styles['date-input-wrapper']}>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                max={toDate || ''}
                className={`${styles['form-control']} ${styles['date-input']}`}
              />
              {!fromDate && <span className={styles['date-placeholder']}>mm/dd/yyyy</span>}
            </div>
            <span className={styles['date-separator']}>-</span>
            <div className={styles['date-input-wrapper']}>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={handleToDateChange}
                min={fromDate || ''}
                className={`${styles['form-control']} ${styles['date-input']}`}
              />
              {!toDate && <span className={styles['date-placeholder']}>mm/dd/yyyy</span>}
            </div>
          </div>
        </div>
      </div>

      {!selectedProject && !loading && !error && (
        <div className={styles['no-data']}>
          <p>No project selected</p>
        </div>
      )}

      {selectedProject && (
        <>
          {loading && (
            <div className={styles['loading-spinner-container']}>
              <div className={styles['loading-spinner']}>
                <div className={styles['spinner']}></div>
                <p>Loading cost breakdown data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className={styles['error-message']}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && !chartData && (
            <div className={styles['no-data']}>
              <p>
                {fromDate || toDate
                  ? 'No Actual cost data available for this project in this date range'
                  : 'No Actual cost data available for this project for the current month'}
              </p>
            </div>
          )}

          {!loading && !error && chartData && (
            <div className={styles['chart-area']} ref={chartAreaRef}>
              <ResponsiveContainer width="100%" height={550}>
                <PieChart>
                  <Pie
                    data={chartData.chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={200}
                    innerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {chartData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center text showing percentage change */}
              <div className={styles['center-text']}>
                <div className={styles['percentage-change']}>
                  <div className={styles['change-text']}>
                    {Math.abs(chartData.percentageChange).toFixed(1)}%{' '}
                    {chartData.percentageChange >= 0 ? 'increase' : 'decrease'} over last month
                  </div>
                </div>
              </div>

              {/* Category labels with connecting lines - using CSS positioning */}
              {chartData && chartData.chartData && (
                <>
                  {/* SVG for connecting lines */}
                  <svg
                    className={styles['category-labels-svg']}
                    width={containerDimensions.width || 800}
                    height={containerDimensions.height || 600}
                    style={{
                      position: 'absolute',
                      top: `${containerDimensions.offsetY || 0}px`,
                      left: `${containerDimensions.offsetX || 0}px`,
                      pointerEvents: 'none',
                      overflow: 'visible',
                    }}
                  >
                    {segmentPositionsRef.current.map(segment => {
                      if (!segment) return null;

                      const RADIAN = Math.PI / 180;
                      // Use stored center from Recharts or fallback
                      const cx =
                        segment.cx ||
                        containerDimensions.centerX ||
                        (containerDimensions.width || 800) / 2;
                      const cy =
                        segment.cy ||
                        containerDimensions.centerY ||
                        (containerDimensions.height || 600) / 2;

                      // Chart dimensions: outerRadius=200px
                      const chartOuterRadius = 200;
                      const lineStartRadius = chartOuterRadius;
                      const lineEndRadius = 230;

                      // Calculate line points using actual midAngle from Recharts
                      const angleRad = -segment.midAngle * RADIAN;
                      const lineStartX = cx + lineStartRadius * Math.cos(angleRad);
                      const lineStartY = cy + lineStartRadius * Math.sin(angleRad);
                      const lineEndX = cx + lineEndRadius * Math.cos(angleRad);
                      const lineEndY = cy + lineEndRadius * Math.sin(angleRad);

                      return (
                        <line
                          key={`line-${segment.name}-${segment.index}`}
                          x1={lineStartX}
                          y1={lineStartY}
                          x2={lineEndX}
                          y2={lineEndY}
                          stroke="#ccc"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </svg>

                  {/* Labels using CSS positioning - name above line, percentage below */}
                  {segmentPositionsRef.current.map((segment, idx) => {
                    if (!segment) return null;

                    const RADIAN = Math.PI / 180;
                    // Use stored center from Recharts or fallback to calculated center
                    const cx =
                      segment.cx ||
                      containerDimensions.centerX ||
                      (containerDimensions.width || 800) / 2;
                    const cy =
                      segment.cy ||
                      containerDimensions.centerY ||
                      (containerDimensions.height || 600) / 2;

                    // Line end position (where the line ends, labels will be positioned around this)
                    // Use the actual midAngle from Recharts
                    const lineEndRadius = 230;
                    const angleRad = -segment.midAngle * RADIAN;
                    const lineEndXRelative = cx + lineEndRadius * Math.cos(angleRad);
                    const lineEndYRelative = cy + lineEndRadius * Math.sin(angleRad);

                    // Convert to absolute position relative to chart-area (add SVG offset)
                    const offsetX = containerDimensions.offsetX || 0;
                    const offsetY = containerDimensions.offsetY || 0;
                    const lineEndX = lineEndXRelative + offsetX;
                    const lineEndY = lineEndYRelative + offsetY;

                    const isRightSide = lineEndXRelative > cx;

                    return (
                      <React.Fragment key={`label-${segment.name}-${segment.index}`}>
                        {/* Category name - positioned above the line end */}
                        <div
                          className={styles['category-label-name']}
                          style={{
                            position: 'absolute',
                            left: `${lineEndX}px`,
                            top: `${lineEndY - 25}px`,
                            transform: `translate(${isRightSide ? '0' : '-100%'}, 0)`,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            zIndex: 6,
                          }}
                        >
                          <span
                            className={styles['category-name']}
                            style={{ color: segment.color }}
                          >
                            {segment.name}
                          </span>
                        </div>

                        {/* Percentage - positioned below the line end */}
                        <div
                          className={styles['category-label-percentage']}
                          style={{
                            position: 'absolute',
                            left: `${lineEndX}px`,
                            top: `${lineEndY + 5}px`,
                            transform: `translate(${isRightSide ? '0' : '-100%'}, 0)`,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            zIndex: 6,
                          }}
                        >
                          <span
                            className={styles['category-percentage']}
                            style={{ color: segment.color }}
                          >
                            {segment.percentage}%
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Legend at the bottom showing all categories with their colors - always visible */}
          {selectedProject && !loading && (
            <div className={styles['chart-legend']}>
              {CATEGORIES.map(category => (
                <div key={`legend-${category}`} className={styles['legend-item']}>
                  <div
                    className={styles['legend-color']}
                    style={{ backgroundColor: COLORS[category] }}
                  ></div>
                  <span className={styles['legend-label']}>{category}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActualCostBreakdown;
