import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from '../styles/RadarChart.module.css';
import { useSelector } from 'react-redux';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Define skill mappings: label -> data source
const SKILL_MAPPINGS = [
  { label: 'Leadership Exp', value: g => g.leadership_experience },
  { label: 'Leadership Skills', value: g => g.leadership_skills },
  { label: 'Frontend & Backend Overall', value: g => g.combined_frontend_backend },
  { label: 'MERN Stack', value: g => g.mern_skills },

  { label: 'Frontend', value: f => f.overall },
  { label: 'Figma', value: f => f.UIUXTools },
  { label: 'Responsive UI', value: f => f.ResponsiveUI },
  { label: 'HTML Semantics', value: f => f.HTML },
  { label: 'Bootstrap', value: f => f.Bootstrap },
  { label: 'CSS Advanced', value: f => f.CSS },
  { label: 'React Advanced', value: f => f.React },
  { label: 'Redux', value: f => f.Redux },
  { label: 'Documentation', value: f => f.Documentation },
  { label: 'Web Sockets', value: f => f.WebSocketCom },
  { label: 'Testing', value: f => f.UnitTest },

  { label: 'Backend', value: b => b.Overall },
  { label: 'TDD', value: b => b.TestDrivenDev },
  { label: 'Database', value: b => b.Database },
  { label: 'MongoDB', value: b => b.MongoDB },
  { label: 'MongoDB Advanced', value: b => b.MongoDB_Advanced },
  { label: 'Deployment', value: b => b.Deployment },
  { label: 'Version Control', value: b => b.VersionControl },
  { label: 'Code Review', value: b => b.CodeReview },
  { label: 'Env Setup', value: b => b.EnvironmentSetup },
  { label: 'Advanced Coding', value: b => b.AdvancedCoding },
  { label: 'Agile', value: b => b.AgileDevelopment },
];

function RadarChart({ profileData }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const general = skillInfo.general || {};
  const frontend = skillInfo.frontend || {};
  const backend = skillInfo.backend || {};

  // Generate chart data dynamically
  const chartData = {
    labels: SKILL_MAPPINGS.map(skill => skill.label),
    datasets: [
      {
        label: 'Skills',
        data: SKILL_MAPPINGS.map(skill => {
          const source = skill.value(general) ?? skill.value(frontend) ?? skill.value(backend) ?? 0;
          return source;
        }),
        backgroundColor: darkMode ? 'rgba(37, 98, 240, 0.2)' : 'rgba(255, 99, 132, 0.2)',
        borderColor: darkMode ? 'rgba(37, 98, 240, 1)' : 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: darkMode ? 'gray' : 'lightgray',
        },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: { stepSize: 2 },
        pointLabels: { color: darkMode ? 'white' : 'black' },
        grid: { color: darkMode ? 'gray' : 'lightgray' },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: 'bottom',
      },
    },
  };

  return (
    <div className={`${styles.radarChart}`}>
      <Radar data={chartData} options={chartOptions} />
    </div>
  );
}

export default RadarChart;
