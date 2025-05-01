import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import { ENDPOINTS } from 'utils/URL';
import { useSelector } from 'react-redux';

export default function ExpenditureLineGraph() {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenditureData, setExpenditureData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  // date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const darkMode = useSelector(state => state.theme.darkMode);

  // format the date as YYYY-MM-DD
  const formatDateForInput = date => {
    return date.toISOString().split('T')[0];
  };

  // use effect fetches data
  useEffect(() => {
    const fetchExpenditureData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.BM_EXPENDITURE);
        if (response.data.success) {
          const { data } = response.data;
          setExpenditureData(data);
          // extract unique IDs
          const uniqueProjects = [...new Set(data.map(item => item.projectId))];
          setProjects(uniqueProjects);
          // default date range
          if (data.length > 0) {
            const dates = data.map(item => new Date(item.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            setStartDate(formatDateForInput(minDate));
            setEndDate(formatDateForInput(maxDate));
            // set date range
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

    // Clean up function
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
        setChartInstance(null);
      }
    };
  }, []);

  const updateChart = chartData => {
    const ctx = chartRef.current.getContext('2d');
    const chartTitle =
      selectedProject === 'all'
        ? 'Cost Breakdown by Type of Expenditure (all projects)'
        : `Cost Breakdown by Type of Expenditure (Project: ${selectedProject})`;

    const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = darkMode ? '#ffffff' : '#666666';

    if (chartInstance) {
      // Update existing chart
      chartInstance.data = chartData;
      chartInstance.options.plugins.title.text = chartTitle;
      chartInstance.options.plugins.title.color = textColor;
      chartInstance.options.scales.y.grid.color = gridColor;
      chartInstance.options.scales.x.grid.color = gridColor;
      chartInstance.options.scales.y.ticks.color = textColor;
      chartInstance.options.scales.x.ticks.color = textColor;
      chartInstance.options.scales.y.title.color = textColor;
      chartInstance.options.scales.x.title.color = textColor;
      chartInstance.update();
    } else {
      // Create new chart
      const config = {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
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
        },
      };
      const newChartInstance = new Chart(ctx, config);
      setChartInstance(newChartInstance);
    }
  };

  const processDataForChart = expenditureDataArr => {
    // group data by month and cat
    const groupedByMonth = {};
    const categories = new Set();

    // Extract month from date and group data
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

    const datasets = Array.from(categories).map((category, index) => {
      const colors = ['#6293CC', '#C55151', '#E8D06B', '#94B66F'];
      const data = labels.map(month => groupedByMonth[month][category] || 0);
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

  // handle chart changes when filters change
  useEffect(() => {
    if (expenditureData.length > 0 && chartRef.current) {
      let filteredData = expenditureData;

      // if not all data, filter by requested filtered title project
      if (selectedProject !== 'all') {
        filteredData = expenditureData.filter(item => item.projectId === selectedProject);
      }

      // filter dates
      if (dateRange.start && dateRange.end) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= dateRange.start && itemDate <= dateRange.end;
        });
      }

      // if data after filter?
      if (filteredData.length === 0) {
        if (chartInstance) {
          chartInstance.destroy();
          setChartInstance(null);
        }
        return;
      }

      const processedData = processDataForChart(filteredData);
      updateChart(processedData);
    }
  }, [selectedProject, dateRange, expenditureData, darkMode]);

  useEffect(() => {
    if (chartInstance) {
      const textColor = darkMode ? '#ffffff' : '#666666';
      const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

      chartInstance.options.plugins.title.color = textColor;
      chartInstance.options.plugins.legend.labels.color = textColor;
      chartInstance.options.scales.y.grid.color = gridColor;
      chartInstance.options.scales.x.grid.color = gridColor;
      chartInstance.options.scales.y.ticks.color = textColor;
      chartInstance.options.scales.x.ticks.color = textColor;
      chartInstance.options.scales.y.title.color = textColor;
      chartInstance.options.scales.x.title.color = textColor;

      chartInstance.update();
    }
  }, [darkMode, chartInstance]);

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
      // if date cleared, use earliest date
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
      // if date cleared, use earliest date
      const dates = expenditureData.map(item => new Date(item.date));
      setDateRange(prev => ({
        ...prev,
        end: new Date(Math.max(...dates)),
      }));
    }
  };

  return (
    <div className={`expenditure-chart-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1
        style={{
          margin: '20px',
          color: darkMode ? 'var(--text-color)' : 'inherit',
        }}
      >
        Cost Breakdown by Type of Expenditure
      </h1>

      <div
        className="filter-controls"
        style={{
          backgroundColor: darkMode ? 'var(--card-bg)' : '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <div className="project-filter" style={{ marginBottom: '10px' }}>
          <label
            style={{
              color: darkMode ? 'var(--text-color)' : 'inherit',
              marginRight: '10px',
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
              border: darkMode ? '1px solid #4a5568' : '1px solid #ddd',
              backgroundColor: darkMode ? '#2d3748' : '#fff',
              color: darkMode ? '#e2e8f0' : 'inherit',
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
          className="filter-group"
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <label htmlFor="start-date" style={{ color: darkMode ? 'var(--text-color)' : 'inherit' }}>
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
              border: darkMode ? '1px solid #4a5568' : '1px solid #ddd',
              backgroundColor: darkMode ? '#2d3748' : '#fff',
              color: darkMode ? '#e2e8f0' : 'inherit',
            }}
          />

          <label htmlFor="end-date" style={{ color: darkMode ? 'var(--text-color)' : 'inherit' }}>
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
              border: darkMode ? '1px solid #4a5568' : '1px solid #ddd',
              backgroundColor: darkMode ? '#2d3748' : '#fff',
              color: darkMode ? '#e2e8f0' : 'inherit',
            }}
          />
        </div>
      </div>

      {loading && (
        <p style={{ color: darkMode ? 'var(--text-color)' : 'inherit' }}>Loading data...</p>
      )}

      {error && (
        <p
          className="error"
          style={{
            color: darkMode ? '#ff6b6b' : '#d32f2f',
            backgroundColor: darkMode ? 'rgba(255, 107, 107, 0.1)' : 'rgba(211, 47, 47, 0.05)',
            padding: '10px',
            borderRadius: '4px',
            border: darkMode ? '1px solid #ff6b6b' : '1px solid #d32f2f',
          }}
        >
          Error: {error}
        </p>
      )}

      <div
        style={{
          paddingTop: '20px',
          margin: '15px',
          backgroundColor: darkMode ? 'var(--card-bg)' : '#ffffff',
          borderRadius: '8px',
          boxShadow: darkMode ? '0 2px 5px var(--card-shadow)' : '0 2px 5px rgba(0, 0, 0, 0.1)',
          padding: '15px',
        }}
      >
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}
