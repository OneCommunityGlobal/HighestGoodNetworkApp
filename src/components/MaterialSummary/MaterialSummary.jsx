import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { mockProjects, mockMaterialData, chartColors } from './Data';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function MaterialUsageDashboard() {
  const [selectedProject, setSelectedProject] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [showIncreaseOnly, setShowIncreaseOnly] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [increasePercentage, setIncreasePercentage] = useState(0);

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

  // Function to add a title in the center of the donut chart
  const plugins = [
    {
      id: 'donutTitle',
      beforeDraw: chart => {
        const { width } = chart;
        const { height } = chart;
        const { ctx } = chart;

        ctx.restore();
        const fontSize = (height / 240).toFixed(2); // Smaller font size
        ctx.font = `${fontSize}em sans-serif`;
        ctx.textBaseline = 'middle';

        const text = 'Materials';
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;

        ctx.fillText(text, textX, textY);
        ctx.save();
      },
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '24px' }}>
        Material Usage Dashboard
      </h1>

      <div style={{ display: 'grid', gap: '24px' }} className="grid-container">
        {/* Filters Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '16px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '4px' }}>
                Filters
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Select options to filter the chart data
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Project Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  htmlFor="project"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500' }}
                >
                  Project
                </label>
                <select
                  id="project"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                  }}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  htmlFor="material"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500' }}
                >
                  Material Type
                </label>
                <select
                  id="material"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    outline: 'none',
                  }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
                <input
                  type="checkbox"
                  id="increase"
                  checked={showIncreaseOnly}
                  onChange={e => setShowIncreaseOnly(e.target.checked)}
                  style={{ height: '16px', width: '16px' }}
                />
                <label htmlFor="increase" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                  Show only materials with increased usage
                </label>
              </div>
            </div>
          </div>

          {/* Increase Counter */}
          {showIncreaseOnly && increasePercentage !== 0 && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '16px',
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Usage Trend</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: increasePercentage > 0 ? '#dcfce7' : '#fee2e2',
                    color: increasePercentage > 0 ? '#166534' : '#991b1b',
                  }}
                >
                  {increasePercentage > 0 ? '↑' : '↓'} {Math.abs(increasePercentage).toFixed(1)}%
                </span>
                <span style={{ marginLeft: '8px', fontSize: '0.875rem' }}>
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
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '16px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                Material Usage Breakdown
                {selectedMaterial !== 'all' &&
                  ` - ${selectedMaterial.charAt(0).toUpperCase() + selectedMaterial.slice(1)}`}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {mockProjects.find(p => p.id === selectedProject)?.name}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '220px',
              }}
            >
              {loading && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      animation: 'spin 1s linear infinite',
                      borderRadius: '50%',
                      height: '48px',
                      width: '48px',
                      borderBottom: '2px solid #3b82f6',
                      marginBottom: '8px',
                    }}
                  />
                  <p>Loading data...</p>
                </div>
              )}

              {!loading && chartData && (
                <div style={{ width: '100%', maxWidth: '300px' }}>
                  <Pie
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
                            font: {
                              size: 12,
                            },
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
                    plugins={plugins}
                  />
                </div>
              )}

              {!loading && !chartData && <p>No data available</p>}
            </div>
            {/* Material Breakdown List */}
            {chartData && !loading && (
              <div
                style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '12px' }}>
                  Material Breakdown
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {chartData.datasets[0].data.map((value, index) => {
                    const label = chartData.labels[index].split(':')[0];
                    const color = chartData.datasets[0].backgroundColor[index];
                    return (
                      <div
                        key={`${chartData.labels[index]}-${value}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb',
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: color,
                          }}
                        />
                        <div>
                          <p style={{ fontWeight: '500' }}>{label}</p>
                          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {value}{' '}
                            <span
                              style={{
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                fontWeight: 'normal',
                              }}
                            >
                              units
                            </span>
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

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (min-width: 1024px) {
          .grid-container {
            grid-template-columns: 1fr 3fr;
          }
        }
      `}</style>
    </div>
  );
}
