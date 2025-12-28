import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { mockProjects, mockMaterialData, chartColors } from './Data';
import styles from './MaterialSummary.module.css';
import { useSelector } from 'react-redux';
import Header from '../Header';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function MaterialUsageDashboard() {
  const [selectedProject, setSelectedProject] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [showIncreaseOnly, setShowIncreaseOnly] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [increasePercentage, setIncreasePercentage] = useState(0);
  const [chartKey, setChartKey] = useState(0);
  const chartRef = useRef(null);

  // Get darkMode with multiple fallbacks
  const themeState = useSelector(state => state?.theme);
  const darkMode = themeState?.darkMode ?? false;

  // Trigger chart re-render when darkMode changes
  useEffect(() => {
    setChartKey(prev => prev + 1);
  }, [darkMode]);

  // Update the updateChartData function to handle the new material types with appropriate colors
  const updateChartData = () => {
    const projectData = mockMaterialData[selectedProject];
    const materialData = projectData[selectedMaterial];

    // Calculate increase percentage
    const increase =
      ((materialData.used - materialData.lastWeekUsed) / materialData.lastWeekUsed) * 100;
    setIncreasePercentage(increase);

    // If "Increase Over Last Week" is selected and there's no increase, return empty data
    if (showIncreaseOnly && increase <= 0) {
      setChartData({
        labels: ['No increased usage'],
        datasets: [
          {
            data: [0],
            backgroundColor: ['#e2e8f0'],
            borderWidth: 0,
          },
        ],
      });
      return;
    }

    // Calculate total for percentages
    const total = materialData.available + materialData.used + materialData.wasted;

    // Generate more detailed colors based on material type
    let colorPalette = [chartColors.available, chartColors.used, chartColors.wasted];

    // Add material-specific color variations
    if (selectedMaterial === 'wood') {
      colorPalette = ['#36A2EB', '#9966FF', '#FF9F40']; // Blue, Purple, Orange
    } else if (selectedMaterial === 'concrete') {
      colorPalette = ['#4BC0C0', '#FF6384', '#FFCE56']; // Teal, Pink, Yellow
    } else if (selectedMaterial === 'steel') {
      colorPalette = ['#7ED2FA', '#FF8A80', '#A5D6A7']; // Light Blue, Light Red, Light Green
    } else if (selectedMaterial === 'aluminum') {
      colorPalette = ['#B39DDB', '#E57373', '#81C784']; // Light Purple, Light Red, Light Green
    } else if (selectedMaterial === 'glass') {
      colorPalette = ['#90CAF9', '#F48FB1', '#80DEEA']; // Light Blue, Light Pink, Light Cyan
    } else if (selectedMaterial === 'brick') {
      colorPalette = ['#FFAB91', '#CE93D8', '#FFF59D']; // Light Orange, Light Purple, Light Yellow
    } else if (selectedMaterial === 'plastic') {
      colorPalette = ['#80CBC4', '#F06292', '#FFD54F']; // Light Teal, Pink, Amber
    }

    // Prepare chart data
    setChartData({
      labels: [
        `Available Materials: ${Math.round((materialData.available / total) * 100)}%`,
        `Used Materials: ${Math.round((materialData.used / total) * 100)}%`,
        `Wasted Materials: ${Math.round((materialData.wasted / total) * 100)}%`,
      ],
      datasets: [
        {
          data: [materialData.available, materialData.used, materialData.wasted],
          backgroundColor: colorPalette,
          borderWidth: 1,
          borderColor: '#ffffff',
        },
      ],
    });
  };

  // Update chart data when filters change
  useEffect(() => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      updateChartData();
      setLoading(false);
    }, 800);
  }, [selectedProject, selectedMaterial, showIncreaseOnly]);

  return (
    <>
      <Header />
      <div className={`${styles.dashboardWrapper} ${darkMode ? styles.darkMode : ''}`}>
        <h1 className={styles.dashboardTitle}>Material Usage Dashboard</h1>
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
                    onChange={e => setSelectedProject(Number.parseInt(e.target.value, 10))}
                  >
                    {mockProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
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
                    <option value="wood">Wood</option>
                    <option value="concrete">Concrete</option>
                    <option value="steel">Steel</option>
                    <option value="aluminum">Aluminum</option>
                    <option value="glass">Glass</option>
                    <option value="brick">Brick</option>
                    <option value="plastic">Plastic</option>
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
                    ` - ${selectedMaterial.charAt(0).toUpperCase() + selectedMaterial.slice(1)}`}
                </h2>
                <p className={styles.chartPanelDesc}>
                  {mockProjects.find(p => p.id === selectedProject)?.name}
                </p>
              </div>
              <div className={styles.chartArea}>
                {loading && (
                  <div className={styles.loadingArea}>
                    <div className={styles.loadingSpinner} />
                    <p>Loading data...</p>
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
                {!loading && !chartData && <p>No data available</p>}
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
