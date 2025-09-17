/* eslint-disable */ /* prettier-ignore */
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title } from 'chart.js';
import axios from 'axios';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

import styles from './LessonsLearntChart.module.css';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const useLessonsData = (selectedProjects, startDate, endDate) => {
  const [allProjects, setAllProjects] = useState([]);
  const [lessonsData, setLessonsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects');
        setAllProjects(response.data);
      } catch (error) {}
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      try {
        const params = {
          projects: selectedProjects.map(p => p.value).join(','),
          from: startDate?.toISOString(),
          to: endDate?.toISOString(),
        };
        const response = await axios.get('/api/lessons-learnt', { params });
        setLessonsData(response.data);
      } catch (error) {
        setLessonsData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLessons();
  }, [selectedProjects, startDate, endDate]);

  return { allProjects, lessonsData, isLoading };
};

function ChartTitle({ title }) {
  return <h2 className={styles.chartTitle}>{title}</h2>;
}

const LessonsLearntChart = () => {
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { allProjects, lessonsData, isLoading } = useLessonsData(
    selectedProjects,
    startDate,
    endDate,
  );

  const handleProjectChange = selected => {
    setSelectedProjects(selected || []);
  };

  const chartData = {
    labels: lessonsData.map(d => d.projectName),
    datasets: [
      {
        label: 'Lessons Learnt',
        data: lessonsData.map(d => d.percentage),
        backgroundColor: '#10b981',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: false,
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
            options={allProjects.map(proj => ({
              value: proj.id,
              label: proj.name,
            }))}
            value={selectedProjects}
            onChange={handleProjectChange}
          />
        </div>
        <div className={styles.filter}>
          <label>From</label>
          <DatePicker selected={startDate} onChange={date => setStartDate(date)} />
        </div>
        <div className={styles.filter}>
          <label>To</label>
          <DatePicker selected={endDate} onChange={date => setEndDate(date)} />
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {isLoading ? (
          <p>Loading...</p>
        ) : lessonsData.length === 0 ? (
          <p>No lessons data available for the selected criteria</p>
        ) : (
          <>
            <Bar data={chartData} options={chartOptions} />
            <div className={styles.percentageLabels}>
              {lessonsData.map((d, idx) => (
                <span
                  key={idx}
                  className={styles.percentageLabel}
                  style={{
                    left:
                      lessonsData.length > 0
                        ? `${(idx + 0.5) * (100 / lessonsData.length)}%`
                        : '0%',
                  }}
                >
                  {d.percentage}%
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
