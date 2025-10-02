// CommunityMembersPage.jsx
import { useState } from 'react';
import RankedUserList from './RankedUserList';
import styles from './style/CommunityMembersPage.module.css';
import { useSelector } from 'react-redux';

const availableSkills = ['React', 'Redux', 'HTML', 'CSS', 'MongoDB', 'Database', 'JavaScript'];
const availablePreferences = ['Design', 'Backend', 'Frontend', 'Data', 'Agile', 'DevOps'];

function CommunityMembersPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const darkMode = useSelector(state => state.theme.darkMode);
  const toggleItem = (item, selectedArray, setSelectedArray) => {
    setSelectedArray(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item],
    );
  };

  const renderToggleButtons = (items, selectedItems, toggleFn) => (
    <div className={`${styles.toggleButtonsWrapper}`}>
      {items.map(item => {
        const isSelected = selectedItems.includes(item);
        return (
          <button
            key={item}
            onClick={() => toggleFn(item)}
            type="button"
            className={`${styles.toggleButton} ${isSelected ? styles.selected : ''}`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={darkMode ? `${styles.darkMode}` : ''}>
      <div className={`${styles.pageContainer}`}>
        <h2 className={`${styles.sectionTitle}`}>Filter Community Members by Skills</h2>
        {renderToggleButtons(availableSkills, selectedSkills, skill =>
          toggleItem(skill, selectedSkills, setSelectedSkills),
        )}

        <h2 className={`${styles.sectionTitle}`}>Filter by Preferences</h2>
        {renderToggleButtons(availablePreferences, selectedPreferences, pref =>
          toggleItem(pref, selectedPreferences, setSelectedPreferences),
        )}

        {selectedSkills.length > 0 || selectedPreferences.length > 0 ? (
          <RankedUserList
            selectedSkills={selectedSkills}
            selectedPreferences={selectedPreferences}
          />
        ) : (
          <p className={`${styles.message}`}>
            Select skills or preferences above to see filtered members.
          </p>
        )}
      </div>
    </div>
  );
}

export default CommunityMembersPage;
