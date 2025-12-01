/* eslint-disable */
/* prettier-ignore */
import { useState, useEffect } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import styles from './UtilizationChart.module.css';
import { useSelector } from 'react-redux';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

function UtilizationChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [toolsData, setToolsData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [toolFilter, setToolFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [error, setError] = useState(null);

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_APIENDPOINT}/tools/utilization`, {
        params: {
          startDate,
          endDate,
          tool: toolFilter,
          project: projectFilter,
        },
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      setToolsData(response.data);
    } catch (err) {
      setError('Failed to load utilization data.');
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  const handleApplyClick = () => {
    fetchChartData();
  };

  const chartData = {
    labels: toolsData.map(tool => tool.name),
    datasets: [
      {
        label: 'Utilization (%)',
        data: toolsData.map(tool => tool.utilizationRate),
        backgroundColor: '#a0e7e5',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      datalabels: {
        color: '#333',
        anchor: 'end',
        align: 'end',
        font: {
          weight: 'bold',
          size: 12,
        },
        formatter: (_, context) => {
          const tool = toolsData[context.dataIndex];
          return `${tool.downtime} hrs`;
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            const tool = toolsData[context.dataIndex];
            return `Utilization: ${tool.utilizationRate}%, Downtime: ${tool.downtime} hrs`;
          },
        },
      },
    },
    scales: {
      x: {
        max: 100,
        title: {
          display: true,
          text: 'Time (%)',
        },
      },
      y: {
        ticks: {
          autoSkip: false,
        },
      },
    },
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: darkMode ? '#1B2A41' : '#ffffff',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        className={`${styles.utilizationChartContainer} ${darkMode ? 'darkMode' : ''}`}
        style={{
          backgroundColor: darkMode ? '#1B2A41' : '#ffffff',
          color: darkMode ? '#ffffff' : '#000000',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 0,
        }}
      >
        <h2 className={styles.chartTitle} style={{ color: darkMode ? '#ffffff' : '#000000' }}>
          Utilization Chart
        </h2>

        {error ? (
          <div className={styles.utilizationChartError}>{error}</div>
        ) : (
          <>
            <div className={`${styles.filters} ${darkMode ? 'darkMode' : ''}`}>
              <select
                value={toolFilter}
                onChange={e => setToolFilter(e.target.value)}
                className={`${styles.select} ${darkMode ? 'darkMode' : ''}`}
                style={darkMode ? { backgroundColor: '#3A506B', color: '#ffffff' } : {}}
              >
                <option value="ALL">All Tools</option>
                {/* other options */}
              </select>

              <select
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                className={`${styles.select} ${darkMode ? 'darkMode' : ''}`}
                style={darkMode ? { backgroundColor: '#3A506B', color: '#ffffff' } : {}}
              >
                <option value="ALL">All Projects</option>
                {/* other options */}
              </select>

              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                placeholderText="Start Date"
                className={`${styles.datepickerWrapper} ${darkMode ? 'darkMode' : ''}`}
                style={darkMode ? { backgroundColor: '#3A506B', color: '#ffffff' } : {}}
              />

              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                placeholderText="End Date"
                className={`${styles.datepickerWrapper} ${darkMode ? 'darkMode' : ''}`}
                style={darkMode ? { backgroundColor: '#3A506B', color: '#ffffff' } : {}}
              />

              <button
                onClick={handleApplyClick}
                className={`${styles.button} ${darkMode ? 'darkMode' : ''}`}
                style={darkMode ? { backgroundColor: '#007FFF', color: '#000' } : {}}
              >
                Apply
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Bar data={chartData} options={options} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UtilizationChart;
