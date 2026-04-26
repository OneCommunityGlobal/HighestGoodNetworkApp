import styles from '../styles/SkillsSection.module.css';

export const getColorClass = value => {
  const numValue = Number(value) || 0; // Convert to number, default to 0 if undefined
  if (numValue <= 4) return `${styles.skillValue} ${styles.red}`;
  if (numValue <= 7) return `${styles.skillValue} ${styles.orange}`;
  return `${styles.skillValue} ${styles.green}`; // 9-10
};
