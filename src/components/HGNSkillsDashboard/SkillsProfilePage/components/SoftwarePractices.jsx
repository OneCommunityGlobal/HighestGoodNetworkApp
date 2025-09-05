import styles from '../styles/SkillsSection.module.css';

function SoftwarePractices({ profileData }) {
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
            <span className={`${styles.skillLabel}`}>{skill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SoftwarePractices;
