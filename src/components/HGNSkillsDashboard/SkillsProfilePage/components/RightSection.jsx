import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../styles/RightSection.module.css';
import ProfileDetails from './ProfileDetails';
import Skills from './Skills';
import RadarChart from './RadarChart';
import FrontendSkills from './FrontendSkills';
import BackendSkills from './BackendSkills';
import DeploymentSkills from './DeploymentSkills';
import SoftwarePractices from './SoftwarePractices';
import AdditionalInfo from './AdditionalInfo';

/* function RightSection({ profileData }) { */
export default function RightSection() {
  const profileData = useSelector(state => state.userSkills.profileData);
  const darkMode = useSelector(s => s?.theme?.darkMode);

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
    <section className={`${styles.rightSection} ${darkMode ? styles.rightSectionDark : ''}`}>
      <ProfileDetails profileData={profileData} />
      <div className={`${styles.skillsAndChart} ${darkMode ? styles.skillsAndChartDark : ''}`}>
        <Skills selectedSkill={selectedSkill} onSkillClick={handleSkillClick} />
        {renderContent()}
      </div>
      <div className="workExperience-and-additionalInfo">
        <AdditionalInfo profileData={profileData} />
      </div>
    </section>
  );
}
