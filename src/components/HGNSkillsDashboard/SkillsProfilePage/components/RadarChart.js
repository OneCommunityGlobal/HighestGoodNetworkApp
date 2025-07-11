import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
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
import { Spinner } from 'reactstrap';
import { ENDPOINTS } from 'utils/URL';
import styles from '../styles/RadarChart.module.css';


ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);


// Define skill mappings: label -> data source
const SKILL_MAPPINGS = [
  { label: 'Leadership Exp', section: 'general', key: 'leadership_experience' },
  { label: 'Leadership Skills', section: 'general', key: 'leadership_skills' },
  { label: 'Frontend & Backend Overall', section: 'general', key: 'combined_frontend_backend' },
  { label: 'MERN Stack', section: 'general', key: 'mern_skills' },
  { label: 'Frontend', section: 'frontend', key: 'overall' },
  { label: 'Figma', section: 'frontend', key: 'UIUXTools' },
  { label: 'Responsive UI', section: 'frontend', key: 'ResponsiveUI' },
  { label: 'HTML Semantics', section: 'frontend', key: 'HTML' },
  { label: 'Bootstrap', section: 'frontend', key: 'Bootstrap' },
  { label: 'CSS Advanced', section: 'frontend', key: 'CSS' },
  { label: 'React Advanced', section: 'frontend', key: 'React' },
  { label: 'Redux', section: 'frontend', key: 'Redux' },
  { label: 'Documentation', section: 'frontend', key: 'Documentation' },
  { label: 'Web Sockets', section: 'frontend', key: 'WebSocketCom' },
  { label: 'Testing', section: 'frontend', key: 'UnitTest' },
  { label: 'Backend', section: 'backend', key: 'overall' },
  { label: 'TDD', section: 'backend', key: 'TestDrivenDev' },
  { label: 'Database', section: 'backend', key: 'Database' },
  { label: 'MongoDB', section: 'backend', key: 'MongoDB' },
  { label: 'MongoDB Advanced', section: 'backend', key: 'MongoDB_Advanced' },
  { label: 'Deployment', section: 'backend', key: 'Deployment' },
  { label: 'Version Control', section: 'backend', key: 'VersionControl' },
  { label: 'Code Review', section: 'backend', key: 'CodeReview' },
  { label: 'Env Setup', section: 'backend', key: 'EnvironmentSetup' },
  { label: 'Advanced Coding', section: 'backend', key: 'AdvancedCoding' },
  { label: 'Agile', section: 'backend', key: 'AgileDevelopment' },
];


function RadarChart({ profileData, darkMode }) {
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const general = skillInfo.general || {};
  const frontend = skillInfo.frontend || {};
  const backend = skillInfo.backend || {};


  const [userSkillsData, setUserSkillsData] = useState(null);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const currentUser = useSelector(state => state.auth.user);


  const fetchUserSkills = async () => {
    try {
      setSkillsLoading(true);
      const response = await axios.get(`${ENDPOINTS.HGN_FORM_SUBMIT}`, {
        params: { skillsOnly: true },
      });
      const userSurveyData = response.data.find(
        user => user.userInfo?.email?.toLowerCase() === currentUser.email?.toLowerCase(),
      );


      if (userSurveyData) {
        setUserSkillsData(userSurveyData);
      }
    } catch (error) {
      toast.error('Failed to load skills data.');
    } finally {
      setSkillsLoading(false);
    }
  };


  useEffect(() => {
    if (currentUser?.email) {
      fetchUserSkills();
    } else {
      setSkillsLoading(false);
    }
  }, [currentUser]);


  // get skill value from current data submitted
  const getSkillValue = (section, key) => {
    let value = 0;


    // user survey data first
    if (userSkillsData) {
      if (userSkillsData[section] && userSkillsData[section][key] !== undefined) {
        value = Number(userSkillsData[section][key]) || 0;
        return value;
      }
    }


    // Fall back to profile data
    const profileSections = { general, frontend, backend };
    if (profileSections[section] && profileSections[section][key] !== undefined) {
      value = Number(profileSections[section][key]) || 0;
    }


    return value;
  };


  // dynamic chart data
 const getChartData = () => {
    const data = SKILL_MAPPINGS.map(skill => {
      const value = getSkillValue(skill.section, skill.key);
      console.log(`${skill.label}: ${value}`); // Debug log
      return value;
    });

    console.log('Chart data:', data); // Debug log
    console.log('Profile data:', profileData); // Debug log

    return {
      labels: SKILL_MAPPINGS.map(skill => skill.label),
      datasets: [
        {
          label: 'Skills (Profile Data)',
          data: data,
          backgroundColor: darkMode ? 'rgba(160, 240, 232, 0.2)' : 'rgba(160, 240, 232, 0.2)',
          borderColor: darkMode ? 'rgb(107, 234, 232)' : 'rgb(107, 234, 232)',
          borderWidth: 2,
          pointBackgroundColor: darkMode ? 'rgb(107, 234, 232)' : 'rgb(107, 234, 232)',
          pointBorderColor: darkMode ? '#232b39' : '#fff',
          pointHoverBackgroundColor: darkMode ? '#232b39' : '#fff',
          pointHoverBorderColor: darkMode ? 'rgb(107, 234, 232)' : 'rgb(107, 234, 232)',
          pointRadius: 4, 
          pointHoverRadius: 6,
        },
      ],
    };
  };



  const chartOptions = {
    scales: {
      r: {
        angleLines: { 
          color: darkMode ? '#4a5568' : '#e2e8f0',
          lineWidth: 1,
          suggestedMin: 0,
          suggestedMax: 10,
        },
        grid: { 
          color: darkMode ? '#4a5568' : '#e2e8f0',
          lineWidth: 1
        },
        pointLabels: {
          color: darkMode ? '#f7fafc' : '#2d3748',
          font: { size: 10 },
        },
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: darkMode ? '#f7fafc' : '#2d3748',
          backdropColor: 'transparent',
          callback(value) {
            return value;
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: darkMode ? '#f7fafc' : '#2d3748',
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#232b39' : '#fff',
        titleColor: darkMode ? '#f7fafc' : '#2d3748',
        bodyColor: darkMode ? '#f7fafc' : '#2d3748',
        borderColor: darkMode ? '#4a5568' : '#e2e8f0',
        borderWidth: 1,
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${context.parsed.r}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 2,
      },
    },
  };

  if (skillsLoading) {
    return (
      <div className={`${styles.radarChart} ${styles.loading}`}>
        <div className="d-flex justify-content-center align-items-center h-200">
          <Spinner size="sm" color="primary" />
          <span className="ms-2">Loading skills data...</span>
        </div>
      </div>
    );
  }


  return (
      <div
    className={`${styles.radarChart}`}
    style={{
      width: '500px', 
      height: '500px', 
      margin: '0 auto',
      background: darkMode ? '#232b39' : '#fff',
      color: darkMode ? '#f7fafc' : '#2d3748',
      borderRadius: '12px',
      transition: 'background 0.3s, color 0.3s',
    }}
  >
      {userSkillsData && <div className={`${styles.dataSourceIndicator}`} />}
      <Radar data={getChartData()} options={chartOptions} />
    </div>
  );
}


export default RadarChart;

