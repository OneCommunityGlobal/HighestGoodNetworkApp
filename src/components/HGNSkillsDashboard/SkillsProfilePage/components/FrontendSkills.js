import '../styles/SkillsSection.css';

function FrontendSkills({ profileData }) {
  const safeProfileData = profileData || {};
  const skillInfo = safeProfileData.skillInfo || {};
  const frontend = skillInfo.frontend || {};

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

export default FrontendSkills;
