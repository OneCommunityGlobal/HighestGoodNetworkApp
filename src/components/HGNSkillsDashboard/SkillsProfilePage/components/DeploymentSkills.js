import '../styles/SkillsSection.css';

function DeploymentSkills({ profileData }) {
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const backend = skillInfo.backend || {};

  const skills = [
    { value: backend.Deployment, label: 'Deployment (Azure, Docker, etc)' },
    { value: backend.VersionControl, label: 'Version Control' },
    { value: backend.EnvironmentSetup, label: 'Environment Setup (Windows / Linux)' },
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

export default DeploymentSkills;
