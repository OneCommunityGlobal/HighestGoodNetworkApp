import { useState } from 'react';
import { useSelector } from 'react-redux';
import Accordion from './Accordion';
import { PreferenceFilterButtons, SkillFilterButtons } from './FilterButtons';
import RankedUserList from './RankedUserList';
import SearchBar from './SearchBar';
import styles from './style/CommunityMembersPage.module.css';

function CommunityMembersPage() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleSortByChange = event => setSortBy(event.target.value);
  const handleSortOrderChange = event => setSortOrder(event.target.value);

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <h1 className={`${styles.title}`}>Community Member Filters</h1>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} darkMode={darkMode} />

      <div className={styles.toolbar}>
        <label htmlFor="communitySortBy" className={styles.sortLabel}>
          Sort by:
        </label>
        <select
          id="communitySortBy"
          className={styles.sortSelect}
          value={sortBy}
          onChange={handleSortByChange}
        >
          <option value="name">Name</option>
          <option value="score">Score</option>
        </select>

        <label htmlFor="communitySortOrder" className={styles.sortLabel}>
          Order:
        </label>
        <select
          id="communitySortOrder"
          className={styles.sortSelect}
          value={sortOrder}
          onChange={handleSortOrderChange}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
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
        <RankedUserList
          selectedSkills={selectedSkills}
          selectedPreferences={selectedPreferences}
          searchQuery={searchQuery.trim()}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}

export default CommunityMembersPage;
