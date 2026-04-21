/* eslint-disable */ /* prettier-ignore */
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title } from 'chart.js';
import axios from 'axios';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

import { ENDPOINTS } from '../../../utils/URL';
import styles from './LessonsLearntChart.module.css';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const useLessonsData = (selectedProjects, startDate, endDate) => {
  const [allProjects, setAllProjects] = useState([]);
  const [lessonsData, setLessonsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(ENDPOINTS.BM_PROJECTS);
        const projects = Array.isArray(response.data) ? response.data : [];
        setAllProjects(projects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setAllProjects([]);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {};

        if (selectedProjects && selectedProjects.length > 0) {
          params.projectId = selectedProjects.length === 1 ? selectedProjects[0].value : 'ALL';
        }

        if (startDate) {
          params.startDate = startDate.toISOString();
        }
        if (endDate) {
          params.endDate = endDate.toISOString();
        }

        const response = await axios.get(`${ENDPOINTS.BM_LESSONS}-learnt`, { params });

        const responseData = response.data?.data || response.data || [];
        const lessonsArray = Array.isArray(responseData) ? responseData : [];

        const transformedData = lessonsArray.map(item => ({
          projectName: item.project || 'Unknown Project',
          projectId: item.projectId,
          lessonsCount: item.lessonsCount || 0,
          percentage:
            parseFloat((item.changePercentage || '0%').replace('%', '').replace('+', '')) || 0,
          changePercentage: item.changePercentage || '0%',
        }));

        setLessonsData(transformedData);
      } catch (err) {
        console.error('Error fetching lessons learnt:', err);
        setError(err.message || 'Failed to fetch lessons data');
        setLessonsData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLessons();
  }, [selectedProjects, startDate, endDate]);

  return { allProjects, lessonsData, isLoading, error };
};

function ChartTitle({ title }) {
  return <h2 className={styles.chartTitle}>{title}</h2>;
}

const LessonsLearntChart = () => {
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { allProjects, lessonsData, isLoading, error } = useLessonsData(
    selectedProjects,
    startDate,
    endDate,
  );

  const handleProjectChange = selected => {
    setSelectedProjects(selected || []);
  };

  const projectOptions = Array.isArray(allProjects)
    ? allProjects
        .filter(proj => proj && (proj._id || proj.id))
        .map(proj => ({
          value: proj._id || proj.id,
          label: proj.name || 'Unnamed Project',
        }))
    : [];

  const safeLabels = Array.isArray(lessonsData)
    ? lessonsData.map(d => d?.projectName || 'Unknown')
    : [];

  const safeData = Array.isArray(lessonsData) ? lessonsData.map(d => d?.lessonsCount || 0) : [];

  const chartData = {
    labels: safeLabels,
    datasets: [
      {
        label: 'Lessons Count',
        data: safeData,
        backgroundColor: '#10b981',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterLabel: context => {
            const dataIndex = context.dataIndex;
            if (Array.isArray(lessonsData) && lessonsData[dataIndex]) {
              return `Change: ${lessonsData[dataIndex].changePercentage || '0%'}`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <ChartTitle title="Lessons Learnt" />

      <div className={styles.filterRow}>
        <div className={styles.filter}>
          <label>Select Projects</label>
          <Select
            isMulti
            options={projectOptions}
            value={selectedProjects}
            onChange={handleProjectChange}
            placeholder="Select projects..."
            isClearable
          />
        </div>
        <div className={styles.filter}>
          <label>From</label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            placeholderText="Start date"
            isClearable
          />
        </div>
        <div className={styles.filter}>
          <label>To</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            placeholderText="End date"
            isClearable
          />
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error loading data: {error}</p>
        ) : !Array.isArray(lessonsData) || lessonsData.length === 0 ? (
          <p>No lessons data available for the selected criteria</p>
        ) : (
          <>
            <div style={{ height: '400px', width: '100%' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className={styles.percentageLabels}>
              {lessonsData.map((d, idx) => (
                <span
                  key={d?.projectId || idx}
                  className={styles.percentageLabel}
                  style={{
                    left: `${(idx + 0.5) * (100 / lessonsData.length)}%`,
                  }}
                >
                  {d?.changePercentage || '0%'}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonsLearntChart;
