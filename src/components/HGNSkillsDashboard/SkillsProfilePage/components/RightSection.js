import { useState } from 'react';
import ProfileDetails from './ProfileDetails';
import Skills from './Skills';
import RadarChart from './RadarChart';
import FrontendSkills from './FrontendSkills';
import BackendSkills from './BackendSkills';
import DeploymentSkills from './DeploymentSkills';
import SoftwarePractices from './SoftwarePractices';
import styles from '../styles/RightSection.module.css';

function RightSection({ profileData }) {
  const [selectedSkill, setSelectedSkill] = useState('Dashboard');

  const handleSkillClick = skill => {
    setSelectedSkill(skill); // Update selected skill
  };

  // Render the appropriate component based on selectedSkill
  const renderContent = () => {
    switch (selectedSkill) {
      case 'Dashboard':
        return <RadarChart profileData={profileData} />;
      case 'Frontend':
        return <FrontendSkills profileData={profileData} />;
      case 'Backend':
        return <BackendSkills profileData={profileData} />;
      case 'Deployment & DevOps':
        return <DeploymentSkills profileData={profileData} />;
      case 'Software Practices':
        return <SoftwarePractices profileData={profileData} />;
      default:
        return <RadarChart profileData={profileData} />;
    }
  };

  return (
    <div className={`${styles.rightSection}`}>
      <ProfileDetails profileData={profileData} />
      <div className={`${styles.skillsAndChart}`}>
        <Skills selectedSkill={selectedSkill} onSkillClick={handleSkillClick} />
        {renderContent()}
      </div>
    </div>
  );
}

export default RightSection;
