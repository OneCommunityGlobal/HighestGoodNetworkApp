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
  const darkMode = useSelector(state => state.theme.darkMode);

  const hasFilters =
    selectedSkills.length > 0 || selectedPreferences.length > 0 || searchQuery.trim().length > 0;

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <h1 className={`${styles.title}`}>Community Member Filters</h1>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} darkMode={darkMode} />

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
