import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { MultiSelect } from 'react-multi-select-component';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
// import axios from 'axios';
import './TotalMaterialCostPerProject.css';
import { useSelector } from 'react-redux';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function TotalMaterialCostPerProject() {
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [chartData, setChartData] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);
  // const [totalCost, setTotalCost] = useState(0);
  const [setTotalCost] = useState(0);
  // const [loading, setLoading] = useState(false);
  const [loading] = useState(false); // set to false because using dummy
  // const [error, setError] = useState(null);
  const [error] = useState(null);

  useEffect(() => {
    // API fetch logic (commented out for now)
    /*
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/material-costs');

        if (response.data && response.data.length > 0) {
          setProjects(response.data);
          setSelectedProjects(response.data.map(p => p.name)); // Select all by default
        } else {
          setProjects([]);
        }
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    */

    // Using dummy data for now
    const dummyData = [
      { name: 'Project A', cost: 120 },
      { name: 'Project B', cost: 95 },
      { name: 'Project C', cost: 150 },
      { name: 'Project D', cost: 60 },
    ];

    setProjects(dummyData);
    setSelectedProjects(dummyData.map(p => p.name)); // Select all by default
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      const filteredData = projects.filter(p => selectedProjects.includes(p.name));

      setChartData({
        labels: filteredData.map(p => p.name),
        datasets: [
          {
            label: 'Total Material Cost ($1000s)',
            data: filteredData.map(p => p.cost),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderRadius: 10,
          },
        ],
      });

      const total = filteredData.reduce((acc, p) => acc + p.cost, 0);
      setTotalCost(total);
    }
  }, [projects, selectedProjects]);

  const options = projects.map(p => ({ label: p.name, value: p.name }));

  return (
    <div className={`chart-container ${darkMode ? 'dark-mode' : ''}`}>
      <h2 className="chart-title">Total Material Cost Per Project</h2>
      <div className="filter-container">
        <label htmlFor="project-select" className="filter-label">
          Select Projects:
        </label>
        <MultiSelect
          options={options}
          value={options.filter(opt => selectedProjects.includes(opt.value))}
          onChange={selected => setSelectedProjects(selected.map(s => s.value))}
          labelledBy="Select Projects"
          overrideStrings={{
            selectSomeItems: 'Select Projects',
            allItemsAreSelected: 'All Projects Selected',
          }}
          hasSelectAll={false}
          className="dropdown"
        />
      </div>
      <div className="date-compact">
        <div className="date-label">Dates</div>
        <div className="date-value">ALL</div>
      </div>
      {loading && <p className="loading-text">Loading data</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && !chartData && <p className="no-data-text">No data available</p>}
      {!loading && !error && chartData && (
        <div className="chart-wrapper">
          <Bar data={chartData} />
        </div>
      )}
    </div>
  );
}

export default TotalMaterialCostPerProject;
