import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Accordion from './Accordion';
import { PreferenceFilterButtons, SkillFilterButtons } from './FilterButtons';
import RankedUserList from './RankedUserList';
import SearchBar from './SearchBar';
import styles from './style/CommunityMembersPage.module.css';

function CommunityMembersPage() {
  const location = useLocation();
  const [selectedSkills, setSelectedSkills] = useState(location.state?.initialSkills || []);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleSortOrderChange = event => setSortOrder(event.target.value);

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <h1 className={`${styles.title}`}>Community Member Filters</h1>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} darkMode={darkMode} />

      <div className={styles.toolbar}>
        <label htmlFor="communitySortOrder" className={styles.sortLabel}>
          Sort by name:
        </label>
        <select
          id="communitySortOrder"
          className={styles.sortSelect}
          value={sortOrder}
          onChange={handleSortOrderChange}
        >
          <option value="asc">A to Z</option>
          <option value="desc">Z to A</option>
        </select>
      </div>

      <Accordion title="Filter by Skills" defaultOpen darkMode={darkMode}>
        <SkillFilterButtons
          selectedSkills={selectedSkills}
          setSelectedSkills={setSelectedSkills}
          darkMode={darkMode}
        />
      </Accordion>

      <Accordion title="Filter by Preferences" darkMode={darkMode}>
        <PreferenceFilterButtons
          selectedPreferences={selectedPreferences}
          setSelectedPreferences={setSelectedPreferences}
          darkMode={darkMode}
        />
      </Accordion>

      <div>
        <RankedUserList
          selectedSkills={selectedSkills}
          selectedPreferences={selectedPreferences}
          searchQuery={searchQuery.trim()}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}

export default CommunityMembersPage;
