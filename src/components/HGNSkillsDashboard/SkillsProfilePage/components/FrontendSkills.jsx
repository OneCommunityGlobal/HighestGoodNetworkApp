import { useSelector } from 'react-redux';
import styles from '../styles/SkillsSection.module.css';
import { getColorClass } from '../utils/skillUtils';

function FrontendSkills({ profileData }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const frontend = skillInfo.frontend || {};

  const skills = [
    { value: frontend.overall, label: 'Overall Frontend' },
    { value: frontend.HTML, label: 'HTML' },
    { value: frontend.CSS, label: 'CSS' },
    { value: frontend.Bootstrap, label: 'Bootstrap' },
    { value: frontend.React, label: 'React' },
    { value: frontend.Redux, label: 'Redux' },
    { value: frontend.UIUXTools, label: 'UI/UX Design' },
    { value: frontend.ResponsiveUI, label: 'Responsive UI' },
    { value: frontend.WebSocketCom, label: 'Web Sockets' },
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

export default FrontendSkills;
