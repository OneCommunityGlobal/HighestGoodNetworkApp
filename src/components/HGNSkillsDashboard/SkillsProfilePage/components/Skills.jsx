import { useSelector } from 'react-redux';
import styles from '../styles/Skills.module.css';

function Skills({ selectedSkill, onSkillClick }) {
  const skills = ['Dashboard', 'Frontend', 'Backend', 'Deployment & DevOps', 'Software Practices'];
  const darkMode = useSelector(state => state?.theme?.darkMode);

  return (
    <div className={`${styles.skills} ${darkMode ? styles.darkMode : ''}`}>
      <h3>Skills</h3>
      {skills.map(skill => (
        <button
          key={skill}
          type="button"
          className={`${styles.skillsButton} ${selectedSkill === skill ? styles.selected : ''}`}
          onClick={() => onSkillClick(skill)}
        >
          {skill}
        </button>
      ))}
    </div>
  );
}

export default Skills;
