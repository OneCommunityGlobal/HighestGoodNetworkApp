import styles from '../styles/SkillsSummaryCards.module.css';

function SkillSummaryCards({ skillsData }) {
  if (!skillsData || skillsData.length === 0) {
    return null;
  }

  // Remove skills with score 0
  const validSkills = skillsData.filter(skill => skill.score > 0);

  if (validSkills.length === 0) {
    return null;
  }

  // Sort highest → lowest
  const sortedSkills = [...validSkills].sort((a, b) => b.score - a.score);

  // Top 3 highest
  const highestSkills = sortedSkills.slice(0, 3);

  // Top 3 lowest
  const lowestSkills = [...sortedSkills].reverse().slice(0, 3);

  return (
    <div className={styles.summaryWrapper}>
      {/* Highest Skills */}
      <div className={styles.group}>
        <h4 className={styles.groupTitle}>Highest-rated Skills</h4>

        {highestSkills.map(skill => (
          <div key={skill.label} className={styles.card}>
            <span className={styles.iconSuccess}>✔</span>
            <span className={styles.skillName}>{skill.label}</span>
            <span className={styles.score}>{skill.score}</span>
          </div>
        ))}
      </div>

      {/* Lowest Skills */}
      <div className={styles.group}>
        <h4 className={styles.groupTitle}>Lowest-rated Skills</h4>

        {lowestSkills.map(skill => (
          <div key={skill.label} className={styles.card}>
            <span className={styles.iconWarning}>▼</span>
            <span className={styles.skillName}>{skill.label}</span>
            <span className={styles.score}>{skill.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillSummaryCards;
