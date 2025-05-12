import { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { Line } from 'react-chartjs-2';

export default function RentalChart() {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]= useState(null);
  const [chartType, setChartType] = useState('cost');

  useEffect(() => {
    const fetchRentalData = async() => {
      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.BM_RENTAL_CHART);
        if (response.data.success) {
          const { data } = response.data;
          console.log(data);
          // transform the data for Chart.js
          const transformedData = {
            labels: data.map(item => item.date),
            datasets: [
              {label: chartType === 'percentage'
                ? 'Percentage of Total Materials'
                : 'Total Rental Cost',
                data: data.map(item => item.value),
                borderColor: 'rgb(53, 162, 235)',
                tension: 0.4,
                fill: false,
                datalabels: {
                  align: 'top',
                  anchor: 'end',
                  formatter: (value) => chartType === 'percentage'
                    ? `${value}`
                    : `$${value}`
                }
              }
            ]
          };
          setChartData(transformedData);
        } else {
          // replace with toast error
          console.log("failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching rental data:", err.message);
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchRentalData();
  }, [chartType]);
  
  const options = {
    response: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Rental Costs Over Time',
        font: {
          size: 18
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += chartType === 'percentage'
              ? `${context.parsed.y}%`
              : `$${context.parsed.y}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: chartType === 'percentage'
            ? 'Percentage of Total Materials Cost(%)'
            : 'Total Rental Cost($)'
        }
      }
    }
  };
  
  const handleTypeChange = (e) => {
    setChartType(e.target.value);
  }

  function LineChart() {
    return <Line data={data} options={options} />;
  }

  return (
    <div className = "rental-container">
      <div className = "chart-controls">
        <label htmlFor="chart-type">Display: </label>
        <select 
          id="chart-type"
          value={chartType}
          onChange={handleTypeChange}
        >
          <option value="cost">Total Rental Cost</option>
          <option value="percentage">% of Materials Cost</option>
        </select>
      </div>
      <div className='chart-wrapper'>
        {loading ? (
          <div className="loading">Loading Chart Data....</div>
        ) : error ? (
          <div className="error">{error} </div>
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
