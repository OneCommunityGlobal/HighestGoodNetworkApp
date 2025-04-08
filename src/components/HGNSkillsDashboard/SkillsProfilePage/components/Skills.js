import '../styles/Skills.css';

function Skills({ selectedSkill, onSkillClick }) {
  const skills = ['Dashboard', 'Frontend', 'Backend', 'Deployment & DevOps', 'Software Practices'];

  return (
    <div className="skills">
      <h3>Skills</h3>
      {skills.map(skill => (
        <button
          key={skill}
          type="button"
          className={selectedSkill === skill ? 'selected' : ''}
          onClick={() => onSkillClick(skill)}
        >
          {skill}
        </button>
      ))}
    </div>
  );
}

export default Skills;
