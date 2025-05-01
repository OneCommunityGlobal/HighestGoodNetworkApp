import Chart from 'chart.js/auto';
import { useEffect, useRef, useState } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import './ExpenditureLineGraph.css';

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

    if (chartInstance) {
      // Update existing chart
      chartInstance.data = chartData;
      chartInstance.options.plugins.title.text = chartTitle;
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
            },
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Cost($)',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Month',
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

    // Prepare data for Chart.js
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
        return yearA - yearB;
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
        tension: 0.1,
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
  }, [selectedProject, dateRange, expenditureData]);

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
    <div className="expenditure-chart-container">
      <h1 style={{ margin: '20px' }}>Cost Breakdown by Type of Expenditure</h1>
      <div className="project-filter">
        <label>Filter by project: </label>
        <select
          id="project-select"
          value={selectedProject}
          onChange={handleProjectChange}
          disabled={loading || projects.length === 0}
        >
          <option value="all">All Projects</option>
          {projects.map(project => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="start-date">From: </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          disabled={loading}
        />

        <label htmlFor="end-date">To: </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          disabled={loading}
          min={startDate}
        />
      </div>
      {loading && <p>Loading data...</p>}
      {error && <p className="error">Error: {error}</p>}
      <div style={{ paddingTop: '20px', margin: '15px' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}
