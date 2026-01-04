import { useSelector } from 'react-redux';
import styles from '../styles/SkillsSection.module.css';

function BackendSkills({ profileData }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const backend = skillInfo.backend || {};
  const general = skillInfo.general || {};
  const frontend = skillInfo.frontend || {};

  const skills = [
    { value: backend.Overall, label: 'Overall Backend' },
    { value: general.mern_skills, label: 'MERN Stack' },
    { value: backend.TestDrivenDev, label: 'Test Driven Development' },
    { value: backend.Database, label: 'Database Setup' },
    { value: backend.MongoDB, label: 'MongoDB' },
    { value: backend.MongoDB_Advanced, label: 'MongoDB Advanced' },
    { value: frontend.UnitTest, label: 'Unit Testing' },
  ];

  // Function to determine color based on value
  const getColorClass = value => {
    const numValue = Number(value) || 0; // Convert to number, default to 0 if undefined
    if (numValue <= 4) return `${styles.skillValue} ${styles.red}`;
    if (numValue <= 7) return `${styles.skillValue} ${styles.orange}`;
    return `${styles.skillValue} ${styles.green}`; // 9-10
  };

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

export default BackendSkills;
