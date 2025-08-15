import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import axios from 'axios';
import './TotalMaterialCostPerProject.css';
import { ENDPOINTS } from '~/utils/URL';
import Loading from '~/components/common/Loading';

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const allDemoProjects = [
  { label: 'Project 1', value: '1' },
  { label: 'Project 2', value: '2' },
  { label: 'Project 3', value: '3' },
  { label: 'Project 4', value: '4' },
  { label: 'Project 5', value: '5' },
  { label: 'Project 6', value: '6' },
  { label: 'Project 7', value: '7' },
  { label: 'Project 8', value: '8' },
];

const projectDemoCosts = {
  '1': 1200,
  '2': 2500,
  '3': 1800,
  '4': 900,
  '5': 3424,
  '6': 5433,
  '7': 454,
  '8': 876,
};

function TotalMaterialCostPerProject() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [projectCosts, setProjectCosts] = useState({});
  const [selectedProjects, setSelectedProjects] = useState([]);
  const darkMode = useSelector(state => state.theme.darkMode);
  const textColor = darkMode ? '#ffffff' : '#666';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: textColor,
          font: {
            size: 11,
          },
          callback(val) {
            // eslint-disable-next-line react/no-this-in-sfc
            const label = this.getLabelForValue(val);
            return label.length > 20 ? `${label.slice(0, 20)}…` : label;
          },
        },
      },
      y: {
        grid: { color: '#ccc' },
        ticks: {
          color: textColor,
        },
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      setDataLoaded(false);
      try {
        const projectsResponse = await axios.get(ENDPOINTS.BM_PROJECTS_LIST_FOR_MATERIALS_COST);
        if (projectsResponse.status < 200 || projectsResponse.status >= 300) {
          throw new Error(
            `API request to get projects list failed with status ${projectsResponse.status}`,
          );
        }
        const projectsFilteredData = projectsResponse.data.map(project => ({
          value: project.projectId,
          label: project.projectName,
        }));
        setSelectedProjects(projectsFilteredData);
        setAllProjects(projectsFilteredData);

        const costResponse = await axios.get(ENDPOINTS.BM_PROJECT_MATERIALS_COST);
        if (costResponse.status < 200 || costResponse.status >= 300) {
          throw new Error(
            `API request to get material cost failed with status ${costResponse.status}`,
          );
        }
        const projectCostsData = costResponse.data.reduce((acc, item) => {
          acc[item.projectId] = item.totalCostK;
          return acc;
        }, {});
        setProjectCosts(projectCostsData);
      } catch (error) {
        toast.error(`Error fetching data: ${error.message}`);
        // Fall back to mock data if API is unavailable
        toast.error('Using mock data as fallback');
        setSelectedProjects(allDemoProjects);
        setAllProjects(allDemoProjects);
        setProjectCosts(projectDemoCosts);
      } finally {
        setDataLoaded(true);
      }
    };
    fetchData();
  }, []);

  const data = useMemo(() => {
    return {
      labels: selectedProjects.map(p => p.label),
      datasets: [
        {
          label: 'Total Material Cost (*1000$)',
          data: selectedProjects.map(p => projectCosts[p.value]),
          backgroundColor: 'rgb(23, 154, 197)',
          borderRadius: 10,
        },
      ],
    };
  }, [selectedProjects, projectCosts]);

  return (
    <div className={`total-material-cost-per-project ${darkMode ? 'dark-mode' : ''}`}>
      <h2 className="total-material-cost-per-project-chart-title">
        Total Material Cost Per Project
      </h2>
      {dataLoaded ? (
        <>
          <div data-testid="select-projects-dropdown">
            <Select
              isMulti
              isSearchable
              options={allProjects}
              value={selectedProjects}
              onChange={setSelectedProjects}
              className="material-cost-per-project-dropdown basic-multi-select"
              classNamePrefix="select"
              defaultValue={allProjects}
              placeholder="Select Projects"
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: `${selectedProjects.length * 20}px`, minHeight: '300px' }}>
              <Bar data={data} options={options} />
            </div>
          </div>
        </>
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100vh">
            <Loading />
          </div>
        </div>
      )}
    </div>
  );
}

export default TotalMaterialCostPerProject;
