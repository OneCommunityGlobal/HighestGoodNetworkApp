import { useState, useEffect } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import './UtilizationChart.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

function UtilizationChart() {
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
      {
        label: 'Downtime (%)',
        data: toolsData.map(tool => 100 - tool.utilizationRate),
        backgroundColor: '#f9c74f',
        borderRadius: 6,
      },
    ],
  };

const options = {
  indexAxis: 'y',
    plugins: {
      tooltip: {
        callbacks: {
          label: context => {
            const tool = toolsData[context.dataIndex];
            if (context.dataset.label === 'Utilization (%)') {
              return `Utilization: ${tool.utilizationRate}%`;
            } else {
              return `Downtime: ${tool.downtime} hrs`;
            }
          },
        },
      },
    },
  scales: {
    x: {
      stacked: true,
      title: { display: true, text: 'Time (%)' },
      max: 100,
    },
    y: {
      stacked: true,
      ticks: {
        autoSkip: false,
      },
    },
  },
};


  return (
    <div className="utilization-chart-container">
      <h2>Utilization Rate and Downtime of Tools/Equipment</h2>

      <div className="filters">
        <select value={toolFilter} onChange={e => setToolFilter(e.target.value)}>
          <option value="ALL">All Tools</option>
          {/* have to add actual tools dynamic */}
        </select>

        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
          <option value="ALL">All Projects</option>
          {/* need to add actual projects dynamically */}
        </select>

        <DatePicker selected={startDate} onChange={setStartDate} placeholderText="From Date" />
        <DatePicker selected={endDate} onChange={setEndDate} placeholderText="To Date" />

        <button type="button" onClick={handleApplyClick}>
          Apply
        </button>
      </div>

      {error ? <p>{error}</p> : <Bar data={chartData} options={options} />}
    </div>
  );
}

export default UtilizationChart;
