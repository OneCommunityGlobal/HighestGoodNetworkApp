import { useState } from 'react';
import '../styles/Skills.css';

function Skills() {
  const skills = ['Dashboard', 'Frontend', 'Backend', 'Deployment & DevOps', 'Software Practices'];

  // State to track the selected skill, defaulting to "Dashboard"
  const [selectedSkill, setSelectedSkill] = useState('Dashboard');

  const handleSkillClick = skill => {
    setSelectedSkill(skill); // Update selected skill on click
    alert(`Navigating to ${skill} section`); // Replace with actual navigation logic
  };

  return (
    <div className="skills">
      <h3>Skills</h3>
      {skills.map(skill => (
        <button
          key={skill}
          className={selectedSkill === skill ? 'selected' : ''}
          onClick={() => handleSkillClick(skill)}
        >
          {skill}
        </button>
      ))}
    </div>
  );
}

export default Skills;
