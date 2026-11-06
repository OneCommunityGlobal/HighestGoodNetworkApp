import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { chartColors } from './Data';
import styles from './MaterialSummary.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaterialTypes } from '../../actions/bmdashboard/invTypeActions';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function MaterialUsageDashboard() {
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const dispatch = useDispatch();
  const materialTypes = useSelector(state => state.bmInvTypes.list || []);
  const [showIncreaseOnly, setShowIncreaseOnly] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [increasePercentage, setIncreasePercentage] = useState(0);
  const [chartKey, setChartKey] = useState(0);
  const chartRef = useRef(null);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(ENDPOINTS.BM_PROJECTS_NAMES);
        const projectList = Array.isArray(response.data)
          ? response.data
          : response.data.projects || [];
        setProjects(projectList);
        if (projectList.length > 0) {
          setSelectedProject(projectList[0].projectId);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    dispatch(fetchMaterialTypes());
  }, [dispatch]);

  // Get darkMode with multiple fallbacks
  const themeState = useSelector(state => state?.theme);
  const darkMode = themeState?.darkMode ?? false;

  // Trigger chart re-render when darkMode changes
  useEffect(() => {
    setChartKey(prev => prev + 1);
  }, [darkMode]);

  // Update the updateChartData function to handle the new material types with appropriate colors
  const updateChartData = materialData => {
    const available = Number(materialData.availableMaterials) || 0;
    const used = Number(materialData.usedMaterials) || 0;
    const wasted = Number(materialData.wastedMaterials) || 0;
    const increase = Number(materialData.increaseOverLastWeek) || 0;

    setIncreasePercentage(increase);

    if (showIncreaseOnly && increase <= 0) {
      setChartData(null);
      return;
    }

    const total = available + used + wasted;

    if (total === 0) {
      setChartData(null);
      return;
    }

    const colorPalette = [chartColors.available, chartColors.used, chartColors.wasted];

    setChartData({
      labels: [
        `Available Materials: ${Math.round((available / total) * 100)}%`,
        `Used Materials: ${Math.round((used / total) * 100)}%`,
        `Wasted Materials: ${Math.round((wasted / total) * 100)}%`,
      ],
      datasets: [
        {
          data: [available, used, wasted],
          backgroundColor: colorPalette,
          borderWidth: 1,
          borderColor: '#ffffff',
        },
      ],
    });
  };

  // Update chart data when filters change
  useEffect(() => {
    if (!selectedProject) {
      setChartData(null);
      return;
    }

    let active = true;

    const fetchMaterialData = async () => {
      setLoading(true);

      try {
        const params = {};

        if (selectedMaterial !== 'all') {
          params.materialType = selectedMaterial;
        }

        if (showIncreaseOnly) {
          params.increaseOverLastWeek = true;
        }

        const response = await axios.get(`${ENDPOINTS.BM_MATERIALS}/${selectedProject}`, {
          params,
        });

        if (active) {
          updateChartData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch material data:', error);

        if (active) {
          setChartData(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMaterialData();

    return () => {
      active = false;
    };
  }, [selectedProject, selectedMaterial, showIncreaseOnly]);

  return (
    <>
      <div className={`${styles.dashboardWrapper} ${darkMode ? styles.darkMode : ''}`}>
        <h1 className={styles.dashboardTitle} style={{ textAlign: 'center' }}>
          Material Usage Dashboard
        </h1>
        <div className={styles.gridContainer}>
          {/* Filters Section */}
          <div className={styles.filterPanel}>
            <div className={styles.filterCard}>
              <div className={styles.filterCardHeader}>
                <h2 className={styles.filterCardTitle}>Filters</h2>
                <p className={styles.filterCardDesc}>Select options to filter the chart data</p>
              </div>
              <div className={styles.filterFields}>
                {/* Project Filter */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="project" className={styles.fieldLabel}>
                    Project
                  </label>
                  <select
                    id="project"
                    className={styles.selectInput}
                    value={selectedProject}
                    onChange={e => setSelectedProject(e.target.value)}
                  >
                    {projects.map(project => (
                      <option key={project.projectId} value={project.projectId}>
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material Type Filter */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="material" className={styles.fieldLabel}>
                    Material Type
                  </label>
                  <select
                    id="material"
                    className={styles.selectInput}
                    value={selectedMaterial}
                    onChange={e => setSelectedMaterial(e.target.value)}
                  >
                    <option value="all">All Materials</option>
                    {materialTypes.map(material => (
                      <option key={material._id} value={material._id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Increase Over Last Week Filter */}
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="increase"
                    checked={showIncreaseOnly}
                    onChange={e => setShowIncreaseOnly(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <label htmlFor="increase" className={styles.checkboxLabel}>
                    Show only materials with increased usage
                  </label>
                </div>
              </div>
            </div>

            {/* Increase Counter */}
            {showIncreaseOnly && increasePercentage !== 0 && (
              <div className={styles.increaseCard}>
                <div className={styles.increaseCardTitle}>Usage Trend</div>
                <div className={styles.increaseTrendRow}>
                  <span
                    className={
                      increasePercentage > 0
                        ? `${styles.trendBadge} ${styles.trendBadgeIncrease}`
                        : `${styles.trendBadge} ${styles.trendBadgeDecrease}`
                    }
                  >
                    {increasePercentage > 0 ? '↑' : '↓'} {Math.abs(increasePercentage).toFixed(1)}%
                  </span>
                  <span className={styles.increaseText}>
                    {increasePercentage > 0
                      ? 'Increase in material usage'
                      : 'Decrease in material usage'}{' '}
                    compared to last week
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chart Section */}
          <div>
            <div className={styles.chartPanel}>
              <div className={styles.chartPanelHeader}>
                <h2 className={styles.chartPanelTitle}>
                  Material Usage Breakdown
                  {selectedMaterial !== 'all' &&
                    ` - ${materialTypes.find(material => material._id === selectedMaterial)?.name ||
                      ''}`}
                </h2>
                <p className={styles.chartPanelDesc}>
                  {projects.find(p => p.projectId === selectedProject)?.projectName}
                </p>
              </div>
              <div className={styles.chartArea}>
                {loading && (
                  <div className={styles.loadingArea}>
                    <div className={styles.loadingSpinner} />
                    <p className={styles.loadingText}>Loading data...</p>
                  </div>
                )}
                {!loading && chartData && (
                  <div style={{ width: '100%', maxWidth: '300px' }} key={`chart-${chartKey}`}>
                    <Pie
                      ref={chartRef}
                      key={`pie-${chartKey}`}
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        cutout: '50%',
                        plugins: {
                          datalabels: {
                            color: darkMode ? '#ffffff' : '#333333',
                            font: {
                              weight: 'bold',
                              size: 12,
                            },
                          },
                          legend: {
                            position: 'center',
                            labels: {
                              padding: 10,
                              font: { size: 12 },
                              boxWidth: 12,
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: context => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label} (${value} units)`;
                              },
                            },
                          },
                        },
                      }}
                      plugins={[
                        {
                          id: 'donutTitle',
                          afterDatasetsDraw(chart) {
                            const { width, height } = chart;
                            const ctx = chart.ctx;

                            ctx.save();

                            // Get the center point
                            const centerX = width / 2;
                            const centerY = height / 2;

                            // Set text properties
                            const fontSize = Math.floor(height / 12);
                            ctx.font = `bold ${fontSize}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = darkMode ? '#ffffff' : '#1a1a1a';

                            // Draw text
                            const text = 'Materials';
                            ctx.fillText(text, centerX, centerY);

                            ctx.restore();
                          },
                        },
                      ]}
                    />
                  </div>
                )}
                {!loading && !chartData && <p className={styles.noDataText}>No data available</p>}
              </div>
              {/* Material Breakdown List */}
              {chartData && !loading && (
                <div className={styles.materialBreakdown}>
                  <h3 className={styles.materialBreakdownTitle}>Material Breakdown</h3>
                  <div className={styles.materialBreakdownGrid}>
                    {chartData.datasets[0].data.map((value, index) => {
                      const label = chartData.labels[index].split(':')[0];
                      const color = chartData.datasets[0].backgroundColor[index];
                      return (
                        <div
                          key={`${chartData.labels[index]}-${value}`}
                          className={styles.materialBreakdownItem}
                        >
                          <div
                            className={styles.materialBreakdownDot}
                            style={{ backgroundColor: color }}
                          />
                          <div>
                            <p className={styles.materialBreakdownName}>{label}</p>
                            <p className={styles.materialBreakdownValue}>
                              {value} <span className={styles.materialBreakdownUnit}>units</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
