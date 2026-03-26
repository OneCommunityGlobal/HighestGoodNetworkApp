export const availableSkills = [
  'combined_frontend_backend',
  'mern_skills',
  'leadership_skills',
  'HTML',
  'Bootstrap',
  'CSS',
  'React',
  'Redux',
  'WebSocketCom',
  'ResponsiveUI',
  'UnitTest',
  'Documentation',
  'UIUXTools',
  'Database',
  'MongoDB',
  'MongoDB_Advanced',
  'TestDrivenDev',
  'Deployment',
  'VersionControl',
  'CodeReview',
  'EnvironmentSetup',
  'AdvancedCoding',
  'AgileDevelopment',
];

export const availablePreferences = [
  'Design',
  'Backend',
  'Frontend',
  'Management',
  'Testing',
  'Deployment',
  'No Preference',
];

export const formatSkillName = key => {
  switch (key) {
    case 'combined_frontend_backend':
      return 'Frontend/Backend';
    case 'mern_skills':
      return 'MERN';
    case 'leadership_skills':
      return 'Leadership';
    case 'MongoDB_Advanced':
      return 'Advanced MongoDB';
    case 'UIUXTools':
      return 'UI/UX';
    case 'TestDrivenDev':
      return 'TDD';
    case 'ResponsiveUI':
      return 'Responsive UI';
    case 'MongoDB':
    case 'HTML':
    case 'CSS':
      return key;
    default:
      let formatted = key.replace(/([A-Z])/g, ' $1').trim();
      formatted = formatted.replace(/_/g, ' ');
      formatted = formatted
        .toLowerCase()
        .split(' ')
        .map(word => (word.length === 0 ? '' : word.charAt(0).toUpperCase() + word.slice(1)))
        .join(' ');
      formatted = formatted.replace('Web Socket Com', 'WebSocket Comm');
      formatted = formatted.replace('Unit Test', 'Unit Testing');
      return formatted;
  }
};
