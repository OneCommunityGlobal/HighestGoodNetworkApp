import { useSelector } from 'react-redux';
import styles from '../styles/SkillsSection.module.css';
import { getColorClass } from '../utils/skillUtils';

function DeploymentSkills({ profileData }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const backend = skillInfo.backend || {};

  const skills = [
    { value: backend.Deployment, label: 'Deployment (Azure, Docker, etc)' },
    { value: backend.VersionControl, label: 'Version Control' },
    { value: backend.EnvironmentSetup, label: 'Environment Setup (Windows / Linux)' },
  ];

  return (
    <div className={`${styles.skillSection} ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`${styles.skillsRow}`}>
        {skills.map(skill => (
          <div key={skill.label} className={`${styles.skillItem}`}>
            <span className={getColorClass(skill.value)}>{skill.value || 0}</span>
            <span className={`${styles.skillLabel}`}>{skill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeploymentSkills;
