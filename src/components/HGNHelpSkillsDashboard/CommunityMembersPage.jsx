import { useState } from 'react';
import { useSelector } from 'react-redux';
import Accordion from './Accordion';
import { PreferenceFilterButtons, SkillFilterButtons } from './FilterButtons';
import RankedUserList from './RankedUserList';
import styles from './style/CommunityMembersPage.module.css';

function CommunityMembersPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);

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
        <SkillFilterButtons selectedSkills={selectedSkills} setSelectedSkills={setSelectedSkills} />
      </Accordion>

      <Accordion title="Filter by Preferences" darkMode={darkMode}>
        <PreferenceFilterButtons
          selectedPreferences={selectedPreferences}
          setSelectedPreferences={setSelectedPreferences}
        />
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
