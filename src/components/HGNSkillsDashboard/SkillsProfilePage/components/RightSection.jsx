import { useState } from 'react';
import ProfileDetails from './ProfileDetails';
import Skills from './Skills';
import RadarChart from './RadarChart';
import FrontendSkills from './FrontendSkills';
import BackendSkills from './BackendSkills';
import DeploymentSkills from './DeploymentSkills';
import SoftwarePractices from './SoftwarePractices';
import styles from '../styles/RightSection.module.css';

function RightSection({ profileData, darkMode }) {
  const [selectedSkill, setSelectedSkill] = useState('Dashboard');

  const handleSkillClick = skill => {
    setSelectedSkill(skill);
  };

  const renderContent = () => {
    switch (selectedSkill) {
      case 'Dashboard':
        return <RadarChart profileData={profileData} darkMode={darkMode} />;
      case 'Frontend':
        return <FrontendSkills profileData={profileData} darkMode={darkMode} />;
      case 'Backend':
        return <BackendSkills profileData={profileData} darkMode={darkMode} />;
      case 'Deployment & DevOps':
        return <DeploymentSkills profileData={profileData} darkMode={darkMode} />;
      case 'Software Practices':
        return <SoftwarePractices profileData={profileData} darkMode={darkMode} />;
      default:
        return <RadarChart profileData={profileData} darkMode={darkMode} />;
    }
  };

  return (
    <div
      className={`${styles.rightSection} ${darkMode ? styles.dark : ''}`}
      style={{
        background: darkMode ? '#303b4fff' : '#fff',
        color: darkMode ? '#f7fafc' : '#38445aff',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      <ProfileDetails profileData={profileData} darkMode={darkMode} />
      <div className={`${styles.skillsAndChart}`}>
        <Skills selectedSkill={selectedSkill} onSkillClick={handleSkillClick} darkMode={darkMode} />
        {renderContent()}
      </div>
    </div>
  );
}

export default RightSection;
