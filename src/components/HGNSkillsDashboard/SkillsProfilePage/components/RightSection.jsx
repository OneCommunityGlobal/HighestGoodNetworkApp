import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../styles/RightSection.module.css';
import AdditionalInfo from './AdditionalInfo';
import BackendSkills from './BackendSkills';
import DeploymentSkills from './DeploymentSkills';
import FrontendSkills from './FrontendSkills';
import ProfileDetails from './ProfileDetails';
import RadarChart from './RadarChart';
import Skills from './Skills';
import SoftwarePractices from './SoftwarePractices';

/* function RightSection({ profileData }) { */
function RightSection() {
  const profileData = useSelector(state => state.userSkills.profileData);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [selectedSkill, setSelectedSkill] = useState('Dashboard');

  const handleSkillClick = skill => {
    setSelectedSkill(skill); // Update selected skill
  };

  // Render the appropriate component based on selectedSkill
  const renderContent = () => {
    switch (selectedSkill) {
      case 'Dashboard':
        return <RadarChart key={selectedSkill} profileData={profileData} />;
      case 'Frontend':
        return <FrontendSkills profileData={profileData} />;
      case 'Backend':
        return <BackendSkills profileData={profileData} />;
      case 'Deployment & DevOps':
        return <DeploymentSkills profileData={profileData} />;
      case 'Software Practices':
        return <SoftwarePractices profileData={profileData} />;
      default:
        return <RadarChart key={selectedSkill} profileData={profileData} />;
    }
  };

  return (
    <div className={`${styles.rightSection} ${darkMode ? styles['dark-mode'] : ''}`}>
      <ProfileDetails profileData={profileData} />
      <div className={`${styles.skillsAndChart}`}>
        <Skills selectedSkill={selectedSkill} onSkillClick={handleSkillClick} />
        {renderContent()}
      </div>
      <div className="workExperience-and-additionalInfo">
        <AdditionalInfo profileData={profileData} />
      </div>
    </div>
  );
}

export default RightSection;
