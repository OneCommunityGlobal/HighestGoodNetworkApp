import { useState } from 'react';
import { useSelector } from 'react-redux';
import { availablePreferences, availableSkills, formatSkillName } from './FilerData.js';
import RankedUserList from './RankedUserList';
import styles from './style/CommunityMembersPage.module.css';

function Accordion({ title, children, defaultOpen = false, darkMode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${styles.accordion}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(prev => !prev)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(prev => !prev)}
        className={`${styles.accordionHeader} ${darkMode ? styles.dark : ''}`}
      >
        <span className={`${styles.accordionTitle}`}>{title}</span>
        <span className={`${styles.accordionIcon}`}>{open ? '−' : '+'}</span>
      </div>
      {open && <div className={`${styles.accordionContent}`}>{children}</div>}
    </div>
  );
}

function CommunityMembersPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);

  const toggleItem = (item, selectedArray, setSelectedArray) => {
    setSelectedArray(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item],
    );
  };

  const renderSkillButtons = () => (
    <div className={`${styles.filterGroup}`}>
      {availableSkills.map(skillKey => {
        const formattedName = formatSkillName(skillKey);
        const isSelected = selectedSkills.includes(skillKey);
        return (
          <button
            key={skillKey}
            onClick={() => toggleItem(skillKey, selectedSkills, setSelectedSkills)}
            type="button"
            className={`${styles.skillButton} ${isSelected ? styles.selected : ''}`}
          >
            {formattedName}
          </button>
        );
      })}
    </div>
  );

  const renderPreferenceButtons = () => (
    <div className={`${styles.filterGroup}`}>
      {availablePreferences.map(pref => {
        const isSelected = selectedPreferences.includes(pref);
        return (
          <button
            key={pref}
            onClick={() => toggleItem(pref, selectedPreferences, setSelectedPreferences)}
            type="button"
            className={`${styles.preferenceButton} ${isSelected ? styles.selected : ''}`}
          >
            {pref}
          </button>
        );
      })}
    </div>
  );

  const hasFilters =
    selectedSkills.length > 0 || selectedPreferences.length > 0 || searchQuery.trim().length > 0;

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <h1 className={`${styles.title}`}>Community Member Filters</h1>

      {/* Search Bar */}
      <div className={`${styles.searchContainer} ${darkMode ? styles.darkSearch : ''}`}>
        <input
          type="text"
          placeholder="Search members by name or skill..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`${styles.searchInput} ${darkMode ? styles.darkSearchInput : ''}`}
        />
        {searchQuery && (
          <button
            type="button"
            className={`${styles.clearButton} ${darkMode ? styles.darkClearButton : ''}`}
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      <Accordion title="Filter by Skills" defaultOpen darkMode={darkMode}>
        {renderSkillButtons()}
      </Accordion>

      <Accordion title="Filter by Preferences" darkMode={darkMode}>
        {renderPreferenceButtons()}
      </Accordion>

      <div>
        {hasFilters ? (
          <RankedUserList
            selectedSkills={selectedSkills}
            selectedPreferences={selectedPreferences}
            searchQuery={searchQuery.trim()}
          />
        ) : (
          <p className={`${styles.message}`}>
            Search or select skills and preferences above to see filtered members.
          </p>
        )}
      </div>
    </div>
  );
}

export default CommunityMembersPage;
