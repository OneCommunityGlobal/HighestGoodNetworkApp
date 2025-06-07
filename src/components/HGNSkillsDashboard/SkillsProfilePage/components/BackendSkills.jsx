import '../styles/SkillsSection.css';

function BackendSkills({ profileData }) {
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const backend = skillInfo.backend || {};
  const general = skillInfo.general || {};
  const frontend = skillInfo.frontend || {};

  const skills = [
    { value: backend.Overall, label: 'Overall Backend' },
    { value: general.mern_skills, label: 'MERN Stack' },
    { value: backend.TestDrivenDev, label: 'Test Driven Development' },
    { value: backend.Database, label: 'Database Setup' },
    { value: backend.MongoDB, label: 'MongoDB' },
    { value: backend.MongoDB_Advanced, label: 'MongoDB Advanced' },
    { value: frontend.UnitTest, label: 'Unit Testing' },
  ];

  // Function to determine color based on value
  const getColorClass = value => {
    const numValue = Number(value) || 0; // Convert to number, default to 0 if undefined
    if (numValue <= 4) return 'skill-value red';
    if (numValue <= 7) return 'skill-value orange';
    return 'skill-value green'; // 9-10
  };

  return (
    <div className="skill-section">
      <div className="skills-row">
        {skills.map(skill => (
          <div key={skill.label} className="skill-item">
            <span className={getColorClass(skill.value)}>{skill.value || 0}</span>
            <span className="skill-label">{skill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BackendSkills;
