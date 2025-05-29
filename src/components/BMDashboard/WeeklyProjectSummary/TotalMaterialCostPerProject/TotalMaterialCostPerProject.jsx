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
import './TotalMaterialCostPerProject.css';

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const allProjects = [
  { label: 'Website Redesign', value: '1' },
  { label: 'Mobile App', value: '2' },
  { label: 'API Development', value: '3' },
  { label: 'Marketing Campaign', value: '4' },
];

const projectCosts = {
  '1': 1200,
  '2': 2500,
  '3': 1800,
  '4': 900,
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
};

function TotalMaterialCostPerProject() {
  const [selectedProjects, setSelectedProjects] = useState(allProjects);

  const data = {
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

  return (
    <div className="total-material-cost-per-project">
      <h2 className="total-material-cost-per-project-chart-title">
        Total Material Cost Per Project
      </h2>
      <Select
        isMulti
        isSearchable
        options={allProjects}
        value={selectedProjects}
        onChange={setSelectedProjects}
        className="basic-multi-select"
        classNamePrefix="select"
        defaultValue={allProjects}
        placeholder="All Projects"
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
      />
      <Bar data={data} options={options} />
    </div>
  );
}

export default TotalMaterialCostPerProject;
