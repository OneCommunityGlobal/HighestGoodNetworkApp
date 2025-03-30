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
import '../styles/RadarChart.css';

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function RadarChart() {
  const data = {
    labels: [
      'Leadership Exp',
      'Leadership Skills',
      'Frontend & Backend Overall',
      'Figma',
      'Responsive UI',
      'HTML Semantics',
      'Bootstrap',
      'CSS Advanced',
      'React Advanced',
      'Redux',
      'Web Sockets',
      'Frontend',
      'Backend',
      'MERN Stack',
      'TDD Backend',
      'Database',
      'Testing',
      'Deployment',
      'Version Control',
      'Code Review',
      'Env Setup',
      'Advanced Coding',
      'Agile',
      'MongoDB',
      'Mock MongoDB',
      'Documentation',
      'Markdown & Graphs',
    ],
    datasets: [
      {
        label: 'Skills',
        data: [
          80,
          90,
          70,
          60,
          50,
          80,
          85,
          75,
          65,
          40,
          50,
          60,
          70,
          75,
          65,
          40,
          50,
          80,
          90,
          70,
          60,
          50,
          80,
          85,
          75,
          65,
          55,
        ], // Sample data
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20 },
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
    <div className="radar-chart">
      <Radar data={data} options={options} />
    </div>
  );
}

export default RadarChart;
