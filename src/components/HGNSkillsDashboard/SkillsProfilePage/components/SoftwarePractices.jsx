import '../styles/SkillsSection.css';

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

export default SoftwarePractices;
