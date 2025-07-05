import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import './ProjectStatus.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function DonutChart() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setDateError] = useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const dummyData = {
    totalProjects: 426,
    activeProjects: 265,
    completedProjects: 127,
    delayedProjects: 34,
    percentages: {
      active: 62.2,
      completed: 29.8,
      delayed: 8.0,
    },
  };

  // Fetch data from backend
  const fetchDataFromBackend = async () => {
    setIsSubmitting(true);
    setError(null);

    const requestData = { startDate, endDate };
    // eslint-disable-next-line no-console
    console.log('Data sent to backend:', requestData);
    try {
      const response = await axios.post('/your-backend-endpoint', requestData);
      if (response.data) {
        setChartData(response.data);
      } else {
        setChartData(dummyData);
      }
    } catch (err) {
      setError('Failed to fetch data from backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setChartData(dummyData);
  }, []);

  const validateDates = () => {
    if (startDate && endDate && endDate <= startDate) {
      setDateError(true);
      setTimeout(() => {
        // eslint-disable-next-line no-alert
        alert('End date must be later than start date');
      }, 0);
      return false;
    }
    setDateError(false);
    return true;
  };

  const handleApplyClick = () => {
    if (validateDates()) {
      fetchDataFromBackend();
    }
  };

  if (isSubmitting) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  if (loading) return 'Loading...';
  if (error) return <p>{error}</p>;

  const data = {
    labels: ['Active Projects', 'Completed Projects', 'Delayed Projects'],
    datasets: [
      {
        data: [chartData?.activeProjects, chartData?.completedProjects, chartData?.delayedProjects],
        backgroundColor: ['#c59cff', '#a0e7e5', '#ffadad'],
        hoverOffset: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
      datalabels: {
        color: '#000',
        font: { size: 14 },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          const percentage = chartData?.percentages[label.toLowerCase().split(' ')[0]] || 0;
          return `${label}\n${percentage}%`;
        },
        anchor: 'end',
        align: 'end',
        offset: 10,
      },
    },
    layout: {
      padding: {
        top: 120,
        bottom: 120,
        left: 150,
        right: 150,
      },
    },
    cutout: '75%',
  };

  return (
    <div className="donut-chart-container">
      <div className="header">
        <h2>PROJECT STATUS</h2>
        <div className="date-picker-container">
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="From Date"
            className="date-picker"
            popperPlacement="bottom-start"
            popperModifiers={{
              preventOverflow: {
                enabled: true,
                boundariesElement: 'viewport',
              },
            }}
          />
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            placeholderText="To Date"
            className="date-picker"
            popperPlacement="bottom-start"
            popperModifiers={{
              preventOverflow: {
                enabled: true,
                boundariesElement: 'viewport',
              },
            }}
          />
          <button type="button" className="apply-button" onClick={handleApplyClick}>
            Apply
          </button>
        </div>
      </div>

      <div className="content">
        <div className="donut-chart-section">
          <Doughnut data={data} options={options} />
          <div className="total-projects">
            <p>Total Projects</p>
            <p>{chartData?.totalProjects}</p>
          </div>
        </div>

        <div className="project-counts">
          <p>{formattedDate}</p>
          <div className="project-details">
            {[
              { label: 'ACTIVE PROJECTS', value: chartData?.activeProjects },
              { label: 'COMPLETED PROJECTS', value: chartData?.completedProjects },
              { label: 'DELAYED PROJECTS', value: chartData?.delayedProjects },
            ].map(item => (
              <div key={item.label} className="project-item">
                <div>
                  {item.label.split(' ').map(word => (
                    <p key={word} className="project-label">
                      {word}
                    </p>
                  ))}
                </div>
                <p className="project-value">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonutChart;
