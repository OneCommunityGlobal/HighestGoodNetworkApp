import { useSelector } from 'react-redux';
import styles from '../styles/SkillsSection.module.css';
import { getColorClass } from '../utils/skillUtils';

function SoftwarePractices({ profileData }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const backend = skillInfo.backend || {};
  const general = skillInfo.general || {};
  const frontend = skillInfo.frontend || {};

  const skills = [
    { value: backend.CodeReview, label: 'Code Review Skills' },
    { value: backend.AgileDevelopment, label: 'Agile Development (Jira, Bamboo)' },
    { value: frontend.Documentation, label: 'Docs & Markdown' },
    { value: general.leadership_experience, label: 'Leadership / Management Experience' },
    { value: general.leadership_skills, label: 'Leadership / Management Skills' },
    { value: backend.AdvancedCoding, label: 'Advanced Coding Skills' },
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

export default SoftwarePractices;
