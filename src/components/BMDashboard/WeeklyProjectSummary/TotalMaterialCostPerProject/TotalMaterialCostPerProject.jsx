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
import styles from './TotalMaterialCostPerProject.module.css';
import { ENDPOINTS } from '~/utils/URL';
import Loading from '~/components/common/Loading';

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
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: textColor,
          font: { size: 11 },
          callback(val) {
            const label = this.getLabelForValue(val);
            return label.length > 20 ? `${label.slice(0, 20)}…` : label;
          },
        },
      },
      y: {
        grid: { color: '#ccc' },
        ticks: { color: textColor },
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      setDataLoaded(false);
      try {
        const projectsResponse = await axios.get(ENDPOINTS.BM_PROJECTS);
        if (projectsResponse.status < 200 || projectsResponse.status >= 300) {
          throw new Error(
            `API request to get projects list failed with status ${projectsResponse.status}`,
          );
        }
        const projectsFilteredData = projectsResponse.data.map(project => ({
          value: project._id,
          label: project.name,
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
          acc[item.project] = item.totalCostK;
          return acc;
        }, {});
        setProjectCosts(projectCostsData);
      } catch (error) {
        toast.error(`Error fetching data: ${error.message}`);
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

  const data = useMemo(
    () => ({
      labels: selectedProjects.map(p => p.label),
      datasets: [
        {
          label: 'Total Material Cost (*1000$)',
          data: selectedProjects.map(p => projectCosts[p.value]),
          backgroundColor: 'rgb(23, 154, 197)',
          borderRadius: 10,
        },
      ],
    }),
    [selectedProjects, projectCosts],
  );

  const selectStyles = useMemo(
    () => ({
      control: base => ({
        ...base,
        backgroundColor: darkMode ? '#22272e' : '#fff',
        borderColor: darkMode ? '#375071' : '#ccc',
        color: darkMode ? '#fff' : '#232323',
        minHeight: 38,
        boxShadow: 'none',
        borderRadius: 8,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      }),
      menu: base => ({
        ...base,
        backgroundColor: darkMode ? '#22272e' : '#fff',
        fontSize: 12,
        zIndex: 10001,
        borderRadius: 8,
        marginTop: 2,
        color: darkMode ? '#fff' : '#232323',
      }),
      menuList: base => ({
        ...base,
        maxHeight: 400,
        overflowY: 'auto',
        backgroundColor: darkMode ? '#22272e' : '#fff',
        color: darkMode ? '#fff' : '#232323',
        padding: 0,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? '#0d55b3'
          : state.isFocused
          ? '#0d55b3'
          : darkMode
          ? '#22272e'
          : '#fff',
        color: state.isSelected ? '#fff' : darkMode ? '#fff' : '#232323',
        fontSize: 13,
        padding: '10px 16px',
        cursor: 'pointer',
      }),
      multiValue: base => ({
        ...base,
        backgroundColor: darkMode ? '#375071' : '#e2e7ee',
        borderRadius: 6,
        fontSize: 12,
        marginRight: 4,
        maxWidth: 'none',
        flexShrink: 0,
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#fff' : '#333',
        fontSize: 12,
        padding: '2px 6px',
      }),
      multiValueRemove: base => ({
        ...base,
        color: darkMode ? '#fff' : '#333',
        ':hover': {
          backgroundColor: darkMode ? '#0d55b3' : '#e2e7ee',
          color: '#fff',
        },
        borderRadius: 4,
        padding: 2,
      }),
      valueContainer: provided => ({
        ...provided,
        overflowX: 'auto',
        flexWrap: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        position: 'relative',
        scrollbarWidth: 'thin',
      }),
    }),
    [darkMode],
  );

  return (
    <div style={{ maxWidth: '300px', minWidth: '200px' }}>
      <div className={styles.totalMaterialCostPerProjectChartTitle}>
        Total Material Cost Per Project
      </div>
      {dataLoaded ? (
        <>
          <div data-testid="select-projects-dropdown">
            <Select
              isMulti
              isSearchable
              options={allProjects}
              value={selectedProjects}
              onChange={setSelectedProjects}
              classNamePrefix="select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
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
