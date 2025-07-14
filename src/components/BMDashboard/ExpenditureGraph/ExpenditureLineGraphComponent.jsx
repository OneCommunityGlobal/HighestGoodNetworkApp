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

  // fetch data on component mount
  useEffect(() => {
    const fetchExpenditureData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.BM_EXPENDITURE);
        if (response.data.success) {
          setExpenditureData(response.data.data);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenditureData();

    // Clean up
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  // total expenditure by month - simplified
  const processDataForChart = datas => {
    // Group by month and sum all expenditures
    const monthlyTotals = {};

    datas.forEach(item => {
      const date = new Date(item.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = 0;
      }

      // add to monthly total
      monthlyTotals[monthYear] += item.amount || item.cost || 0;
    });

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

    const labels = Object.keys(monthlyTotals).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');

      if (yearA !== yearB) {
        return parseInt(yearA, 10) - parseInt(yearB, 10);
      }
      return months.indexOf(monthA) - months.indexOf(monthB);
    });

    const data = labels.map(month => monthlyTotals[month]);

    return {
      labels,
      datasets: [
        {
          label: 'Total Expenditure',
          data,
          borderColor: '#6293CC',
          backgroundColor: 'rgba(98, 147, 204, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.2,
          pointBackgroundColor: '#6293CC',
        },
      ],
    };
  };

  // create/update chart
  useEffect(() => {
    if (!loading && !error && expenditureData.length > 0 && chartRef.current) {
      const chartData = processDataForChart(expenditureData);

      if (chartInstance) {
        chartInstance.data = chartData;
        chartInstance.update();
      } else {
        const ctx = chartRef.current.getContext('2d');
        const newChart = new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: 'Monthly Expenditure',
                font: {
                  size: 12,
                  weight: 'bold',
                },
                padding: {
                  top: 5,
                  bottom: 10,
                },
                color: '#333',
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label(context) {
                    return `$${context.parsed.y.toLocaleString()}`;
                  },
                },
              },
            },
            scales: {
              y: {
                display: true,
                beginAtZero: true,
                ticks: {
                  font: { size: 9 },
                  callback(value) {
                    if (value >= 1000) {
                      return `$${value / 1000}k`;
                    }
                    return `$${value}`;
                  },
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                  drawBorder: true,
                },
                title: {
                  display: true,
                  text: '',
                  font: { size: 10 },
                },
              },
              x: {
                display: true,
                ticks: {
                  font: { size: 9 },
                  maxRotation: 45,
                  minRotation: 45,
                },
                grid: {
                  display: false,
                },
                title: {
                  display: true,
                  text: '',
                  font: { size: 10 },
                },
              },
            },
            elements: {
              point: {
                radius: 3,
                hoverRadius: 5,
              },
              line: {
                borderWidth: 2,
              },
            },
            layout: {
              padding: {
                left: 10,
                right: 10,
                top: 5,
                bottom: 10,
              },
            },
          },
        });

        setChartInstance(newChart);
      }
    }
  }, [loading, error, expenditureData]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '120px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
