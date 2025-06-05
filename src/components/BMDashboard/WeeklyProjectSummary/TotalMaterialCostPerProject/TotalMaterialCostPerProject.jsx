import { useState } from 'react';
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
import { useEffect } from 'react';
import { useMemo } from 'react';
import { ENDPOINTS } from 'utils/URL';

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const allDemoProjects = [
  { label: 'Website Redesign', value: '1' },
  { label: 'Mobile App', value: '2' },
  { label: 'API Development Marketing Campaign Marketing Campaign', value: '3' },
  { label: 'Marketing Campaign', value: '4' },
  { label: 'Website', value: '5' },
  { label: 'Mobile', value: '6' },
  { label: 'API', value: '7' },
  { label: 'Marketing', value: '8' },
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

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 11,
        },
        callback(val) {
          const label = this.getLabelForValue(val);
          return label.length > 20 ? `${label.slice(0, 20)}…` : label;
        },
      },
    },
  },
};

function TotalMaterialCostPerProject() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [projectCosts, setProjectCosts] = useState({});
  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setDataLoaded(false);
      try {
        axios.get(ENDPOINTS.BM_PROJECTS_LIST_FOR_MATERIALS_COST).then(res => {
          // eslint-disable-next-line no-console
          console.log(res.data);
          const projectsFilteredData = res.data.map(project => ({
            value: project.projectId,
            label: project.projectName,
          }));
          // eslint-disable-next-line no-console
          console.log(projectsFilteredData);
          setSelectedProjects(projectsFilteredData);
          setAllProjects(projectsFilteredData);
        });
        axios.get(ENDPOINTS.BM_PROJECT_MATERIALS_COST).then(res => {
          const projectCostsData = res.data.reduce((acc, item) => {
            acc[item.projectId] = item.totalCostK;
            return acc;
          }, {});
          // eslint-disable-next-line no-console
          console.log(projectCostsData);
          setProjectCosts(projectCostsData);
        });
      } catch (error) {
        toast.info('Error fetching data:', error);
        // Fall back to mock data if API is unavailable
        toast.info('Using mock data as fallback');
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
          backgroundColor: 'rgba(20, 137, 175, 1)',
          borderRadius: 10,
        },
      ],
    };
  }, [selectedProjects, projectCosts]);

  return (
    <div className="total-material-cost-per-project">
      <h2 className="total-material-cost-per-project-chart-title">
        Total Material Cost Per Project
      </h2>
      {dataLoaded ? (
        <>
          <Select
            isMulti
            isSearchable
            options={allProjects}
            value={selectedProjects}
            onChange={setSelectedProjects}
            className="basic-multi-select"
            classNamePrefix="select"
            defaultValue={allProjects}
            placeholder="Select Projects"
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
          />
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: `${selectedProjects.length * 20}px`, minHeight: '300px' }}>
              <Bar data={data} options={options} />
            </div>
          </div>
        </>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default TotalMaterialCostPerProject;
