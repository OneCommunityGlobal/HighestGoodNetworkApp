import styles from '../styles/Skills.module.css';
import { useSelector } from 'react-redux';
import { getFontColor } from '../../../../styles';

function Skills({ selectedSkill, onSkillClick }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const skills = ['Dashboard', 'Frontend', 'Backend', 'Deployment & DevOps', 'Software Practices'];

  return (
    <div className={`${styles.skills}`}>
      <h3 className={getFontColor(darkMode)}>Skills</h3>
      {skills.map(skill => (
        <button
          key={skill}
          type="button"
          className={`
            ${styles.skillsButton}
            ${selectedSkill === skill ? styles.selected : getFontColor(darkMode)}
            ${darkMode ? 'bg-yinmn-blue' : ''}
            `}
          onClick={() => onSkillClick(skill)}
        >
          {skill}
        </button>
      ))}
    </div>
  );
}

export default Skills;
