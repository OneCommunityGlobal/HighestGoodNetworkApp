import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title} from 'chart.js';
import axios from 'axios';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './LessonsLearntChart.css';

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
      } catch (error) {
      }
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
  return <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h2>;
};

function Filters({
  allProjects,
  selectedProjects,
  setSelectedProjects,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) {
  return (
    <div className="filter-row">
      <div className="filter">
        <label>Project:</label>
        <Select
          options={allProjects?.map(p => ({ label: p.name, value: p.id })) || []}
          isMulti
          placeholder="All"
          onChange={setSelectedProjects}
        />
      </div>
      <div className="filter">
        <label>From:</label>
        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
        />
      </div>
      <div className="filter">
        <label>To:</label>
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText="End Date"
        />
      </div>
    </div>
  );
}

const PercentageLabels = ({ data }) => {
  return (
    <div className="percentage-labels">
      {data?.map((item) => (
        <div
          key={item.id || item.name} // use a stable, unique identifier
          className="percentage-label"
          style={{ left: `${(data.indexOf(item) + 0.5) * (100 / data.length)}%` }}
        >
          {item.trend > 0 ? `+${item.trend}%` : `${item.trend}%`}
        </div>
      ))}
    </div>
  );
};

const LessonsBarChart = ({ data, isLoading }) => {
  const chartData = {
    labels: data?.map(item => item.project) || [],
    datasets: [
      {
        label: 'No. of Lessons Learnt',
        data: data?.map(item => item.count) || [],
        backgroundColor: '#4F46E5',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: () => 'Click to view the Tags',
        },
      },
    },
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const project = chartData.labels[index];
        window.location.href = `/project-issues/${project}`;
      }
    },
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="chart-wrapper">
      <Bar data={chartData} options={chartOptions} />
      <PercentageLabels data={data} />
    </div>
  );
};

const LessonsLearntChart = () => {
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { allProjects, lessonsData, isLoading } = useLessonsData(
    selectedProjects,
    startDate,
    endDate
  );

  return (
    <div className="chart-container">
      <ChartTitle title="Lessons Learnt" />
      <Filters
        allProjects={allProjects}
        selectedProjects={selectedProjects}
        setSelectedProjects={setSelectedProjects}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      <LessonsBarChart data={lessonsData} isLoading={isLoading} />
    </div>
  );
};

export default LessonsLearntChart;
