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
import { ENDPOINTS } from '../../../utils/URL';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title, ChartDataLabels);

function UtilizationChart() {
  const [toolsData, setToolsData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [toolFilter, setToolFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [error, setError] = useState(null);
  const [toolTypes, setToolTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const darkMode = useSelector(state => state.theme.darkMode);

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

  const fetchFilterData = async () => {
    try {
      const [toolTypesResponse, projectsResponse] = await Promise.all([
        axios.get(ENDPOINTS.BM_TOOL_TYPES, {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        }),
        axios.get(ENDPOINTS.BM_PROJECTS + 'Names', {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        }),
      ]);
      setToolTypes(toolTypesResponse.data);
      setProjects(projectsResponse.data);
    } catch (err) {
      setError('Failed to load filter options. Please try refreshing the page.');
    }
  };

  useEffect(() => {
    fetchFilterData();
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
        backgroundColor: darkMode ? '#007bff' : '#a0e7e5',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        labels: { color: darkMode ? '#ffffff' : '#333' },
      },
      datalabels: {
        color: darkMode ? '#ffffff' : '#333',
        anchor: 'end',
        align: 'end',
        font: {
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
        footerColor: 'white',
      },
    },
    scales: {
      x: {
        max: 100,
        title: {
          display: true,
          text: 'Time (%)',
          color: darkMode ? '#ffffff' : '#333',
        },
        ticks: { color: darkMode ? '#ffffff' : '#333' },
        grid: { color: darkMode ? '#c7c7c7ff' : '#bebebeff' },
      },
      y: {
        ticks: {
          autoSkip: false,
          color: darkMode ? '#ffffff' : '#333',
        },
        grid: { color: darkMode ? '#c7c7c7ff' : '#bebebeff' },
      },
    },
  };

  return (
    <div className={`${styles.utilizationChartContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h2 className={styles.chartTitle}>Utilization Chart</h2>

      {error ? (
        <div className={styles.utilizationChartError}>{error}</div>
      ) : (
        <>
          <div className={styles.filters}>
            <select
              value={toolFilter}
              onChange={e => setToolFilter(e.target.value)}
              className={styles.select}
            >
              <option value="ALL">All Tools</option>
              {toolTypes.map(toolType => (
                <option key={toolType._id} value={toolType._id}>
                  {toolType.name}
                </option>
              ))}
            </select>

            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className={styles.select}
            >
              <option value="ALL">All Projects</option>
              {projects.map(project => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))}
            </select>

            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="Start Date"
              className={styles.datepickerWrapper}
            />

            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              placeholderText="End Date"
              className={styles.datepickerWrapper}
            />

            <button onClick={handleApplyClick} className={styles.button}>
              Apply
            </button>
          </div>

          <Bar data={chartData} options={options} />
        </>
      )}
    </div>
  );
}

export default UtilizationChart;
