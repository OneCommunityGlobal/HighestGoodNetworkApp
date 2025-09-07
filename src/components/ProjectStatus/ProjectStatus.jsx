import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useSelector } from 'react-redux';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function DonutChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
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
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '200px' }}
      >
        <div className="spinner-border text-primary" role="status" />
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
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          boxWidth: 20,
          padding: 15,
          color: darkMode ? '#fff' : '#666',
          font: {
            size: 14,
          },
        },
      },
      datalabels: {
        color: darkMode ? '#fff' : '#000',
        font: {
          size: 14,
          weight: 'bold',
        },
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
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    cutout: '65%',
  };

  return (
    <div className={` ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>
      <div className={`container-fluid py-4 h-100 ${darkMode ? 'text-light' : ''}`}>
        <div className="row mb-4 align-items-center">
          <div className="col-md-6">
            <h2 className={`mb-3 ${darkMode ? 'text-light' : ''}`}>PROJECT STATUS</h2>
          </div>
          <div className="col-md-6">
            <div
              className={`d-flex gap-2 align-items-center justify-content-md-end ${
                darkMode ? 'text-light' : ''
              }`}
            >
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                placeholderText="From Date"
                className={`form-control ${darkMode ? 'bg-secondary text-light border-dark' : ''}`}
                popperPlacement="bottom-start"
                wrapperClassName={darkMode ? 'dark-datepicker' : ''}
              />
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                placeholderText="To Date"
                className={`form-control ${darkMode ? 'bg-secondary text-light border-dark' : ''}`}
                popperPlacement="bottom-start"
                wrapperClassName={darkMode ? 'dark-datepicker' : ''}
              />
              <button type="button" className="btn btn-primary" onClick={handleApplyClick}>
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-9 align-items-center">
            {/* chart */}
            <div className="row w-full position-relative flex-grow-1">
              <Doughnut data={data} options={options} style={{ width: '90%', height: '90%' }} />
            </div>
            <div
              className="row w-full text-center mt-3 mt-md-0 ms-md-4"
              style={{ pointerEvents: 'none' }}
            >
              <p className={`mb-1 ${darkMode ? 'text-light' : ''}`} style={{ fontSize: '1.5rem' }}>
                Total Projects:
                <b>{chartData?.totalProjects}</b>
              </p>
            </div>
          </div>

          <div className="col-md-3 mt-4 mt-md-0">
            {/* Chart Info */}
            <div className="mb-3 text-right">
              <span className={darkMode ? 'text-light' : 'text-muted'}>{formattedDate}</span>
            </div>
            <div>
              {[
                { label: 'ACTIVE PROJECTS', value: chartData?.activeProjects },
                { label: 'COMPLETED PROJECTS', value: chartData?.completedProjects },
                { label: 'DELAYED PROJECTS', value: chartData?.delayedProjects },
              ].map(item => (
                <div key={item.label} className="mb-3">
                  <div
                    className={`card shadow-sm ${
                      darkMode ? 'bg-dark text-light border-secondary' : ''
                    }`}
                  >
                    <div
                      className={`card-body d-flex justify-content-between align-items-center ${
                        darkMode ? 'bg-yinmn-blue' : ''
                      }`}
                    >
                      <div>
                        {item.label.split(' ').map(word => (
                          <span
                            key={word}
                            className={`d-block text-uppercase small ${
                              darkMode ? 'text-light' : 'text-secondary'
                            }`}
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                      <span className={`fs-4 fw-bold ${darkMode ? 'text-light' : ''}`}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonutChart;
