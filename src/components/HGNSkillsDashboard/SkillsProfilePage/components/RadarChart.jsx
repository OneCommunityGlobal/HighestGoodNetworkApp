import { Radar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useEffect } from 'react';
import styles from '../styles/RadarChart.module.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const SKILL_MAPPINGS = [
  {
    label: 'Leadership Experience',
    shortLabel: 'Leadership Exp',
    value: (general, frontend, backend) => general?.leadership_experience || 0,
    description: 'Experience in leading teams and managing projects',
  },
  {
    label: 'Leadership Skills',
    value: (general, frontend, backend) => general?.leadership_skills || 0,
    description: 'Skills in team leadership and management',
  },
  {
    label: 'Frontend and Backend Overall',
    shortLabel: 'Frontend & Backend Overall',
    value: (general, frontend, backend) => general?.combined_frontend_backend || 0,
    description: 'Combined proficiency in frontend and backend development',
  },
  {
    label: 'Figma',
    value: (general, frontend, backend) => frontend?.UIUXTools || 0,
    description: 'Proficiency with Figma and UI/UX design tools',
  },
  {
    label: 'Responsive UI',
    value: (general, frontend, backend) => frontend?.ResponsiveUI || 0,
    description: 'Skills in creating responsive user interfaces',
  },
  {
    label: 'HTML Semantics',
    value: (general, frontend, backend) => frontend?.HTML || 0,
    description: 'Understanding of semantic HTML and accessibility',
  },
  {
    label: 'Bootstrap',
    value: (general, frontend, backend) => frontend?.Bootstrap || 0,
    description: 'Proficiency with Bootstrap CSS framework',
  },
  {
    label: 'CSS Advanced',
    value: (general, frontend, backend) => frontend?.CSS || 0,
    description: 'Advanced CSS techniques and modern styling',
  },
  {
    label: 'React Advanced',
    value: (general, frontend, backend) => frontend?.React || 0,
    description: 'Advanced React.js development skills',
  },
  {
    label: 'Redux',
    value: (general, frontend, backend) => frontend?.Redux || 0,
    description: 'State management with Redux',
  },
  {
    label: 'Web Sockets',
    value: (general, frontend, backend) => frontend?.WebSocketCom || 0,
    description: 'Real-time communication with WebSockets',
  },
  {
    label: 'Frontend Overall',
    value: (general, frontend, backend) => frontend?.overall || 0,
    description: 'Overall frontend development proficiency',
  },
  {
    label: 'Backend Overall',
    value: (general, frontend, backend) => backend?.Overall || backend?.overall || 0,
    description: 'Overall backend development proficiency',
  },
  {
    label: 'MERN Stack',
    value: (general, frontend, backend) => general?.mern_skills || 0,
    description: 'MongoDB, Express, React, Node.js stack proficiency',
  },
  {
    label: 'TDD Backend',
    value: (general, frontend, backend) => backend?.TestDrivenDev || 0,
    description: 'Test-driven development practices for backend',
  },
  {
    label: 'Database',
    value: (general, frontend, backend) => backend?.Database || 0,
    description: 'Database design and management skills',
  },
  {
    label: 'Testing',
    value: (general, frontend, backend) => frontend?.UnitTest || backend?.Testing || 0,
    description: 'Unit testing and testing methodologies',
  },
  {
    label: 'Deployment',
    value: (general, frontend, backend) => backend?.Deployment || 0,
    description: 'Application deployment and DevOps practices',
  },
  {
    label: 'Version Control',
    value: (general, frontend, backend) => backend?.VersionControl || 0,
    description: 'Git and version control system proficiency',
  },
  {
    label: 'Code Review',
    value: (general, frontend, backend) => backend?.CodeReview || 0,
    description: 'Code review processes and best practices',
  },
  {
    label: 'Environment Setup',
    shortLabel: 'Env Setup',
    value: (general, frontend, backend) => backend?.EnvironmentSetup || 0,
    description: 'Development environment configuration',
  },
  {
    label: 'Advanced Coding',
    value: (general, frontend, backend) => backend?.AdvancedCoding || 0,
    description: 'Advanced programming techniques and patterns',
  },
  {
    label: 'Agile',
    value: (general, frontend, backend) => backend?.AgileDevelopment || 0,
    description: 'Agile development methodologies (Scrum, Kanban)',
  },
  {
    label: 'Mongo DB',
    shortLabel: 'MongoDB',
    value: (general, frontend, backend) => backend?.MongoDB || 0,
    description: 'MongoDB database operations and design',
  },
  {
    label: 'Mock Mongo DB',
    shortLabel: 'Mock MongoDB',
    value: (general, frontend, backend) => backend?.MongoDB_Advanced || backend?.MockMongoDB || 0,
    description: 'Advanced MongoDB features and mocking techniques',
  },
  {
    label: 'Documentation',
    value: (general, frontend, backend) => frontend?.Documentation || 0,
    description: 'Technical documentation and API documentation',
  },
  {
    label: 'Markdown & Graphs',
    value: (general, frontend, backend) => frontend?.Documentation || general?.markdown_graphs || 0,
    description: 'Markdown writing and data visualization with graphs',
  },
];

function RadarChart({ profileData, compact = true }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [skillsData, setSkillsData] = useState([]);

  useEffect(() => {
    try {
      setIsLoading(true);
      setHasError(false);

      const safeProfileData = profileData || {};
      const skillInfo = safeProfileData.skillInfo || {};
      const general = skillInfo.general || {};
      const frontend = skillInfo.frontend || {};
      const backend = skillInfo.backend || {};

      const hasData =
        Object.keys(general).length > 0 ||
        Object.keys(frontend).length > 0 ||
        Object.keys(backend).length > 0;

      if (!hasData && profileData) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      const processedData = SKILL_MAPPINGS.map(skill => {
        const value = skill.value(general, frontend, backend);
        return {
          ...skill,
          score: Math.max(0, Math.min(10, parseInt(value) || 0)),
        };
      });

      setSkillsData(processedData);
      setIsLoading(false);
    } catch (error) {
      setHasError(true);
      setIsLoading(false);
    }
  }, [profileData]);

  if (isLoading) {
    return (
      <div className={`${styles.radarChart} ${styles.loading}`}>
        <div className={`${styles.loadingSpinner}`}></div>
        <p style={{ marginTop: '15px', color: '#666' }}>Loading skills data...</p>
      </div>
    );
  }

  if (hasError || skillsData.length === 0) {
    return (
      <div className={`${styles.radarChart}`}>
        <div className={`${styles.errorState}`}>
          <h4>Skills Data Unavailable</h4>
          <p>Please complete the skills survey to view your radar chart.</p>
          <p style={{ marginTop: '10px', fontSize: '12px' }}>
            {hasError ? 'Error loading data' : 'No survey data found'}
          </p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: skillsData.map(skill => (compact ? skill.shortLabel || skill.label : skill.label)),
    datasets: [
      {
        label: 'Skills',
        data: SKILL_MAPPINGS.map(skill => {
          const source = skill.value(general) ?? skill.value(frontend) ?? skill.value(backend) ?? 0;
          return source;
        }),
        backgroundColor: 'rgba(37, 99, 235, 0.16)',
        borderColor: '#2563eb',
        borderWidth: 2,
        pointBackgroundColor: '#1d4ed8',
        pointBorderColor: '#eff6ff',
        pointHoverBackgroundColor: '#eff6ff',
        pointHoverBorderColor: '#1d4ed8',
      },
    ],
  };

  const customTooltipPlugin = {
    id: 'customTooltip',
    afterDraw: chart => {
      const tooltip = chart.tooltip;
      if (tooltip && tooltip.opacity === 0) {
        return;
      }
    },
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: compact ? 'rgba(0,0,0,0.08)' : 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: compact ? 'rgba(0,0,0,0.08)' : 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: function(context) {
              const w = context.chart.width;
              // Slightly smaller sizes to fit reduced chart
              if (w < 340) return 8;
              if (w < 480) return 9;
              if (w < 640) return 10;
              return 11;
            },
            weight: '500',
          },
          color: compact ? '#555' : '#333',
          padding: compact ? 10 : 15,
          callback: function(value, index) {
            // Truncate long labels on small screens
            if (window.innerWidth < 600 && value.length > 15) {
              return value.substring(0, 12) + '...';
            }
            return value;
          },
        },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          stepSize: 2,
          display: false,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(62, 160, 203, 1)',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            return skillsData[index].label;
          },
          label: function(context) {
            const score = context.parsed.r;
            const index = context.dataIndex;
            const description = skillsData[index].description;
            return [`Score: ${score}/10`, '', description];
          },
        },
        filter: function(tooltipItem) {
          return tooltipItem.parsed.r > 0;
        },
      },
      datalabels: {
        display: false,
      },
    },
    interaction: {
      intersect: false,
      mode: 'point',
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className={`${styles.radarChart} ${darkMode ? 'dark-mode' : ''}`}>
      <Radar data={chartData} options={chartOptions} />
    </div>
  );
}

export default RadarChart;
