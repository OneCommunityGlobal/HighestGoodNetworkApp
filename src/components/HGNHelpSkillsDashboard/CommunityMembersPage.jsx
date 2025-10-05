// CommunityMembersPage.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import RankedUserList from './RankedUserList';
import styles from './style/CommunityMembersPage.module.css';

const availableSkills = [
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

const availablePreferences = ['Design', 'Backend', 'Frontend', 'Management', 'Testing'];

const formatSkillName = key => {
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

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg mb-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(prev => !prev)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(prev => !prev)}
        className="w-full flex justify-between items-center px-4 py-3 cursor-pointer
                   select-none bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                   transition-colors"
      >
        <span className="font-semibold">{title}</span>
        <span className="text-xl leading-none">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}

function CommunityMembersPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const darkMode = useSelector(state => state.theme.darkMode);

  const toggleItem = (item, selectedArray, setSelectedArray) => {
    setSelectedArray(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item],
    );
  };

  const renderSkillButtons = () => (
    <div className="flex flex-wrap gap-2">
      {availableSkills.map(skillKey => {
        const formattedName = formatSkillName(skillKey);
        const isSelected = selectedSkills.includes(skillKey);
        return (
          <button
            key={skillKey}
            onClick={() => toggleItem(skillKey, selectedSkills, setSelectedSkills)}
            type="button"
            className={`px-3 py-1 rounded-full text-sm border transition
              ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300'
              }`}
          >
            {formattedName}
          </button>
        );
      })}
    </div>
  );

  const renderPreferenceButtons = () => (
    <div className="flex flex-wrap gap-2">
      {availablePreferences.map(pref => {
        const isSelected = selectedPreferences.includes(pref);
        return (
          <button
            key={pref}
            onClick={() => toggleItem(pref, selectedPreferences, setSelectedPreferences)}
            type="button"
            className={`px-3 py-1 rounded-full text-sm border transition
              ${
                isSelected
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300'
              }`}
          >
            {pref}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`${darkMode ? styles.darkMode : ''} max-w-4xl mx-auto px-4`}>
      <h1 className="text-2xl font-bold mb-6 text-center">Community Member Filters</h1>

      <Accordion title="Filter by Skills" defaultOpen>
        {renderSkillButtons()}
      </Accordion>

      <Accordion title="Filter by Preferences">{renderPreferenceButtons()}</Accordion>

      <div className="mt-6">
        {selectedSkills.length > 0 || selectedPreferences.length > 0 ? (
          <RankedUserList
            selectedSkills={selectedSkills}
            selectedPreferences={selectedPreferences}
          />
        ) : (
          <p className={styles.message}>
            Select skills or preferences above to see filtered members.
          </p>
        )}
      </div>
    </div>
  );
}

export default CommunityMembersPage;
