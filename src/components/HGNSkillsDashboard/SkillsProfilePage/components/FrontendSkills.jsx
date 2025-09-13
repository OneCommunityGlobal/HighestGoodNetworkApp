import styles from '../styles/SkillsSection.module.css';
import { useSelector } from 'react-redux';
import { getFontColor } from '../../../../styles';

function FrontendSkills({ profileData }) {
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const frontend = skillInfo.frontend || {};
  const darkMode = useSelector(state => state.theme.darkMode);

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

  // Function to determine color based on value
  const getColorClass = value => {
    const numValue = Number(value) || 0; // Convert to number, default to 0 if undefined
    if (numValue <= 4) return `${styles.skillValue} ${styles.red}`;
    if (numValue <= 7) return `${styles.skillValue} ${styles.orange}`;
    return `${styles.skillValue} ${styles.green}`; // 9-10
  };

  return (
    <div className={`${styles.skillSection}`}>
      <div className={`${styles.skillsRow}`}>
        {skills.map(skill => (
          <div key={skill.label} className={`${styles.skillItem}`}>
            <span className={getColorClass(skill.value)}>{skill.value || 0}</span>
            <span className={`${styles.skillLabel} ${getFontColor(darkMode)}`}>{skill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FrontendSkills;
