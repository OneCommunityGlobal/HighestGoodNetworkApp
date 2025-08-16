import React, { useRef, useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { useSelector } from 'react-redux';

export default function ExpenditureLineGraph() {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenditureData, setExpenditureData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateError, setDateError] = useState(null);
  const [noDataError, setNoDataError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const darkMode = useSelector(state => state.theme.darkMode);

  // Set body styles when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = '#1b2a41';
      document.body.style.color = '#ffffff';
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    } else {
      document.body.style.backgroundColor = '#f9f9f9';
      document.body.style.color = 'inherit';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.body.style.transition = '';
    };
  }, [darkMode]);

  const formatDateForInput = date => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchExpenditureData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.BM_EXPENDITURE);
        if (response?.data?.success) {
          const { data } = response.data;
          setExpenditureData(data);
          const uniqueProjects = [...new Set(data.map(item => item.projectId))];
          setProjects(uniqueProjects);
          if (data.length > 0) {
            const dates = data.map(item => new Date(item.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            setStartDate(formatDateForInput(minDate));
            setEndDate(formatDateForInput(maxDate));
            setDateRange({
              start: minDate,
              end: maxDate,
            });
          }
        } else {
          setError('Failed to fetch the data');
        }
      } catch (err) {
        setError(`Error fetching data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenditureData();

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstance) {
      chartInstance.destroy();
      setChartInstance(null);
    }
  }, [darkMode]);

  const createChart = chartData => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    const chartTitle =
      selectedProject === 'all'
        ? 'Cost Breakdown by Type of Expenditure (all projects)'
        : `Cost Breakdown by Type of Expenditure (Project: ${selectedProject})`;

    const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = darkMode ? '#ffffff' : '#666666';
    const chartBackgroundColor = darkMode ? '#1b2a41' : '#ffffff';

    if (chartInstance) {
      chartInstance.destroy();
    }

    const config = {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chartTitle,
            color: textColor,
            font: {
              size: 14,
              weight: 'bold',
            },
            padding: {
              top: 10,
              bottom: 15,
            },
          },
          legend: {
            labels: {
              color: textColor,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: darkMode ? '#3a506b' : 'rgba(0, 0, 0, 0.7)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Cost($)',
              color: textColor,
              font: {
                size: 12,
                weight: 'bold',
              },
            },
            ticks: {
              color: textColor,
              font: {
                size: 11,
              },
              callback(value) {
                if (value >= 1000) {
                  return `$${value / 1000}k`;
                }
                return `$${value}`;
              },
            },
            grid: {
              color: gridColor,
              borderColor: gridColor,
            },
          },
          x: {
            title: {
              display: true,
              text: 'Month',
              color: textColor,
              font: {
                size: 12,
                weight: 'bold',
              },
            },
            ticks: {
              color: textColor,
              font: {
                size: 11,
              },
            },
            grid: {
              color: gridColor,
              borderColor: gridColor,
            },
          },
        },
        animation: {
          onComplete() {
            const chart = this;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = chartBackgroundColor;
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          },
        },
      },
    };

    const newChartInstance = new Chart(ctx, config);
    setChartInstance(newChartInstance);
  };

  const processDataForChart = expenditureDataArr => {
    const groupedByMonth = {};
    const categories = new Set();

    expenditureDataArr.forEach(item => {
      const date = new Date(item.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!groupedByMonth[monthYear]) {
        groupedByMonth[monthYear] = {};
      }

      if (!groupedByMonth[monthYear][item.category]) {
        groupedByMonth[monthYear][item.category] = 0;
      }

      groupedByMonth[monthYear][item.category] += item.cost;
      categories.add(item.category);
    });

    const labels = Object.keys(groupedByMonth).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      if (yearA !== yearB) {
        return parseInt(yearA, 10) - parseInt(yearB, 10);
      }
      return months.indexOf(monthA) - months.indexOf(monthB);
    });

    if (labels.length === 1) {
      const [month, year] = labels[0].split(' ');
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthIndex = months.indexOf(month);
      const nextMonthIndex = (monthIndex + 1) % 12;
      const nextYear = nextMonthIndex === 0 ? parseInt(year, 10) + 1 : parseInt(year, 10);
      labels.push(`${months[nextMonthIndex]} ${nextYear}`);
    }
    const datasets = Array.from(categories).map((category, index) => {
      const colors = ['#6293CC', '#C55151', '#E8D06B', '#94B66F'];
      const data = labels.map(month => groupedByMonth[month]?.[category] || 0);

      return {
        label: category,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: darkMode
          ? `${colors[index % colors.length]}33`
          : `${colors[index % colors.length]}1A`,
        tension: 0.1,
        fill: false,
      };
    });

    return { labels, datasets };
  };

  useEffect(() => {
    if (expenditureData.length > 0 && chartRef.current) {
      setDateError(null);
      setNoDataError(null);

      if (dateRange.start && dateRange.end && dateRange.start > dateRange.end) {
        setDateError('Start date cannot be greater than end date');
        if (chartInstance) {
          chartInstance.destroy();
          setChartInstance(null);
        }
        return;
      }

      let filteredData = expenditureData;

      if (selectedProject !== 'all') {
        filteredData = expenditureData.filter(item => item.projectId === selectedProject);
      }

      if (dateRange.start && dateRange.end) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= dateRange.start && itemDate <= dateRange.end;
        });
      }

      if (filteredData.length === 0) {
        setNoDataError('No data available for the selected date range and project');
        if (chartInstance) {
          chartInstance.destroy();
          setChartInstance(null);
        }
        return;
      }

      const processedData = processDataForChart(filteredData);
      createChart(processedData);
    }
  }, [selectedProject, dateRange, expenditureData, darkMode]);

  const handleProjectChange = e => {
    setSelectedProject(e.target.value);
  };

  const handleStartDateChange = e => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (newStartDate) {
      const newStartDateTime = new Date(newStartDate);
      setDateRange(prev => ({
        ...prev,
        start: newStartDateTime,
      }));
    } else {
      const dates = expenditureData.map(item => new Date(item.date));
      setDateRange(prev => ({
        ...prev,
        start: new Date(Math.min(...dates)),
      }));
    }
  };

  const handleEndDateChange = e => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    if (newEndDate) {
      const newEndDateTime = new Date(newEndDate);
      setDateRange(prev => ({
        ...prev,
        end: newEndDateTime,
      }));
    } else {
      const dates = expenditureData.map(item => new Date(item.date));
      setDateRange(prev => ({
        ...prev,
        end: new Date(Math.max(...dates)),
      }));
    }
  };

  return (
    <div
      className={`expenditure-chart-container ${darkMode ? 'dark-mode' : ''}`}
      style={{
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: darkMode ? '#1b2a41' : '#f9f9f9',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          style={{
            color: darkMode ? '#ffffff' : 'inherit',
            textAlign: 'center',
            margin: '0 0 10px 0',
          }}
        >
          Cost Breakdown by Type of Expenditures
        </h1>
        <div className="filter-controls">
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%',
              padding: '0 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '10px',
              }}
            >
              <div
                className="project-filter"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <label
                  htmlFor="project-select"
                  style={{
                    color: darkMode ? '#ffffff' : 'inherit',
                  }}
                >
                  Filter by project:
                </label>
                <select
                  id="project-select"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  disabled={loading || projects.length === 0}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ddd',
                    backgroundColor: darkMode ? '#253342' : '#fff',
                    color: darkMode ? '#ffffff' : 'inherit',
                  }}
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className="date-filters"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <label htmlFor="start-date" style={{ color: darkMode ? '#ffffff' : 'inherit' }}>
                  From:
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  disabled={loading}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ddd',
                    backgroundColor: darkMode ? '#253342' : '#fff',
                    color: darkMode ? '#ffffff' : 'inherit',
                  }}
                />
                <label htmlFor="end-date" style={{ color: darkMode ? '#ffffff' : 'inherit' }}>
                  To:
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  disabled={loading}
                  min={startDate}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ddd',
                    backgroundColor: darkMode ? '#253342' : '#fff',
                    color: darkMode ? '#ffffff' : 'inherit',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <p
            style={{
              color: darkMode ? '#ffffff' : 'inherit',
              textAlign: 'center',
            }}
          >
            Loading data...
          </p>
        )}

        {error && (
          <p
            style={{
              color: darkMode ? '#ff6b6b' : '#d32f2f',
              backgroundColor: darkMode ? '#2a3a5a' : 'rgba(211, 47, 47, 0.05)',
              padding: '10px',
              borderRadius: '4px',
              border: darkMode ? '1px solid #ff6b6b' : '1px solid #d32f2f',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 20px auto',
            }}
          >
            Error: {error}
          </p>
        )}
        {dateError && (
          <p
            style={{
              color: darkMode ? '#ff6b6b' : '#d32f2f',
              backgroundColor: darkMode ? '#2a3a5a' : 'rgba(211, 47, 47, 0.05)',
              padding: '10px',
              borderRadius: '4px',
              border: darkMode ? '1px solid #ff6b6b' : '1px solid #d32f2f',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 20px auto',
            }}
          >
            {dateError}
          </p>
        )}

        {noDataError && (
          <p
            style={{
              color: darkMode ? '#ff6b6b' : '#d32f2f',
              backgroundColor: darkMode ? '#2a3a5a' : 'rgba(211, 47, 47, 0.05)',
              padding: '10px',
              borderRadius: '4px',
              border: darkMode ? '1px solid #ff6b6b' : '1px solid #d32f2f',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 20px auto',
            }}
          >
            {noDataError}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 20px',
          }}
        >
          <div
            style={{
              backgroundColor: darkMode ? '#16213e' : '#ffffff',
              borderRadius: '12px',
              border: darkMode ? '1px solid #233554' : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: darkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
              padding: '20px',
              maxWidth: '800px',
              width: '100%',
              height: '400px',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <canvas
              ref={chartRef}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                backgroundColor: darkMode ? '#16213e' : 'transparent',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
